import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { sendEmail } from "../failure/email.js";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DB_ID;

export const getPageProperties = async () => {
  const now = new Date();
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Publishing Date",
        date: {
          is_not_empty: true,
          after: now,
        },
      },
      sorts: [
        {
          property: "Publishing Date",
          direction: "ascending",
        },
      ],
    });
    if (response.results.length === 0) {
      await sendEmail("Nothing to post", "No results found");
      process.exit(1);
    }
    return response.results[0];
  } catch (error) {
    await sendEmail("Notion Fetch - API Error", error.message);
    process.exit(1);
  }
};

const n2m = new NotionToMarkdown({ notionClient: notion });

export const getPageContentMarkdown = async (pageId) => {
  const mdblocks = await n2m.pageToMarkdown(pageId);
  const mdString = n2m.toMarkdownString(mdblocks);
  return mdString.parent.trim();
};
