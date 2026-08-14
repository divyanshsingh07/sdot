import type { InternshipApplication } from "@/lib/internship/types";

const NOTION_VERSION = process.env.NOTION_API_VERSION ?? "2026-03-11";
const TEXT_LIMIT = 2000;

function richText(content: string) {
  return content
    ? [{ type: "text" as const, text: { content: content.slice(0, TEXT_LIMIT) } }]
    : [];
}

function joinList(values: string[]) {
  return values.join(", ");
}

function buildPageMarkdown(application: InternshipApplication) {
  const portfolio = application.portfolio
    ? application.portfolio
    : "—";

  return [
    "## Why SDOT",
    application.why,
    "",
    "## Political assessment",
    application.analysis,
    "",
    "## Video note",
    application.videoNote || "—",
    "",
    "## Links",
    `- Portfolio: ${portfolio}`,
    `- Video: ${application.videoLink}`,
  ].join("\n");
}

function notionHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function resolveDataSourceId(apiKey: string, databaseId: string) {
  const configured = process.env.NOTION_DATA_SOURCE_ID;
  if (configured) return configured;

  const response = await fetch(
    `https://api.notion.com/v1/databases/${databaseId}`,
    { headers: notionHeaders(apiKey) },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion database error (${response.status}): ${body}`);
  }

  const database = (await response.json()) as {
    data_sources?: Array<{ id: string }>;
  };

  const dataSourceId = database.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error("Notion database has no data source.");
  }

  return dataSourceId;
}

export function isNotionConfigured() {
  return Boolean(
    process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID,
  );
}

export async function appendToNotion(application: InternshipApplication) {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    throw new Error("Notion is not configured.");
  }

  const dataSourceId = await resolveDataSourceId(apiKey, databaseId);

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(apiKey),
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties: {
        Name: {
          title: richText(application.name),
        },
        Ref: {
          rich_text: richText(application.refId),
        },
        Email: {
          rich_text: richText(application.email),
        },
        Phone: {
          rich_text: richText(application.phone),
        },
        City: {
          rich_text: richText(application.city),
        },
        Education: {
          rich_text: richText(application.education),
        },
        Portfolio: {
          rich_text: richText(application.portfolio),
        },
        Interests: {
          rich_text: richText(joinList(application.interests)),
        },
        "Why SDOT": {
          rich_text: richText(application.why),
        },
        Analysis: {
          rich_text: richText(application.analysis),
        },
        Tools: {
          rich_text: richText(joinList(application.tools)),
        },
        "Hours/week": {
          rich_text: richText(application.hoursPerWeek),
        },
        "Start date": {
          rich_text: richText(application.startDate),
        },
        "Video link": {
          rich_text: richText(application.videoLink),
        },
        "Video note": {
          rich_text: richText(application.videoNote),
        },
        Submitted: {
          rich_text: richText(application.submittedAt),
        },
        "Review status": {
          select: { name: "New" },
        },
      },
      markdown: buildPageMarkdown(application),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion API error (${response.status}): ${body}`);
  }

  return response.json();
}
