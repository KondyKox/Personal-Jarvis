import type { Module } from "../../core/types.js";
import { deliverReminders } from "./deliver.js";
import { remind } from "./remind.js";

const reminders: Module = {
  name: "reminders",
  commands: [remind],
  schedules: [
    {
      name: "deliver-reminders",
      cron: "*/30 * * * * *",
      run: deliverReminders,
    },
  ],
};

export default reminders;
