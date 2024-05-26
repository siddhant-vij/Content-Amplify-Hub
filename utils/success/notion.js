import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const updateNotionPageUrl = async (pageId, contentUrl, hnUrl) => {
  try {
    if (hnUrl === "") {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          "Content Link": {
            url: contentUrl,
          },
        },
      });
    } else {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          "Content Link": {
            url: contentUrl,
          },
          "Hashnode Link": {
            url: hnUrl,
          },
        },
      });
    }
  } catch (error) {
    console.error("Notion Update - API Error:", error.message);
    process.exit(1);
  }
};
