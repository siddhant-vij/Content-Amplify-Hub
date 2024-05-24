// https://developers.notion.com/docs/getting-started

// Create a Notion Integration & get your API key:
// https://www.notion.so/my-integrations

// To share a page with an integration, visit the page in your Notion workspace, click the ••• menu at the top right of a page, scroll down to Add connections, and use the search bar to find and select the integration from the dropdown list.

import { Client } from "@notionhq/client";
import "dotenv/config";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DB_ID;

export const getPageToBePublished = async () => {
  const now = new Date();
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
  return response.results[0];
};
