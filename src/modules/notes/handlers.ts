import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { pool } from "../../core/db.js";

type NoteRow = { id: number; content: string; created_at: Date };

function formatNotes(rows: NoteRow[]): string {
  return rows
    .map((n) => {
      const unix = Math.floor(n.created_at.getTime() / 1000);
      const flat = n.content.replace(/\s+/g, " ");
      const preview = flat.length > 100 ? flat.slice(0, 100) + "…" : flat;
      return `**#${n.id}** <t:${unix}:d> ${preview}`;
    })
    .join("\n");
}

export async function noteAdd(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const content = interaction.options.getString("content", true);

  const { rows } = await pool.query(
    "INSERT INTO notes (user_id, content) VALUES ($1, $2) RETURNING id",
    [interaction.user.id, content],
  );

  await interaction.reply({
    content: `📝 Saved as note **#${rows[0].id}**`,
    flags: MessageFlags.Ephemeral,
  });
}

export async function noteList(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const { rows } = await pool.query<NoteRow>(
    `SELECT id, content, created_at FROM notes
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 10
    `,
    [interaction.user.id],
  );

  await interaction.reply({
    content: rows.length ? formatNotes(rows) : "No notes yet. Try '/note add'",
    flags: MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
}

export async function noteSearch(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const query = interaction.options.getString("query", true);
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;

  const { rows } = await pool.query<NoteRow>(
    `SELECT id, content, created_at FROM notes
    WHERE user_id = $1 AND content ILIKE $2
    ORDER BY created_at DESC
    LIMIT 10
    `,
    [interaction.user.id, pattern],
  );

  await interaction.reply({
    content: rows.length
      ? formatNotes(rows)
      : `Nothing found for "${query}" 🔎`,
    flags: MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
  });
}

export async function noteDelete(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const id = interaction.options.getInteger("id", true);

  const result = await pool.query(
    "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, interaction.user.id],
  );

  await interaction.reply({
    content: result.rowCount
      ? `🗑️ Note **#${id}** deleted`
      : `No note #${id} of yours 🤷`,
    flags: MessageFlags.Ephemeral,
  });
}
