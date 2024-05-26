import { publishDevTo } from "../utils/publish/devTo.js";
import { publishHashnode } from "../utils/publish/hashnode.js";

import { updateNotionPageUrl } from "../utils/success/notion.js";

export const publishContent = async (notionData) => {
  switch (notionData.channel) {
    case "Blog Post":
      const { devToContent, hashnodeContent } = notionData;
      notionData.devToContent.publishedUrl = await publishDevTo(devToContent);
      notionData.hashnodeContent.publishedUrl = await publishHashnode(
        hashnodeContent
      );
      await updateNotionPageUrl(notionData.pageId, notionData.devToContent.publishedUrl, notionData.hashnodeContent.publishedUrl);
      break;
    case "LinkedIn":
      break;
    case "Twitter":
      break;
  }
};
