import { publishDevTo } from "../utils/publish/devTo.js";
import { publishHashnode } from "../utils/publish/hashnode.js";
import { publishMedium } from "../utils/publish/medium.js";
import { publishTwitter } from "../utils/publish/twitter.js";
import { publishLinkedIn } from "../utils/publish/linkedIn.js";

import { updateNotionPageUrl } from "../utils/success/notion.js";
import { sendEmail } from "../utils/failure/email.js";

export const publishContent = async (notionData) => {
  switch (notionData.channel) {
    case "Blog Post":
      try {
        notionData.devToContent.publishedUrl = await publishDevTo(
          notionData.devToContent
        );
      } catch (error) {
        notionData.devToContent.publishedUrl = "";
      }
      await updateNotionPageUrl(
        notionData.pageId,
        notionData.devToContent.publishedUrl,
        "",
        ""
      );

      try {
        notionData.hashnodeContent.publishedUrl = await publishHashnode(
          notionData.hashnodeContent
        );
      } catch (error) {
        notionData.hashnodeContent.publishedUrl = "";
      }
      await updateNotionPageUrl(
        notionData.pageId,
        "",
        notionData.hashnodeContent.publishedUrl,
        ""
      );

      notionData.mediumContent.publishedUrl = await publishMedium(
        notionData.mediumContent
      );
      await updateNotionPageUrl(
        notionData.pageId,
        "",
        "",
        notionData.mediumContent.publishedUrl
      );
      break;
    case "Twitter":
      notionData.twitterContent.publishedUrl = await publishTwitter(
        notionData.twitterContent
      );

      await updateNotionPageUrl(
        notionData.pageId,
        notionData.twitterContent.publishedUrl,
        "",
        ""
      );
      break;
    case "LinkedIn":
      notionData.linkedInContent.publishedUrl = await publishLinkedIn(
        notionData.linkedInContent,
        notionData.pageId
      );
      await updateNotionPageUrl(
        notionData.pageId,
        notionData.linkedInContent.publishedUrl,
        "",
        ""
      );
      break;
  }
  await sendEmail(
    "Notion Update - Success",
    `Updated Page with URLs: https://www.notion.so/${
      process.env.NOTION_DOMAIN
    }/${notionData.pageId.replace(/-/g, "")}`
  );
};
