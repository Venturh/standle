import database from "./sqlite";

export interface Entry {
  id: number;
  time_in_seconds: number;
  note: string | null;
  created_at: string;
}

export type CreateOrUpdateEntry = Pick<Entry, "time_in_seconds" | "note">;

async function getAll() {
  console.log("getEntries");

  const db = await database();
  const data = await db.select<Entry[]>(
    `
    SELECT *
    FROM entries
    ORDER BY created_at DESC
    `
  );

  if (!data) return [];

  return data;
}

async function get(id: number) {
  console.log("ggetEntty");

  const db = await database();
  const data = await db.select<Entry[]>(
    `
    SELECT *
    FROM entries
    WHERE id = ?
    `,
    [id]
  );
  return data?.[0];
}

async function add({ note, time_in_seconds }: CreateOrUpdateEntry) {
  console.log("addEntty");
  const db = await database();
  await db.select(
    `
      INSERT INTO entries (note, time_in_seconds)
      VALUES (?, ?)
      RETURNING *
      `,
    [note, time_in_seconds]
  );
  return {
    note,
    time_in_seconds,
  };
}

async function destroy(id: number) {
  console.log("deleteEntty", id);
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
  get,
  add,
  destroy,
};
