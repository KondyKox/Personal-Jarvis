import { loadModules } from "./core/loader.js";

const { commands } = await loadModules();
console.log([...commands.keys()]);
