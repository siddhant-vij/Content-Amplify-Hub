import https from "https";
import axios from "axios";
import { RestliClient } from "linkedin-api-client";
import "dotenv/config";

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

const linkedInPostData = (linkedInContent) => ({
  author: "urn:li:person:5QawhgJm1Y",
  lifecycleState: "PUBLISHED",
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: {
        text: linkedInContent.content,
      },
      shareMediaCategory: "NONE",
    },
  },
  visibility: {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
  },
});

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
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
};

export const publishLinkedIn = async (linkedInContent) => {
  try {
    return await retryOperation(
      () => publishLinkedInJsClient(linkedInContent),
      4,
      2000
    );
  } catch (error) {
    console.error("publishLinkedInJsClient failed, trying Axios");
  }

  try {
    return await retryOperation(
      () => publishLinkedInAxios(linkedInContent),
      4,
      2000
    );
  } catch (error) {
    console.error("publishLinkedInAxios failed, trying Request");
  }

  try {
    return await publishLinkedInRequest(linkedInContent);
  } catch (error) {
    console.error("publishLinkedInRequest failed");
    process.exit(1);
  }
};

const publishLinkedInJsClient = async (linkedInContent) => {
  const client = new RestliClient();
  try {
    const response = await client.create({
      resourcePath: "/ugcPosts",
      entity: linkedInPostData(linkedInContent),
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
    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      linkedInPostData(linkedInContent),
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
  const body = JSON.stringify(linkedInPostData(linkedInContent));
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
const _request = (method, hostname, path, headers, body, retries = 4) => {
  return new Promise((resolve, reject) => {
    const reqOpts = {
      method,
      hostname,
      path,
      headers,
      rejectUnauthorized: false,
      timeout: 20000,
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
