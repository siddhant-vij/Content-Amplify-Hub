import { fetchContent } from "./services/fetchContent.js";
import { publishDevTo } from "./utils/publish/devTo.js";

const main = async () => {
  const notionData = await fetchContent();
  const { devToContent } = notionData;
  const devToData = await publishDevTo(devToContent);
  console.log(devToData.url);
};

main();
