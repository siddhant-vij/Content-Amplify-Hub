import { fetchContent } from "./services/fetchContent.js";
import { publishContent } from "./services/publishContent.js";

const notionData = {
  pageId: "",
  channel: "",
  devToContent: {
    title: "",
    main_image: "",
    tags: [],
    body_markdown: "",
    published: true,
    publishedUrl: "",
  },
  hashnodeContent: {
    title: "",
    publicationId: "",
    contentMarkdown: "",
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
    publishedUrl: "",
  },
  linkedInContent: {
    content: "",
    articleUrl: "",
    articleTitle: "",
    articleDesc: "",
    publishedUrl: "",
  },
  twitterContent: {
    content: "",
    imageUrl: "",
    retweetId: "",
    publishedUrl: "",
  },
};

const main = async () => {
  try {
    await fetchContent(notionData);
  } catch (error) {
    console.error("Notion Fetch - Error:", error.message);
    process.exit(1);
  }
  try {
    await publishContent(notionData);
  } catch (error) {
    console.error("Publish - Error:", error.message);
    process.exit(1);
  }
};

main();
