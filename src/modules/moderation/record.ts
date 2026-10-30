import { pool } from "../../core/db.js";

export type ModActionType = "warn" | "timeout" | "kick" | "ban" | "purge";

export async function recordAction(a: {
  guildId: string;
  action: ModActionType;
  targetId: string;
  moderatorId: string;
  reason?: string | null;
  durationSeconds?: number | null;
}): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO mod_actions (guild_id, action, target_id, moderator_id, reason, duration_seconds)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
    `,
    [
      a.guildId,
      a.action,
      a.targetId,
      a.moderatorId,
      a.reason ?? null,
      a.durationSeconds ?? null,
    ],
  );

  return rows[0].id;
}
