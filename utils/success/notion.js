import { Client } from "@notionhq/client";
import { sendEmail } from "../failure/email.js";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const buildNotionProperties = (contentUrl, hnUrl) => {
  const properties = {};

  if (contentUrl !== "") {
    properties["Content Link"] = {
      url: contentUrl,
    };
  }

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
    let urlMsg = "";
    if (contentUrl !== "") {
      urlMsg += `Content Url: ${contentUrl}\n`;
    }
    if (hnUrl !== "") {
      urlMsg += `Hashnode Url: ${hnUrl}`;
    }
    await sendEmail("Notion Update - Success", urlMsg);
  } catch (error) {
    await sendEmail("Notion Update - API Error:", error.message);
    process.exit(1);
  }
};
