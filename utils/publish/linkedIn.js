import https from "https";
import axios from "axios";
import { RestliClient } from "linkedin-api-client";
import { sendEmail } from "../failure/email.js";

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
const urn = process.env.LINKEDIN_URN;

const linkedInPostData = async (linkedInContent) => {
  const postDataObj = {
    author: `urn:li:person:${urn}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: linkedInContent.content,
        },
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  if (linkedInContent.articleUrl !== "") {
    postDataObj.specificContent[
      "com.linkedin.ugc.ShareContent"
    ].shareMediaCategory = "ARTICLE";
    postDataObj.specificContent["com.linkedin.ugc.ShareContent"].media = [
      {
        status: "READY",
        originalUrl: linkedInContent.articleUrl,
        thumbnails: [
          {
            url: linkedInContent.articleImage,
          },
        ],
        title: { text: linkedInContent.articleTitle },
      },
    ];
  } else {
    postDataObj.specificContent[
      "com.linkedin.ugc.ShareContent"
    ].shareMediaCategory = "NONE";
  }

  return postDataObj;
};

const handleLinkedInError = (status, responseBody, clientType) => {
  let errorMessage;
  switch (status) {
    case 422:
      errorMessage = `${clientType} Content Duplication: ${JSON.stringify(
        responseBody.message
      )}`;
      break;
    case 429:
      errorMessage = `${clientType} Rate Limit Error: ${JSON.stringify(
        responseBody
      )}`;
      break;
    default:
      errorMessage = `${clientType} Error: ${JSON.stringify(responseBody)}`;
  }
  throw new Error(errorMessage);
};

const retryOperation = async (operation, attempts, delay) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(error.message);
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
};

export const publishLinkedIn = async (linkedInContent, pageId) => {
  try {
    return await retryOperation(
      () => publishLinkedInJsClient(linkedInContent),
      5,
      4000
    );
  } catch (error) {
    console.error("publishLinkedInJsClient failed, trying Axios");
  }

  try {
    return await retryOperation(
      () => publishLinkedInAxios(linkedInContent),
      5,
      4000
    );
  } catch (error) {
    console.error("publishLinkedInAxios failed, trying Request");
  }

  try {
    return await publishLinkedInRequest(linkedInContent);
  } catch (error) {
    console.error("publishLinkedInRequest failed, sending Email");
    await sendEmail(
      "Publish on LinkedIn - Failed",
      `Post the following content manually: https://www.notion.so/${
        process.env.NOTION_DOMAIN
      }/${pageId.replace(/-/g, "")}`
    );
    process.exit(1);
  }
};

const publishLinkedInJsClient = async (linkedInContent) => {
  const client = new RestliClient({
    timeout: 20000,
    keepAlive: true,
  });
  try {
    const response = await client.create({
      resourcePath: "/ugcPosts",
      entity: await linkedInPostData(linkedInContent),
      accessToken,
    });
    if (response.status == 201) {
      return (
        "https://linkedin.com/feed/update/" + response.headers["x-restli-id"]
      );
    } else {
      handleLinkedInError(
        response.status,
        response.data || response.body,
        "LinkedIn - JsClient"
      );
    }
  } catch (e) {
    throw new Error(`LinkedIn - JsClient Error: ${JSON.stringify(e)}`);
  }
};

const publishLinkedInAxios = async (linkedInContent) => {
  try {
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        keepAlive: true,
        timeout: 20000,
      }),
    });
    const response = await axiosInstance.post(
      "https://api.linkedin.com/v2/ugcPosts",
      await linkedInPostData(linkedInContent),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );
    if (response.status == 201) {
      return (
        "https://linkedin.com/feed/update/" + response.headers["x-restli-id"]
      );
    } else {
      handleLinkedInError(
        response.status,
        response.data || response.body,
        "LinkedIn - Axios"
      );
    }
  } catch (e) {
    throw new Error(`LinkedIn - Axios Request Error: ${JSON.stringify(e)}`);
  }
};

const publishLinkedInRequest = async (linkedInContent) => {
  const method = "POST";
  const hostname = "api.linkedin.com";
  const path = "/v2/ugcPosts";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  };
  const body = JSON.stringify(await linkedInPostData(linkedInContent));
  try {
    const response = await _request(method, hostname, path, headers, body);
    if (response.status == 201) {
      return (
        "https://linkedin.com/feed/update/" + response.headers["x-restli-id"]
      );
    } else {
      handleLinkedInError(
        response.status,
        response.data || response.body,
        "LinkedIn - ReqCreate"
      );
    }
  } catch (e) {
    throw new Error(`LinkedIn - ReqCreate Request Error: ${JSON.stringify(e)}`);
  }
};

// HTTPS request wrapper
const _request = (method, hostname, path, headers, body, retries = 5) => {
  return new Promise((resolve, reject) => {
    const reqOpts = {
      method,
      hostname,
      path,
      headers,
      timeout: 20000,
      keepAlive: true,
    };
    if (method !== "GET") {
      reqOpts.headers["Content-Length"] = Buffer.byteLength(body);
    }
    let resBody = "";
    const attempt = (retries) => {
      const req = https.request(reqOpts, (res) => {
        res.on("data", (data) => {
          resBody += data.toString("utf8");
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: resBody,
          });
        });
      });
      req.on("error", (e) => {
        if (retries > 0) {
          setTimeout(() => attempt(retries - 1), reqOpts.timeout / retries);
        } else {
          reject(e);
        }
      });
      if (method !== "GET") {
        req.write(body);
      }
      req.end();
    };
    attempt(retries);
  });
};
