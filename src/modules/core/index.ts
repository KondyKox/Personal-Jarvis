import type { Module } from "../../core/types.js";
import { ping } from "./ping.js";
import { status } from "./status.js";

const core: Module = {
  name: "core",
  commands: [ping, status],
};

export default core;
