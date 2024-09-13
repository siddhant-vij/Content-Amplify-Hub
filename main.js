import "dotenv/config";
import { fetchContent } from "./services/fetchContent.js";
import { publishContent } from "./services/publishContent.js";
import { sendEmail } from "./utils/failure/email.js";

const notionData = {
  env: process.env.ENVIRONMENT,
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
  if (notionData.env !== "production") {
    console.log("Enter the Page Link ID: ");
    const pageLinkId = await new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim());
      });
    });
    const pageId = `${pageLinkId.slice(0, 8)}-${pageLinkId.slice(8,12)}-${pageLinkId.slice(12, 16)}-${pageLinkId.slice(16,20)}-${pageLinkId.slice(20)}`;
    notionData.pageId = pageId;
  }
  try {
    await fetchContent(notionData);
  } catch (error) {
    await sendEmail("Notion Fetch - Error", error.message);
    process.exit(1);
  }
  try {
    await publishContent(notionData, "devTo", "twitter");
    // await publishContent(notionData, "all", "all");
  } catch (error) {
    await sendEmail("Publish Content - Error", error.message);
  }
};

await main();
