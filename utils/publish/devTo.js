import axios from "axios";

export const publishDevTo = async (devtoContent) => {
  const { title, main_image, tags, body_markdown, published } = devtoContent;
  const { data } = await axios.post(
    "https://dev.to/api/articles",
    {
      article: {
        title,
        body_markdown,
        published,
        main_image,
        tags,
      },
    },
    {
      headers: {
        "api-key": process.env.DEVTO_TOKEN,
      },
    }
  );
  return data.url;
};
