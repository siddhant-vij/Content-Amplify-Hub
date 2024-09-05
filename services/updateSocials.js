import { publishTwitter } from "../utils/publish/twitter.js";
import { publishLinkedIn } from "../utils/publish/linkedIn.js";

import { updateNotionPageUrl } from "../utils/success/notion.js";

export const updateTwitter = async (notionData) => {
  const tags = notionData.devToContent.tags.map((tag) => `#${tag} `).join("");
  const content = `Just published an article titled: ${
    notionData.devToContent.title
  }

Link: ${notionData.devToContent.publishedUrl}

Do give it a read and if you found this blog post useful and insightful, share it and comment down below with your thoughts on it.

${tags.slice(0, -1)}`;

  const twitterContentUpdate = {
    content: content,
    imageUrl: "",
    retweetId: "",
    publishedUrl: "",
  };

  twitterContentUpdate.publishedUrl = await publishTwitter(
    twitterContentUpdate
  );
  if (notionData.env !== "production") {
    console.log("Twitter - Published URL:", twitterContentUpdate.publishedUrl);
  } else {
    await updateNotionPageUrl(
      notionData.pageId,
      "",
      "",
      "",
      twitterContentUpdate.publishedUrl,
      ""
    );
  }
};

export const updateLinkedIn = async (notionData) => {
  const tags = notionData.devToContent.tags.map((tag) => `#${tag} `).join("");
  const content = `Just published an article…

Do give it a read and if you found this blog post useful and insightful, share it and comment down below with your thoughts on it.

${tags.slice(0, -1)}`;

  const linkedInContentUpdate = {
    content: content,
    articleUrl: notionData.hashnodeContent.publishedUrl,
    articleImage: notionData.hashnodeContent.metaTags.image,
    articleTitle: notionData.hashnodeContent.title,
    publishedUrl: "",
  };

  linkedInContentUpdate.publishedUrl = await publishLinkedIn(
    linkedInContentUpdate,
    notionData.pageId
  );
  if (notionData.env !== "production") {
    console.log(
      "LinkedIn - Published URL:",
      linkedInContentUpdate.publishedUrl
    );
  } else {
    await updateNotionPageUrl(
      notionData.pageId,
      "",
      "",
      "",
      "",
      linkedInContentUpdate.publishedUrl
    );
  }
};
