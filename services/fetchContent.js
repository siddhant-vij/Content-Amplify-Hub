import {
  getPageProperties,
  getPageContentMarkdown,
} from "../utils/fetch/notion.js";

const notionData = {
  channel: "",
  devToContent: {
    title: "",
    main_image: "",
    tags: [],
    body_markdown: "",
    published: true,
  },
  hashnodeContent: {
    title: "",
    publicationId: "",
    contentMarkdown: "",
    publishedAt: "",
    coverImageOptions: {
      coverImageURL: "",
      isCoverAttributionHidden: true,
      stickCoverToBottom: false,
    },
    tags: [],
    metaTags: {
      title: "",
      description: "",
      image: "",
    },
    settings: {
      enableTableOfContent: true,
    },
  },
  linkedInContent: {
    content: "",
  },
  twitterContent: {
    content: "",
  },
};

const convertDevToHnRemoveToc = (devBodyMd) => {
  const startIndex = devBodyMd.indexOf("## **Table of Content**");
  const endIndex =
    devBodyMd.indexOf("(#conclusion)\n\n") + "(#conclusion)\n\n".length;
  const hnBodyMdWithoutToc =
    devBodyMd.slice(0, startIndex) + devBodyMd.slice(endIndex);
  return hnBodyMdWithoutToc;
};

export const fetchContent = async () => {
  const pageDetails = await getPageProperties();
  notionData.channel = pageDetails.properties["Channel"].select.name;
  switch (notionData.channel) {
    case "Blog Post":
      const devBodyMd = await getPageContentMarkdown(pageDetails.id);
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
      notionData.hashnodeContent.publishedAt =
        pageDetails.properties["Publishing Date"].date.start;
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
      notionData.linkedInContent.content = await getPageContentMarkdown(
        pageDetails.id
      );
      break;
    case "Twitter":
      notionData.twitterContent.content = await getPageContentMarkdown(
        pageDetails.id
      );
      break;
  }
  return notionData;
};
