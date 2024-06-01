import "dotenv/config";
import { fetchContent } from "./services/fetchContent.js";
import { publishContent } from "./services/publishContent.js";
import { sendEmail } from "./utils/failure/email.js";

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
  mediumContent: {
    title: "",
    contentFormat: "markdown",
    content: "",
    tags: [],
    publishStatus: "public",
    notifyFollowers: true,
    publishedUrl: "",
  },
  linkedInContent: {
    content: "",
    articleUrl: "",
    articleImage: "",
    articleTitle: "",
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
    await sendEmail("Notion Fetch - Error", error.message);
    process.exit(1);
  }
  try {
    await publishContent(notionData);
  } catch (error) {
    await sendEmail("Publish Content - Error", error.message);
  }
};

await main();
