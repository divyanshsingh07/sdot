import { readFileSync } from "node:fs";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

const env = loadEnv();
const apiKey = env.NOTION_API_KEY;
const databaseId = env.NOTION_DATABASE_ID;

if (!apiKey || !databaseId) {
  console.error("Missing NOTION_API_KEY or NOTION_DATABASE_ID in .env.local");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Notion-Version": "2026-03-11",
  "Content-Type": "application/json",
};

async function main() {
  const me = await fetch("https://api.notion.com/v1/users/me", { headers });
  console.log("users/me:", me.status, await me.text());

  const db = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    headers,
  });
  console.log("database retrieve:", db.status, await db.text());

  const search = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: "",
      filter: { value: "data_source", property: "object" },
      page_size: 20,
    }),
  });
  console.log("search data sources:", search.status, await search.text());
}

main().catch(console.error);
