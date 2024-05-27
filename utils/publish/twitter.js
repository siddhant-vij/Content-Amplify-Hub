import { TwitterApi } from "twitter-api-v2";

const twitterProfileName = process.env.TWITTER_PROFILE_NAME;

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const uploadImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    const imgArrayBuffer = await response.arrayBuffer();
    const imgbuffer = Buffer.from(imgArrayBuffer);
    const mediaId = await twitterClient.v1.uploadMedia(imgbuffer, {
      mimeType: "image/png",
      media_category: "tweet_image",
    });
    return mediaId;
  } catch (error) {
    console.error("Twitter - API Error:", error.message);
    process.exit(1);
  }
};

const buildTweetOptions = async (twitterContent) => {
  const options = {};

  if (twitterContent.retweetId !== "") {
    options.quote_tweet_id = twitterContent.retweetId;
  }

  if (twitterContent.imageUrl !== "") {
    const mediaId = await uploadImage(twitterContent.imageUrl);
    options.media = {
      media_ids: [mediaId],
    };
  }

  return options;
};

export const publishTwitter = async (twitterContent) => {
  let options = await buildTweetOptions(twitterContent);
  try {
    const response = await twitterClient.v2.tweet(
      twitterContent.content,
      options
    );
    return `https://x.com/${twitterProfileName}/status/${response.data.id}`;
  } catch (error) {
    console.error("Twitter - API Error:", error.message);
    process.exit(1);
  }
};
