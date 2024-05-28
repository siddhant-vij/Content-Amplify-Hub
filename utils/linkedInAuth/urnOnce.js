import https from "https";
import "dotenv/config";

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

const getLinkedInURN = async () => {
  const method = "GET";
  const hostname = "api.linkedin.com";
  const path = "/v2/userinfo";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  };
  try {
    const response = await _request(method, hostname, path, headers);
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

// HTTPS request wrapper
const _request = (method, hostname, path, headers, retries = 4) => {
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
          setTimeout(() => attempt(retries - 1), reqOpts.timeout / retries);
        } else {
          reject(e);
        }
      });
      req.end();
    };
    attempt(retries);
  });
};

await getLinkedInURN();
