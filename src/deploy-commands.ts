import { REST, Routes } from "discord.js";
import { config } from "./core/config.js";
import { loadModules } from "./core/loader.js";

const rest = new REST().setToken(config.token);

async function main() {
  const { commands } = await loadModules();
  const body = [...commands.values()].map((cmd) => cmd.data.toJSON());

  console.log(`Registering ${body.length} command(s)...`);

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body },
  );

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
