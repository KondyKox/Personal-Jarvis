import { REST, Routes } from "discord.js";
import { data as ping } from "./modules/core/ping.js";
import { config } from "./core/config.js";

const commands = [ping.toJSON()];

const rest = new REST().setToken(config.token);

async function main() {
  console.log(`Registering ${commands.length} command(s)...`);

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands },
  );

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
