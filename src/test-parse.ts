import { DateTime } from "luxon";
import { parseWhen } from "./modules/reminders/parse-when.js";

const now = DateTime.fromISO("2026-10-26T12:00:00", { zone: "Europe/Warsaw" });

const cases = [
  "in 30m",
  "in 2h",
  "tomorrow 8:00",
  "today 18:30",
  "today 08:00",
  "2026-10-27 08:00",
  "2026-07-01 08:00",
  "tomorrow 25:00",
  "banana",
];

for (const c of cases) {
  console.log(c.padEnd(18), "->", parseWhen(c, now)?.toISOString() ?? null);
}
