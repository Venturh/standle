import { QueryFunctionContext } from "@tanstack/vue-query";
import database from "./sqlite";

export interface Entry {
  id?: number;
  time_in_seconds: number;
  note: string | null;
  started_at: string | null;
  tracked_date: string;
  type: "sitting" | "standing";
  created_at: string;
}

export type CreateEntry = Pick<
  Entry,
  "time_in_seconds" | "note" | "started_at" | "type"
>;

export type UpdateEntry = Pick<
  Entry,
  "id" | "time_in_seconds" | "note" | "started_at" | "type"
>;

async function getAll() {
  const db = await database();
  const data = await db.select<Entry[]>(
    `
    SELECT *
    FROM entries
    ORDER BY tracked_date DESC;
    `
  );

  return data;
}

async function getAllByDate({
  queryKey,
}: QueryFunctionContext<[string, string]>) {
  const [_key, date] = queryKey;

  const [month, year] = date.split("-");

  const db = await database();
  const data = await db.select<Entry[]>(
    `
      SELECT *
      FROM entries
      WHERE strftime('%Y-%m', tracked_date) = strftime('%Y-%m', ? || '-' || ? || '-01')
      ORDER BY tracked_date DESC
      `,
    [year, month]
  );

  return data;
}

async function add({
  note,
  time_in_seconds,
  type,
}: CreateEntry): Promise<Entry> {
  const db = await database();
  const data = await db.select<Entry[]>(
    `
      INSERT INTO entries (note, time_in_seconds, type, started_at)
      VALUES (?, ?, ?, ?)
      RETURNING *
      `,
    [note, time_in_seconds, type, new Date().toISOString()]
  );
  return data[0];
}

async function update({
  id,
  note,
  started_at,
  time_in_seconds,
  type,
}: UpdateEntry) {
  const db = await database();
  await db.execute(
    `
    UPDATE entries
    SET note = ?, started_at = ?, time_in_seconds = ?, type = ?
    WHERE id = ?
    `,
    [note, started_at, time_in_seconds, type, id]
  );
  return {
    id,
    note,
    time_in_seconds,
    started_at,
  };
}

async function destroy(id: number) {
  const db = await database();
  await db.execute(
    `
      DELETE FROM entries
      WHERE id = ?
      `,
    [id]
  );
}

export const EntryService = {
  getAll,
  getAllByDate,
  add,
  update,
  destroy,
};
