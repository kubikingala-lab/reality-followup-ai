/**
 * Standalone Scheduler for Follow-ups
 * Replaces Manus Heartbeat with a simple Node.js-based scheduler
 */

import { ENV } from "./env";

export type ScheduledJob = {
  id: string;
  taskUid: string;
  ownerId: string;
  nextRunAt: Date;
  interval: number; // in milliseconds
  active: boolean;
};

class StandaloneScheduler {
  private jobs: Map<string, NodeJS.Timeout> = new Map();
  private jobData: Map<string, ScheduledJob> = new Map();

  /**
   * Create a scheduled job for follow-ups
   */
  async createScheduledJob(
    taskUid: string,
    ownerId: string,
    intervalMs: number = 3600000 // 1 hour default
  ): Promise<ScheduledJob> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: ScheduledJob = {
      id: jobId,
      taskUid,
      ownerId,
      nextRunAt: new Date(Date.now() + intervalMs),
      interval: intervalMs,
      active: true,
    };

    this.jobData.set(jobId, job);

    // Schedule the job
    this.scheduleJob(jobId, intervalMs);

    console.log(`[Scheduler] Created job ${jobId} for task ${taskUid}`);
    return job;
  }

  /**
   * Schedule a job to run at regular intervals
   */
  private scheduleJob(jobId: string, intervalMs: number): void {
    const timeout = setInterval(async () => {
      const job = this.jobData.get(jobId);
      if (!job || !job.active) {
        clearInterval(timeout);
        this.jobs.delete(jobId);
        return;
      }

      try {
        // Call the follow-up endpoint
        await this.executeFollowUp(job.taskUid, job.ownerId);
        job.nextRunAt = new Date(Date.now() + intervalMs);
      } catch (error) {
        console.error(
          `[Scheduler] Error executing follow-up for job ${jobId}:`,
          error
        );
      }
    }, intervalMs);

    this.jobs.set(jobId, timeout);
  }

  /**
   * Execute follow-up by calling the internal endpoint
   */
  private async executeFollowUp(taskUid: string, ownerId: string): Promise<void> {
    try {
      const baseUrl = process.env.APP_URL || `http://localhost:${ENV.port || 3000}`;
      const response = await fetch(`${baseUrl}/api/scheduled/followups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Scheduler-Secret": ENV.schedulerSecret || "default-secret",
        },
        body: JSON.stringify({
          taskUid,
          ownerId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Follow-up execution failed: ${response.status} ${response.statusText}`
        );
      }

      console.log(`[Scheduler] Follow-up executed for task ${taskUid}`);
    } catch (error) {
      console.error(`[Scheduler] Error executing follow-up:`, error);
      throw error;
    }
  }

  /**
   * Delete a scheduled job
   */
  async deleteScheduledJob(jobId: string): Promise<void> {
    const timeout = this.jobs.get(jobId);
    if (timeout) {
      clearInterval(timeout);
      this.jobs.delete(jobId);
    }
    this.jobData.delete(jobId);
    console.log(`[Scheduler] Deleted job ${jobId}`);
  }

  /**
   * List all scheduled jobs
   */
  async listScheduledJobs(): Promise<ScheduledJob[]> {
    return Array.from(this.jobData.values());
  }

  /**
   * Get a scheduled job by ID
   */
  async getScheduledJob(jobId: string): Promise<ScheduledJob | null> {
    return this.jobData.get(jobId) || null;
  }

  /**
   * Update a scheduled job
   */
  async updateScheduledJob(
    jobId: string,
    updates: Partial<ScheduledJob>
  ): Promise<ScheduledJob | null> {
    const job = this.jobData.get(jobId);
    if (!job) return null;

    const updated = { ...job, ...updates };
    this.jobData.set(jobId, updated);

    // If interval changed, reschedule
    if (updates.interval && updates.interval !== job.interval) {
      const timeout = this.jobs.get(jobId);
      if (timeout) {
        clearInterval(timeout);
      }
      this.scheduleJob(jobId, updates.interval);
    }

    return updated;
  }
}

export const scheduler = new StandaloneScheduler();

/**
 * Initialize scheduler on startup
 */
export async function initializeScheduler(): Promise<void> {
  console.log("[Scheduler] Standalone scheduler initialized");
  // In production, you might want to load persisted jobs from database here
}
