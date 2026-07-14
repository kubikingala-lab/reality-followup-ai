/**
 * Standalone OAuth Routes
 * Replaces Manus OAuth with simple password login and Google OAuth
 */

import type { Express, Request, Response } from "express";
import * as db from "../db";
import { authService } from "./auth-standalone";
import { getSessionCookieOptions } from "./cookies";

const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function registerStandaloneAuthRoutes(app: Express) {
  /**
   * Simple login endpoint - accepts email and password
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }

      // Get user from database
      const user = await db.getUserByEmail(email);

      if (!user) {
        // For demo purposes, create a new user if they don't exist
        // In production, you should have a proper user registration flow
        const newUser = await db.upsertUser({
          openId: `user-${Date.now()}`,
          email,
          name: email.split("@")[0],
          loginMethod: "password",
          lastSignedIn: new Date(),
        });

        const sessionToken = await authService.createSessionToken(
          newUser.openId || "",
          email,
          newUser.name || ""
        );

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        res.json({ success: true, user: newUser });
        return;
      }

      // Verify password (in production, use bcrypt)
      const passwordHash = authService.hashPassword(password);
      if (
        !user.passwordHash ||
        !authService.verifyPassword(password, user.passwordHash)
      ) {
        res.status(401).json({ error: "invalid email or password" });
        return;
      }

      // Create session
      const sessionToken = await authService.createSessionToken(
        user.openId || "",
        user.email || "",
        user.name || ""
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * Logout endpoint
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, { path: "/", secure: true, sameSite: "none" });
    res.json({ success: true });
  });

  /**
   * Get current user endpoint
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const cookies = req.headers.cookie || "";
      const sessionCookie = cookies
        .split(";")
        .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));

      if (!sessionCookie) {
        res.status(401).json({ error: "not authenticated" });
        return;
      }

      const token = sessionCookie.split("=")[1];
      const session = await authService.verifySession(token);

      if (!session) {
        res.status(401).json({ error: "invalid session" });
        return;
      }

      const user = await db.getUserByEmail(session.email);
      res.json({ user });
    } catch (error) {
      console.error("[Auth] Get me failed", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  /**
   * Google OAuth callback
   * This endpoint handles the callback from Google after user authentication
   */
  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;

      if (!code) {
        res.status(400).json({ error: "code is required" });
        return;
      }

      // Exchange code for token with Google
      const tokenResponse = await exchangeGoogleCode(code);
      const userInfo = await getGoogleUserInfo(tokenResponse.access_token);

      if (!userInfo.email) {
        res.status(400).json({ error: "email missing from Google user info" });
        return;
      }

      // Upsert user in database
      const user = await db.upsertUser({
        openId: `google-${userInfo.id}`,
        email: userInfo.email,
        name: userInfo.name || null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session
      const sessionToken = await authService.createSessionToken(
        user.openId || "",
        userInfo.email,
        userInfo.name || ""
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redirect to home page
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Google callback failed", error);
      res.status(500).json({ error: "Google OAuth callback failed" });
    }
  });
}

/**
 * Exchange Google authorization code for access token
 */
async function exchangeGoogleCode(code: string): Promise<{ access_token: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Google code for token");
  }

  return response.json();
}

/**
 * Get user info from Google
 */
async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
}> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to get Google user info");
  }

  return response.json();
}
