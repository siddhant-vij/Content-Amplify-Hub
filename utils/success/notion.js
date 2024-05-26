import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const updateNotionPageUrl = async (pageId, contentUrl, hnUrl) => {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Content Link": {
        url: contentUrl !== "" ? contentUrl : "",
      },
      "Hashnode Link": {
        url: hnUrl !== "" ? hnUrl : "",
      },
    },
  });
};
