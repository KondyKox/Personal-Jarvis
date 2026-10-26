import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../core/types.js";
import { pool } from "../../core/db.js";
import { getSchedulerStatus } from "../../core/scheduler.js";

function formatUptime(total: number): string {
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  return [d && `${d}d`, (d || h) && `${h}h`, (d || h || m) && `${m}m`, `${s}s`]
    .filter(Boolean)
    .join(" ");
}

export const status: Command = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Vitals check: bot, database, scheduler"),

  execute: async (interaction) => {
    await interaction.deferReply();

    let dbLine: string;
    const start = performance.now();
    try {
      await pool.query("SELECT 1");
      dbLine = `✅ OK (${Math.round(performance.now() - start)} ms)`;
    } catch (err) {
      console.error("Status: DB check failed:", err);
      dbLine = "❌ DOWN (check the console)";
    }

    const jobs = getSchedulerStatus();
    const schedulerLine = jobs.length
      ? jobs
          .map((j) => {
            const icon = j.lastError ? "❌" : j.lastRun ? "✅" : "⏳";
            const when = j.lastRun
              ? `last run <t:${Math.floor(j.lastRun.getTime() / 1000)}:R>`
              : "waiting for first run";
            return `- ${icon} ${j.name}: ${when}${j.lastError ? ` (${j.lastError})` : ""}`;
          })
          .join("\n")
      : "💤 no jobs registered";

    const lines = [
      "🩺 **Vitals**",
      `🤖 Bot: ✅ online, heartbeat ${interaction.client.ws.ping} ms`,
      `🐘 Database: ${dbLine}`,
      `⏰ Scheduler:\n${schedulerLine}`,
      `⏳ Uptime: ${formatUptime(process.uptime())}`,
    ];

    await interaction.editReply(lines.join("\n"));
  },
};
