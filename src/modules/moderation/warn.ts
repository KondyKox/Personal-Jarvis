import {
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../core/types.js";
import { requireOwnerInGuild } from "../../core/permissions.js";
import { recordAction } from "./record.js";
import { pool } from "../../core/db.js";

export const warn: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setContexts(InteractionContextType.Guild)
    .addUserOption((o) =>
      o.setName("user").setDescription("Who to warn").setRequired(true),
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Why").setMaxLength(500),
    ),

  execute: async (interaction) => {
    const guild = await requireOwnerInGuild(interaction);
    if (!guild) return;

    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason");

    const caseId = await recordAction({
      guildId: guild.id,
      action: "warn",
      targetId: target.id,
      moderatorId: interaction.user.id,
      reason,
    });

    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM mod_actions
      WHERE guild_id = $1 AND target_id = $2 AND action = 'warn'
      `,
      [guild.id, target.id],
    );

    await interaction.reply({
      content:
        `⚠️ Warned <@${target.id}> (case #${caseId}, warning ${rows[0].n})` +
        (reason ? `\n> ${reason}` : ""),
      allowedMentions: { parse: [] },
    });
  },
};
