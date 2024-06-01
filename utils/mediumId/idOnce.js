import "dotenv/config";
import axios from "axios";

const mediumToken = process.env.MEDIUM_TOKEN;

const getAuthorId = async () => {
  const response = await axios
    .get("https://api.medium.com/v1/me", {
      headers: {
        Authorization: `Bearer ${mediumToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Charset": "utf-8",
      },
    })
    .catch((error) => {
      console.error("Medium - Author ID Request Error:", error.message);
      process.exit(1);
    });
  console.log("Medium - Author ID:", response.data.data.id);
};

await getAuthorId();
