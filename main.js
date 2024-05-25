import { fetchContent } from "./services/fetchContent.js";
import { publishDevTo } from "./utils/publish/devTo.js";
import { publishHashnode } from "./utils/publish/hashnode.js";

const main = async () => {
  const notionData = await fetchContent();
  
  const { devToContent } = notionData;
  const devToData = await publishDevTo(devToContent);
  console.log(devToData.url);

  const { hashnodeContent } = notionData;
  const hashnodeData = await publishHashnode(hashnodeContent);
  console.log(hashnodeData.url);
};

main();
