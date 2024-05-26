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
    publishedUrl: "",
  },
  twitterContent: {
    content: "",
    publishedUrl: "",
  },
};

const main = async () => {
  await fetchContent(notionData);
  await publishContent(notionData);
};

main();
