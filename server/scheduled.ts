import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { runCentralFollowUps } from "./services/followUps";

export async function runFollowUpsHandler(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    const user = await sdk.authenticateRequest(req);
    taskUid = user.taskUid;
    if (!user.isCron || !taskUid) return res.status(403).json({ error: "cron-only" });
    const result = await runCentralFollowUps(taskUid);
    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined, context: { url: req.originalUrl, taskUid }, timestamp: new Date().toISOString() });
  }
}
