import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../core/types.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if bot already passed away 🙏"),

  execute: async (interaction) => {
    const heartbeat = interaction.client.ws.ping;
    await interaction.reply(
      `Still alive. Barely. Heartbeat: ${heartbeat} ms 💀`,
    );
  },
};
