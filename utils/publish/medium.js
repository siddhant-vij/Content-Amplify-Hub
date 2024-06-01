import axios from "axios";
import { sendEmail } from "../failure/email.js";

const mediumToken = process.env.MEDIUM_TOKEN;
const mediumAuthorId = process.env.MEDIUM_AUTHOR_ID;

export const publishMedium = async (mediumContent) => {
  const { title, contentFormat, content, tags, publishStatus, notifyFollowers } = mediumContent;
  const response = await axios
    .post(
      `https://api.medium.com/v1/users/${mediumAuthorId}/posts`,
      {
        title,
        contentFormat,
        content,
        tags,
        publishStatus,
        notifyFollowers,
      },
      {
        headers: {
          Authorization: `Bearer ${mediumToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Charset": "utf-8",
        },
      }
    )
    .catch(async (error) => {
      await sendEmail("Medium Publish - API Error", error.message);
      process.exit(1);
    });
  return response.data.data.url;
};
