import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../core/types.js";
import { parseWhen } from "./parse-when.js";
import { pool } from "../../core/db.js";

export const remind: Command = {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder")
    .addStringOption((o) =>
      o
        .setName("when")
        .setDescription(
          "e.g. in 30m, today 18:30, tomorrow 8:00, 2026-10-27 08:00",
        )
        .setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName("text")
        .setDescription("What should I remind you about?")
        .setRequired(true)
        .setMaxLength(500),
    ),

  execute: async (interaction) => {
    const whenText = interaction.options.getString("when", true);
    const text = interaction.options.getString("text", true);

    const due = parseWhen(whenText);
    if (!due) {
      await interaction.reply({
        content:
          "Couldn't understand that time 🤔 Try `in 30m`, `in 2h`, `today 18:30`, `tomorrow 8:00` or `2026-10-27 08:00`. It's Warsaw time and has to be in the future.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO reminders (user_id, channel_id, text, due_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [interaction.user.id, interaction.channelId, text, due],
    );
    const id = result.rows[0].id;
    const unix = Math.floor(due.getTime() / 1000);

    await interaction.reply({
      content: `✅ Reminder #${id} set for <t:${unix}:F> (<t:${unix}:R>)\n> ${text}`,
      allowedMentions: { parse: [] },
    });
  },
};
