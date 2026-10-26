import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../core/types.js";
import { noteAdd, noteDelete, noteList, noteSearch } from "./handlers.js";

export const note: Command = {
  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription("Your personal notes")
    .addSubcommand((s) =>
      s
        .setName("add")
        .setDescription("Save a note")
        .addStringOption((o) =>
          o
            .setName("content")
            .setDescription("What do you want to remember?")
            .setRequired(true)
            .setMaxLength(1000),
        ),
    )
    .addSubcommand((s) =>
      s.setName("list").setDescription("Show your latest notes"),
    )
    .addSubcommand((s) =>
      s
        .setName("search")
        .setDescription("Find notes containing a word or phrase")
        .addStringOption((o) =>
          o
            .setName("query")
            .setDescription("Word or phrase")
            .setRequired(true)
            .setMaxLength(100),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("delete")
        .setDescription("Delete one of your notes by its number")
        .addIntegerOption((o) =>
          o
            .setName("id")
            .setDescription("Note number (see /note list)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(2147483647),
        ),
    ),

  execute: async (interaction) => {
    switch (interaction.options.getSubcommand()) {
      case "add":
        return noteAdd(interaction);
      case "list":
        return noteList(interaction);
      case "search":
        return noteSearch(interaction);
      case "delete":
        return noteDelete(interaction);
    }
  },
};
