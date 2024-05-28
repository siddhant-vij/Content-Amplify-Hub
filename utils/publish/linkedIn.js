/*
Step 3: Generate URN
- Uncomment the line below at the end of this file:
await getLinkedInURN(process.env.LINKEDIN_ACCESS_TOKEN);
- Run this file with: node ./utils/publish/linkedIn.js

- To be run only once to get the URN (in the terminal) for the LinkedIn User with the access token (obtained in last steps). Copy paste the URN in .env file: LINKEDIN_URN
- It can take some time - I think it has t do with the LinkedIn API and how it's implemented - but it sucks big time!
*/

/*
Looks to me that LinkedIn doesn't want to have consumer apps built on top of API - I've tried the API endpoints below:
- with & without retires.
- different access tokens.
- http & https requests.
- request creation (as below) & axios requests.
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

- The getLinkedInURN() also created similar errors, but it just randomly worked once and I copied the URN here - but it also failed a lot of times - posting has just not worked at all.

- I'm sure that it's not a rate limiting error from the developer portal & also, checking in the code.

- I'm not sure how to fix this.

- If it's a code issue,I'll be more than happy to change this, but for now I'm pushing this to origin & commenting out all LinkedIn-related posting actions in this project.
- Instead, I'll be sending an email reminder to the user to manually schedule posts on LinkedIn on a weekly basis.
*/

import https from "https";
import "dotenv/config";

const getLinkedInURN = async (accessToken) => {
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
      console.error("LinkedIn - API Rate Limit Error:", response.body);
      process.exit(1);
    } else {
      console.error("LinkedIn - Token Response Error:", response.body);
      process.exit(1);
    }
  } catch (e) {
    console.error("LinkedIn - Token Request Error:", e);
    process.exit(1);
  }
};

export const publishLinkedIn = async (linkedInContent) => {
  const method = "POST";
  const hostname = "api.linkedin.com";
  const path = "/v2/ugcPosts";
  const headers = {
    Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  };
  const body = JSON.stringify({
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
  try {
    const response = await _request(method, hostname, path, headers, body);
    if (response.status == 201) {
      return (
        "https://linkedin.com/feed/update/" + response.headers["x-restli-id"]
      );
    } else if (response.status == 429) {
      console.error("LinkedIn - API Rate Limit Error:", response.body);
      process.exit(1);
    } else {
      console.error("LinkedIn - API Response Error:", response.body);
      process.exit(1);
    }
  } catch (e) {
    console.error("LinkedIn - API Request Error:", e);
    process.exit(1);
  }
};

// https request wrapper
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
          console.error(
            `Error: ${e.code}, retrying... (${retries} retries left)`
          );
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

// await getLinkedInURN(process.env.LINKEDIN_ACCESS_TOKEN);
