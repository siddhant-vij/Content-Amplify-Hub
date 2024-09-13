import { publishDevTo } from "../utils/publish/devTo.js";
import { publishHashnode } from "../utils/publish/hashnode.js";
import { publishMedium } from "../utils/publish/medium.js";
import { publishTwitter } from "../utils/publish/twitter.js";
import { publishLinkedIn } from "../utils/publish/linkedIn.js";

import { updateTwitter } from "./updateSocials.js";
import { updateLinkedIn } from "./updateSocials.js";

import { updateNotionPageUrl } from "../utils/success/notion.js";
import { sendEmail } from "../utils/failure/email.js";

export const publishContent = async (
  notionData,
  blogPlatform,
  socialPlatform
) => {
  switch (notionData.channel) {
    case "Blog Post":
      if (blogPlatform === "devTo" || blogPlatform === "all") {
        try {
          notionData.devToContent.publishedUrl = await publishDevTo(
            notionData.devToContent
          );
        } catch (error) {
          notionData.devToContent.publishedUrl = "";
        }
        if (notionData.env !== "production") {
          console.log(
            "DevTo - Published URL:",
            notionData.devToContent.publishedUrl
          );
        } else {
          await updateNotionPageUrl(
            notionData.pageId,
            notionData.devToContent.publishedUrl,
            "",
            "",
            "",
            ""
          );
        }
      }

      if (blogPlatform === "all") {
        try {
          notionData.hashnodeContent.publishedUrl = await publishHashnode(
            notionData.hashnodeContent
          );
        } catch (error) {
          notionData.hashnodeContent.publishedUrl = "";
        }
        if (notionData.env !== "production") {
          console.log(
            "Hashnode - Published URL:",
            notionData.hashnodeContent.publishedUrl
          );
        } else {
          await updateNotionPageUrl(
            notionData.pageId,
            "",
            notionData.hashnodeContent.publishedUrl,
            "",
            "",
            ""
          );
        }

        notionData.mediumContent.publishedUrl = await publishMedium(
          notionData.mediumContent
        );
        if (notionData.env !== "production") {
          console.log(
            "Medium - Published URL:",
            notionData.mediumContent.publishedUrl
          );
        } else {
          await updateNotionPageUrl(
            notionData.pageId,
            "",
            "",
            notionData.mediumContent.publishedUrl,
            "",
            ""
          );
        }
      }

      if (socialPlatform === "twitter" || socialPlatform === "all") {
        await updateTwitter(notionData);
      }

      if (socialPlatform === "all") {
        await updateLinkedIn(notionData);
      }
      break;
    case "Twitter":
      notionData.twitterContent.publishedUrl = await publishTwitter(
        notionData.twitterContent
      );
      if (notionData.env !== "production") {
        console.log(
          "Twitter - Published URL:",
          notionData.twitterContent.publishedUrl
        );
      } else {
        await updateNotionPageUrl(
          notionData.pageId,
          notionData.twitterContent.publishedUrl,
          "",
          "",
          "",
          ""
        );
      }
      break;
    case "LinkedIn":
      notionData.linkedInContent.publishedUrl = await publishLinkedIn(
        notionData.linkedInContent,
        notionData.pageId
      );
      if (notionData.env !== "production") {
        console.log(
          "LinkedIn - Published URL:",
          notionData.linkedInContent.publishedUrl
        );
      } else {
        await updateNotionPageUrl(
          notionData.pageId,
          notionData.linkedInContent.publishedUrl,
          "",
          "",
          "",
          ""
        );
      }
      break;
  }
  if (notionData.env === "production") {
    await sendEmail(
      "Notion Update - Success",
      `Updated Page with URLs: https://www.notion.so/${
        process.env.NOTION_DOMAIN
      }/${notionData.pageId.replace(/-/g, "")}`
    );
  } else {
    process.exit(0);
  }
};
