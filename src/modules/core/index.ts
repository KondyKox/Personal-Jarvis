import type { Module } from "../../core/types.js";
import { ping } from "./ping.js";

const core: Module = {
  name: "core",
  commands: [ping],
};

export default core;
