import { Client, Interaction } from "discord.js";
import type { Command, Module } from "./types.js";

export function attachRouter(client: Client, commands: Map<string, Command>) {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        content: "Unknown command. Did you deploy? 💀",
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Command /${interaction.commandName} failed:`, err);
      const msg = { content: "Something broke. It's logged.", ephemeral: true };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      } catch (replyErr) {
        console.error("Could not even send the error message:", replyErr);
      }
    }
  });
}

export function attachEvents(client: Client, modules: Module[]) {
  for (const mod of modules) {
    for (const event of mod.events ?? []) {
      const handler = async (...args: unknown[]) => {
        try {
          await (event.handler as (...a: unknown[]) => Promise<void>)(...args);
        } catch (err) {
          console.error(
            `Event ${event.name} in module ${mod.name} failed:`,
            err,
          );
        }
      };

      if (event.once) client.once(event.name, handler);
      else client.on(event.name, handler);
    }
  }
}
