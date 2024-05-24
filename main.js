import { getPageToBePublished } from "./utils/fetch/notion.js";

const main = async () => {
  const page = await getPageToBePublished();
  console.log(page);
};

main();