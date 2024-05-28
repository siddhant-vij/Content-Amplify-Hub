import {
  getPageProperties,
  getPageContentMarkdown,
} from "../utils/fetch/notion.js";

const convertDevToHnRemoveToc = (devBodyMd) => {
  const startIndex = devBodyMd.indexOf("## Introduction");
  const hnBodyMdWithoutToc = devBodyMd.slice(startIndex);
  return hnBodyMdWithoutToc;
};

const removeMarkdownLinks = (inputMdStr) => {
  const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const result = inputMdStr.replace(markdownLinkPattern, "$2");
  return result;
};

export const fetchContent = async (notionData) => {
  const pageDetails = await getPageProperties();
  notionData.channel = pageDetails.properties["Channel"].select.name;
  notionData.pageId = pageDetails.id;
  switch (notionData.channel) {
    case "Blog Post":
      const devBodyMd = await getPageContentMarkdown(notionData.pageId);
      const hnBodyMd = convertDevToHnRemoveToc(devBodyMd);

      notionData.devToContent.title =
        pageDetails.properties["Content Item Title"].title[0].plain_text;
      notionData.devToContent.main_image =
        pageDetails.properties["Dev Cover Image"].url;
      notionData.devToContent.tags = pageDetails.properties[
        "Content Tags"
      ].multi_select.map((tag) => tag.name);
      notionData.devToContent.body_markdown = devBodyMd;

      notionData.hashnodeContent.title =
        pageDetails.properties["Content Item Title"].title[0].plain_text;
      notionData.hashnodeContent.publicationId =
        process.env.HASHNODE_PUBLICATION_ID;
      notionData.hashnodeContent.contentMarkdown = hnBodyMd;
      notionData.hashnodeContent.coverImageOptions.coverImageURL =
        pageDetails.properties["HN Cover Image"].url;
      notionData.hashnodeContent.tags = pageDetails.properties[
        "HN Tag IDs"
      ].multi_select.map((tag) => ({ id: tag.name }));
      notionData.hashnodeContent.metaTags.title =
        pageDetails.properties["SEO Title"].rich_text[0].plain_text;
      notionData.hashnodeContent.metaTags.description =
        pageDetails.properties["SEO Description"].rich_text[0].plain_text;
      notionData.hashnodeContent.metaTags.image =
        pageDetails.properties["SEO Image"].url;
      break;
    case "LinkedIn":
      notionData.linkedInContent.content = removeMarkdownLinks(
        await getPageContentMarkdown(notionData.pageId)
      );
      break;
    case "Twitter":
      notionData.twitterContent.content = removeMarkdownLinks(
        await getPageContentMarkdown(notionData.pageId)
      );
      if (pageDetails.properties["Twitter Image"].url !== null) {
        notionData.twitterContent.imageUrl =
          pageDetails.properties["Twitter Image"].url;
      } else {
        notionData.twitterContent.imageUrl = "";
      }
      if (pageDetails.properties["Retweet Id"].rich_text.length !== 0) {
        notionData.twitterContent.retweetId =
          pageDetails.properties["Retweet Id"].rich_text[0].plain_text;
      } else {
        notionData.twitterContent.retweetId = "";
      }
      break;
  }
  return notionData;
};
