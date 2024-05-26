import { publishDevTo } from "../utils/publish/devTo.js";
import { publishHashnode } from "../utils/publish/hashnode.js";

export const publishContent = async (notionData) => {
  switch (notionData.channel) {
    case "Blog Post":
      const { devToContent, hashnodeContent } = notionData;

      notionData.devToContent.publishedUrl = await publishDevTo(devToContent);
      console.log(notionData.devToContent.publishedUrl);

      notionData.hashnodeContent.publishedUrl = await publishHashnode(
        hashnodeContent
      );
      console.log(notionData.hashnodeContent.publishedUrl);
      break;
    case "LinkedIn":
      break;
    case "Twitter":
      break;
  }
};
