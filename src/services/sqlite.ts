import Database from "tauri-plugin-sql-api";

let cached: Database | null = null;

export default async function database() {
  cached ??= await Database.load("sqlite:standle.db");
  return cached;
}
