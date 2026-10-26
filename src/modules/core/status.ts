import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../core/types.js";
import { pool } from "../../core/db.js";

function formatUptime(totalSeconds: number): string {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
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

    const lines = [
      "🩺 **Vitals**",
      `🤖 Bot: ✅ online, heartbeat ${interaction.client.ws.ping} ms`,
      `🐘 Database: ${dbLine}`,
      // "⏰ Scheduler: 💤 not built yet (Phase 2)",
      `⏳ Uptime: ${formatUptime(process.uptime())}`,
    ];

    await interaction.editReply(lines.join("\n"));
  },
};
