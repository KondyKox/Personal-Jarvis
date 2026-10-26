import { DateTime } from "luxon";

const ZONE = "Europe/Warsaw";

export function parseWhen(
  input: string,
  now: DateTime = DateTime.now().setZone(ZONE),
): Date | null {
  const text = input.trim().toLowerCase();
  let result: DateTime | null = null;

  const relative = text.match(/^in\s+(\d+)\s*(m|h|d)$/);
  const dayTime = text.match(/^(today|tomorrow)\s+(\d{1,2}):(\d{2})$/);

  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2];

    if (unit === "m") result = now.plus({ minutes: amount });
    else if (unit === "h") result = now.plus({ hours: amount });
    else result = now.plus({ days: amount });
  } else if (dayTime) {
    const base = dayTime[1] === "tomorrow" ? now.plus({ days: 1 }) : now;

    result = DateTime.fromObject(
      {
        year: base.year,
        month: base.month,
        day: base.day,
        hour: Number(dayTime[2]),
        minute: Number(dayTime[3]),
      },
      { zone: ZONE },
    );
  } else {
    const absolute = DateTime.fromFormat(text, "yyyy-MM-dd HH:mm", {
      zone: ZONE,
    });
    if (absolute.isValid) result = absolute;
  }

  if (!result || !result.isValid) return null;
  if (result.toMillis() <= now.toMillis()) return null;

  return result.toJSDate();
}
