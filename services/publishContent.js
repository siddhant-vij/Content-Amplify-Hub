import { publishDevTo } from "../utils/publish/devTo.js";
import { publishHashnode } from "../utils/publish/hashnode.js";
import { publishTwitter } from "../utils/publish/twitter.js";
import { publishLinkedIn } from "../utils/publish/linkedIn.js";

import { updateNotionPageUrl } from "../utils/success/notion.js";

export const publishContent = async (notionData) => {
  switch (notionData.channel) {
    case "Blog Post":
      const { devToContent, hashnodeContent } = notionData;
      try {
        notionData.devToContent.publishedUrl = await publishDevTo(devToContent);
      } catch (error) {
        notionData.devToContent.publishedUrl = "";
      }
      await updateNotionPageUrl(
        notionData.pageId,
        notionData.devToContent.publishedUrl,
        ""
      );
      notionData.hashnodeContent.publishedUrl = await publishHashnode(
        hashnodeContent
      );
      await updateNotionPageUrl(
        notionData.pageId,
        "",
        notionData.hashnodeContent.publishedUrl
      );
      break;
    case "Twitter":
      const { twitterContent } = notionData;
      notionData.twitterContent.publishedUrl = await publishTwitter(
        twitterContent
      );

      await updateNotionPageUrl(
        notionData.pageId,
        notionData.twitterContent.publishedUrl,
        ""
      );
      break;
    case "LinkedIn":
      const { pageId, linkedInContent } = notionData;
      notionData.linkedInContent.publishedUrl = await publishLinkedIn(
        linkedInContent,
        pageId
      );
      await updateNotionPageUrl(
        notionData.pageId,
        notionData.linkedInContent.publishedUrl,
        ""
      );
      break;
  }
};
