import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const buildNotionProperties = (contentUrl, hnUrl) => {
  const properties = {
    "Content Link": {
      url: contentUrl,
    },
  };

  if (hnUrl !== "") {
    properties["Hashnode Link"] = {
      url: hnUrl,
    };
  }

  return properties;
};

export const updateNotionPageUrl = async (pageId, contentUrl, hnUrl) => {
  const properties = buildNotionProperties(contentUrl, hnUrl);

  try {
    await notion.pages.update({
      page_id: pageId,
      properties,
    });
  } catch (error) {
    console.error("Notion Update - API Error:", error.message);
    process.exit(1);
  }
};
