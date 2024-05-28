/*
Step 3: Generate URN
- Uncomment the line below at the end of this file:
- await getLinkedInURN();
- Run this file with: node utils/publish/linkedIn.js

- To be run only once to get the URN (in the terminal) for the LinkedIn User with the access token (obtained in last steps). Copy paste the URN in .env file: LINKEDIN_URN
- It can take some time - I think it has t do with the LinkedIn API and how it's implemented - but it sucks big time!
*/

/*
Looks to me that LinkedIn doesn't want to have consumer apps built on top of API - I've tried the API endpoints below:
- with & without retires.
- different access tokens.
- http & https requests.
- request creation & axios requests.
- Even tried with the official JS client at https://github.com/linkedin-developers/linkedin-api-js-client.

It just doesn't work. The error is always as follows:
LinkedIn - API Request Error: AggregateError [ETIMEDOUT]
code: 'ETIMEDOUT'
Error: connect ETIMEDOUT 108.174.10.22:443
at createConnectionError (node:net:1647:14)
at Timeout.internalConnectMultipleTimeout (node:net:1706:38)
at listOnTimeout (node:internal/timers:575:11)
at process.processTimers (node:internal/timers:514:7) {
  errno: -110,
  code: 'ETIMEDOUT',
  syscall: 'connect',
  address: '108.174.10.22',
  port: 443 (and even 80)
}

- The getLinkedInURN() also created similar errors, but it just randomly worked once and I copied the URN here - but it also failed a lot of times.

- I'm sure that it's not a rate limiting error from the developer portal & also, checking in the code.

- I'm not sure how to fix this.

--------------------------------------------------
This could very well be an timely rate limit - something other than the daily limits presented in developer console. If yes,
    - Requires documentation update OR
    - A reason as to why ETIMEDOUT?
--------------------------------------------------

- If it's a code issue,I'll be more than happy to change this, but for now I'm pushing this to origin & commenting out all LinkedIn-related posting actions in this project.
- Instead, I'll be following the steps below:
    - Make max. 4 requests (until 201 status code) with each of the following in the same order:
        - publishLinkedInJsClient()
        - publishLinkedInAxios()
        - publishLinkedInRequest()
    - If all still failing, I'll be sending an email reminder to the user to manually post on LinkedIn.
*/

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

// This function can also be converted to be used as error-reducing combination of three functions (above for posting to LinkedIn) - but since URN is only needed once - I prefer running it manually until I get the results.
const getLinkedInURN = async () => {
  const method = "GET";
  const hostname = "api.linkedin.com";
  const path = "/v2/userinfo";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  };
  const body = "";
  try {
    const response = await _request(method, hostname, path, headers, body);
    if (response.status == 200) {
      const respBody = JSON.parse(response.body);
      console.log("LinkedIn - URN:", respBody.sub);
    } else if (response.status == 429) {
      console.error("LinkedIn - URN Rate Limit Error:", response.body);
      process.exit(1);
    } else {
      console.error("LinkedIn - URN Response Error:", response.body);
      process.exit(1);
    }
  } catch (e) {
    console.error("LinkedIn - URN Request Error:", e);
    process.exit(1);
  }
};

// await getLinkedInURN();
