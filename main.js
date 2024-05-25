import { fetchContent } from "./services/fetchContent.js";

const main = async () => {
  const notionData = await fetchContent();
  console.log(notionData);
};

main();
