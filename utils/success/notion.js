import { Client } from "@notionhq/client";
import { sendEmail } from "../failure/email.js";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const buildNotionProperties = (contentUrl, hnUrl, mediumUrl) => {
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

  if (mediumUrl !== "") {
    properties["Medium Link"] = {
      url: mediumUrl,
    };
  }

  return properties;
};

export const updateNotionPageUrl = async (
  pageId,
  contentUrl,
  hnUrl,
  mediumUrl
) => {
  if (contentUrl === "" && hnUrl === "" && mediumUrl === "") {
    return;
  }

  const properties = buildNotionProperties(contentUrl, hnUrl, mediumUrl);

  try {
    await notion.pages.update({
      page_id: pageId,
      properties,
    });
  } catch (error) {
    await sendEmail("Notion Update - API Error:", error.message);
    process.exit(1);
  }
};
