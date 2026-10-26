import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "./core/config.js";
import { loadModules } from "./core/loader.js";
import { attachEvents, attachRouter } from "./core/router.js";
import { startScheduler } from "./core/scheduler.js";

async function main() {
  const { modules, commands } = await loadModules();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  attachRouter(client, commands);
  attachEvents(client, modules);

  client.once(Events.ClientReady, (c) => {
    console.log(`Online as ${c.user.tag}`);
    startScheduler(c, modules);
  });

  await client.login(config.token);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
