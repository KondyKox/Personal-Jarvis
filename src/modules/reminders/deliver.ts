import { Client } from "discord.js";
import { pool } from "../../core/db.js";

type DueReminder = {
  id: number;
  user_id: string;
  channel_id: string;
  text: string;
  due_at: Date;
};

export async function deliverReminders(client: Client): Promise<void> {
  const { rows } = await pool.query<DueReminder>(
    `
    SELECT id, user_id, channel_id, text, due_at
    FROM reminders
    WHERE due_at <= now() AND delivered_at IS NULL
    ORDER BY due_at
    LIMIT 20
    `,
  );

  for (const row of rows) {
    const unix = Math.floor(row.due_at.getTime() / 1000);
    const wasLate = Date.now() - row.due_at.getTime() > 60_000;
    const content =
      `<@${row.user_id}> ⏰ **Reminder:** ${row.text}` +
      (wasLate ? `\n-# was due <t:${unix}:R>` : "");

    let sent = false;
    try {
      const channel = await client.channels.fetch(row.channel_id);
      if (channel?.isSendable()) {
        await channel.send({
          content,
          allowedMentions: { parse: [], users: [row.user_id] },
        });
        sent = true;
      }
    } catch (err) {
      console.error(`Reminder #${row.id}: sending to channel failed:`, err);
    }

    if (!sent) {
      try {
        const user = await client.users.fetch(row.user_id);
        await user.send(`⏰ **Reminder:** ${row.text}`);
      } catch (err) {
        console.error(
          `Reminder #${row.id}: DM fallback failed too, giving up:`,
          err,
        );
      }
    }

    await pool.query(
      "UPDATE reminders SET delivered_at = now() WHERE id = $1",
      [row.id],
    );
  }
}
