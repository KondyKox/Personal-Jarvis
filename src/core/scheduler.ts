import { Client } from "discord.js";
import type { Module } from "./types.js";
import cron from "node-cron";

type JobInfo = {
  name: string;
  module: string;
  lastRun: Date | null;
  lastError: string | null;
};

const jobs: JobInfo[] = [];

export function getSchedulerStatus(): JobInfo[] {
  return jobs;
}

export function startScheduler(client: Client, modules: Module[]): void {
  let count = 0;

  for (const mod of modules) {
    for (const job of mod.schedules ?? []) {
      const info: JobInfo = {
        name: job.name,
        module: mod.name,
        lastRun: null,
        lastError: null,
      };
      jobs.push(info);
      cron.schedule(
        job.cron,
        async () => {
          try {
            await job.run(client);
            info.lastError = null;
          } catch (err) {
            info.lastError = err instanceof Error ? err.message : String(err);
            console.error(
              `Schedule "${job.name}" in module ${mod.name} failed:`,
              err,
            );
          } finally {
            info.lastRun = new Date();
          }
        },
        { name: job.name, noOverlap: true },
      );
      count++;
    }
  }

  console.log(`scheduler started (${count} job${count === 1 ? "" : "s"})`);
}
