import { TwitterApi } from "twitter-api-v2";

const twitterProfileName = process.env.TWITTER_PROFILE_NAME;

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export const publishTwitter = async (twitterContent) => {
  try {
    const response = await twitterClient.v2.tweet(twitterContent.content);
    return `https://x.com/${twitterProfileName}/status/${response.data.id}`;
  } catch (error) {
    console.error("Twitter - API Error:", error.message);
    process.exit(1);
  }
};
