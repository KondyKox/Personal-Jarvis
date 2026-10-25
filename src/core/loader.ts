import path from "node:path";
import { readdir } from "node:fs/promises";
import type { Command, Module } from "./types.js";
import { fileURLToPath, pathToFileURL } from "node:url";

interface LoadResult {
  modules: Module[];
  commands: Map<string, Command>;
}

export async function loadModules(): Promise<LoadResult> {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const modulesDir = path.join(dir, "..", "modules");

  const modules: Module[] = [];
  const commands = new Map<string, Command>();
  const owners = new Map<string, string>(); // command name -> module that owns it

  const entries = await readdir(modulesDir, { withFileTypes: true });
  const folderNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const name of folderNames) {
    // TODO: .js after build
    const modulePath = path.join(modulesDir, name, "index.ts");
    const moduleHref = pathToFileURL(modulePath).href;

    let imported;
    try {
      imported = await import(moduleHref);
    } catch (err) {
      throw new Error(
        `Failed to load module "${name}": ${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      );
    }

    const mod = imported.default as Module;

    if (!mod) {
      throw new Error(
        `Module "${name}" has no default export. Add "export default" of a Module object in src/modules/${name}/index.ts`,
      );
    }
    if (typeof mod.name !== "string") {
      throw new Error(
        `Module "${name}" is invalid: "name" must be a string, got ${typeof mod.name}`,
      );
    }
    if (!Array.isArray(mod.commands)) {
      throw new Error(
        `Module "${name}" is invalid: "commands" must be an array`,
      );
    }

    for (const command of mod.commands) {
      const cmdName = command.data.toJSON().name;
      if (commands.has(cmdName)) {
        throw new Error(
          `Duplicate command "/${cmdName}": defined in module "${owners.get(cmdName)}" and again in "${mod.name}". Rename one of them`,
        );
      }
      commands.set(cmdName, command);
      owners.set(cmdName, mod.name);
    }

    modules.push(mod);
    console.log(
      `loaded module ${mod.name} (${mod.commands.length} commands, ${mod.schedules?.length ?? 0} schedules, ${mod.events?.length ?? 0} events)`,
    );
  }

  return { modules, commands };
}
