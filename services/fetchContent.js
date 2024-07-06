import {
  getPageProperties,
  getPageContentMarkdown,
} from "../utils/fetch/notion.js";

const removeMarkdownLinks = (inputMdStr) =>
  inputMdStr.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2");

export const fetchContent = async (notionData) => {
  const pageDetails = await getPageProperties(notionData);
  notionData.channel = pageDetails.properties["Channel"].select.name;
  if (notionData.env === "production") {
    notionData.pageId = pageDetails.id;
  }
  switch (notionData.channel) {
    case "Blog Post":
      const contentBodyMd = await getPageContentMarkdown(notionData.pageId);
      const hnBodyMd = contentBodyMd.slice(
        contentBodyMd.indexOf("## Introduction")
      );
      const mediumMd = contentBodyMd.slice(
        contentBodyMd.indexOf("## Introduction") + "## Introduction".length
      );

      notionData.devToContent.title =
        pageDetails.properties["Content Item Title"].title[0].plain_text;
      notionData.devToContent.main_image =
        pageDetails.properties["Dev Cover Image"].url;
      notionData.devToContent.tags = pageDetails.properties[
        "Content Tags"
      ].multi_select.map((tag) => tag.name);
      notionData.devToContent.body_markdown = contentBodyMd;

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
        pageDetails.properties["SEO Title"].formula.string;
      notionData.hashnodeContent.metaTags.description =
        pageDetails.properties["SEO Description"].rich_text[0].plain_text;
      notionData.hashnodeContent.metaTags.image =
        pageDetails.properties["SEO Image"].url;

      notionData.mediumContent.title =
        pageDetails.properties["Content Item Title"].title[0].plain_text;
      notionData.mediumContent.tags = pageDetails.properties[
        "Content Tags"
      ].multi_select.map((tag) => tag.name);
      notionData.mediumContent.content = `# ${notionData.mediumContent.title}\n\n${mediumMd}`;
      break;
    case "LinkedIn":
      notionData.linkedInContent.content = removeMarkdownLinks(
        await getPageContentMarkdown(notionData.pageId)
      );
      if (pageDetails.properties["LI Article URL"].url !== null) {
        notionData.linkedInContent.articleUrl =
          pageDetails.properties["LI Article URL"].url;
        notionData.linkedInContent.articleTitle =
          pageDetails.properties["LI Article Title"].rich_text[0].plain_text;
        notionData.linkedInContent.articleImage =
          pageDetails.properties["LI Article Image"].url;
      } else {
        notionData.linkedInContent.articleUrl = "";
      }
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
  console.log(notionData);
  // return notionData;
  process.exit(0);
};
