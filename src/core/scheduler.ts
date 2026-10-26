import { Client } from "discord.js";
import type { Module } from "./types.js";
import cron from "node-cron";

export function startScheduler(client: Client, modules: Module[]): void {
  let count = 0;

  for (const mod of modules) {
    for (const job of mod.schedules ?? []) {
      cron.schedule(
        job.cron,
        async () => {
          try {
            await job.run(client);
          } catch (err) {
            console.error(
              `Schedule "${job.name}" in module ${mod.name} failed:`,
              err,
            );
          }
        },
        { name: job.name, noOverlap: true },
      );
      count++;
    }
  }

  console.log(`scheduler started (${count} job${count === 1 ? "" : "s"})`);
}
