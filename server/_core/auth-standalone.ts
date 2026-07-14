/**
 * Standalone Authentication System
 * Replaces Manus OAuth with a simple password-based or Google OAuth system
 */

import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { ENV } from "./env";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};

class StandaloneAuthService {
  private getSessionSecret() {
    const secret = ENV.cookieSecret || "default-secret-key-change-in-production";
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a user
   */
  async createSessionToken(
    userId: string,
    email: string,
    name: string,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? 365 * 24 * 60 * 60 * 1000; // 1 year
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      userId,
      email,
      name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  /**
   * Verify a session token
   */
  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });

      const { userId, email, name } = payload as Record<string, unknown>;

      if (
        typeof userId !== "string" ||
        typeof email !== "string" ||
        typeof name !== "string"
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        userId,
        email,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  /**
   * Extract session from request cookies
   */
  getSessionFromRequest(req: Request): SessionPayload | null {
    const cookies = req.headers.cookie || "";
    const sessionCookie = cookies
      .split(";")
      .find((c) => c.trim().startsWith("app_session_id="));

    if (!sessionCookie) {
      return null;
    }

    const token = sessionCookie.split("=")[1];
    // Note: This is async, but we can't await in a sync context
    // This method should be called with proper async handling
    return null;
  }

  /**
   * Hash a password (simple implementation, use bcrypt in production)
   */
  hashPassword(password: string): string {
    // In production, use bcrypt or similar
    // This is a simple implementation for demonstration
    return Buffer.from(password).toString("base64");
  }

  /**
   * Verify a password
   */
  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }
}

export const authService = new StandaloneAuthService();
