import type { Module } from "../../core/types.js";
import { note } from "./note.js";

const notes: Module = {
  name: "notes",
  commands: [note],
};

export default notes;
