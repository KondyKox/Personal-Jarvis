import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) throw new Error(`Missing env var: ${name}.`);

  return value;
}

export const config = {
  clientId: requireEnv("DISCORD_CLIENT_ID"),
  token: requireEnv("DISCORD_TOKEN"),
  guildId: requireEnv("DEV_GUILD_ID"),
  ownerId: requireEnv("OWNER_ID"),
  modLogChannelId: requireEnv("MOD_LOG_CHANNEL_ID"),
};
