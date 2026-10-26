import {
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

export interface Command {
  data: { toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface Schedule {
  name: string;
  cron: string;
  run: (client: Client) => Promise<void>;
}

export type ModuleEvent = {
  [K in keyof ClientEvents]: {
    name: K;
    once?: boolean;
    handler: (...args: ClientEvents[K]) => Promise<void>;
  };
}[keyof ClientEvents];

export interface Module {
  name: string;
  commands: Command[];
  schedules?: Schedule[];
  events?: ModuleEvent[];
}
