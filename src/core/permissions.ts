import { ChatInputCommandInteraction, Guild, MessageFlags } from "discord.js";
import { config } from "./config.js";

export async function requireOwnerInGuild(
  interaction: ChatInputCommandInteraction,
): Promise<Guild | null> {
  if (interaction.user.id !== config.ownerId) {
    await interaction.reply({
      content: "Owner only 🔒",
      flags: MessageFlags.Ephemeral,
    });
    return null;
  }

  if (!interaction.guild) {
    await interaction.reply({
      content: "Server only 🏠",
      flags: MessageFlags.Ephemeral,
    });
    return null;
  }

  return interaction.guild;
}
