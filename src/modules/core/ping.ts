import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Check if bot already passed away 🙏");

export async function execute(interaction: ChatInputCommandInteraction) {
  const ping = interaction.client.ws.ping;
  await interaction.reply(`Still alive. Barely. Heartbeat: ${ping} ms 💀`);
}
