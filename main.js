import { getPageProperties, getPageContentMarkdown } from "./utils/fetch/notion.js";

const main = async () => {
  const pageDetails = await getPageProperties();
  const pageContent = await getPageContentMarkdown(pageDetails.id);
  console.log(pageContent);
};

main();
