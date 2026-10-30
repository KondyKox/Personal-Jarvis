import type { Module } from "../../core/types.js";
import { warn } from "./warn.js";

const moderation: Module = {
  name: "moderation",
  commands: [warn],
};

export default moderation;
