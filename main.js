import { getDatabase } from "./utils/fetch/notion.js";

const main = async () => {
  const db = await getDatabase();
  console.log(db);
};

main();