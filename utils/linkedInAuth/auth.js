import "dotenv/config";
import http from "http";
import https from "https";
import url from "url";
import puppeteer from "puppeteer";
import { updateGitHubSecret } from "./github.js";

const linkedInUsername = process.env.LINKEDIN_USERNAME;
const linkedInPassword = process.env.LINKEDIN_PASSWORD;
const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const authBaseUrl = "https://www.linkedin.com/oauth/v2/authorization";
const redirectUri = "http://127.0.0.1:3000/auth";
const responseType = "code";
const state = Math.random();
const scope = "openid profile email w_member_social";

let serverResolve;
const serverPromise = new Promise((resolve) => {
  serverResolve = resolve;
});

const server = http.createServer(async (req, res) => {
  console.log("Inside server");
  const reqPathname = url.parse(req.url, true).pathname;
  const reqQuery = url.parse(req.url, true).query;

  const redirectUriPathname = new URL(redirectUri).pathname;

  if (reqPathname === "/") {
    console.log("Redirected to: ", reqPathname);
    const authUrl =
      authBaseUrl +
      "?response_type=" +
      responseType +
      "&client_id=" +
      clientId +
      "&redirect_uri=" +
      encodeURIComponent(redirectUri) +
      "&state=" +
      state +
      "&scope=" +
      encodeURIComponent(scope);
    res.writeHead(302, { Location: authUrl });
    res.end();
  } else if (reqPathname === redirectUriPathname) {
    console.log("Redirected to: ", redirectUriPathname);
    const reqCode = reqQuery.code;

    const pathQuery =
      "grant_type=authorization_code&" +
      "code=" +
      reqCode +
      "&" +
      "redirect_uri=" +
      encodeURIComponent(redirectUri) +
      "&" +
      "client_id=" +
      clientId +
      "&" +
      "client_secret=" +
      clientSecret;

    const method = "POST";
    const hostname = "www.linkedin.com";
    const path = "/oauth/v2/accessToken?" + pathQuery;
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const body = "";
    _request(method, hostname, path, headers, body)
      .then(async (r) => {
        if (r.status === 200) {
          const accessToken = JSON.parse(r.body).access_token;

          await updateGitHubSecret(accessToken);

          res.writeHead(200, { "content-type": "text/html" });
          res.write("Access token retrieved. You can close this page");
          console.log("Access token retrieved.");
          res.end();
          serverResolve();
        } else {
          console.error(
            "Auth. Response Error - " + r.status + JSON.stringify(r.body)
          );
          res.writeHead(r.status, { "content-type": "text/html" });
          res.write(r.status + " Internal Server Error");
          res.end();
          serverResolve();
        }
      })
      .catch((e) => {
        console.error("Auth. Request Error - " + e);
        res.writeHead(500, { "content-type": "text/html" });
        res.write("500 Internal Server Error");
        res.end();
        serverResolve();
      });
  } else {
    server.close();
  }
});

server.listen(3000);
server.on("error", (e) => console.log("Error on port " + 3000 + " - " + e));
server.on("listening", async () => {
  console.log("Listening on port " + 3000);

  console.log("Running Puppeteer...");
  await runPuppeteer();
  console.log("After running Puppeteer...");

  await serverPromise;
  console.log("After serverPromise...");
  server.close();
  console.log("Server closed");
});

const runPuppeteer = async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  console.log("After launching Puppeteer...");
  const page = await browser.newPage();
  console.log("After newPage...");
  await page.goto("http://127.0.0.1:3000");
  console.log("After goto at port 3000...");

  await page.waitForSelector("#username");
  console.log("After waitForSelector #username...");
  await page.type("#username", linkedInUsername);
  console.log("After type #username...");

  await page.waitForSelector("#password");
  console.log("After waitForSelector #password...");
  await page.type("#password", linkedInPassword);
  console.log("After type #password...");

  await Promise.all([
    page.waitForNavigation(),
    page.click(".btn__primary--large"),
  ]);
  console.log("After click .btn__primary--large...");

  await browser.close();
  console.log("Puppeteer closed");
};

// https request wrapper
const _request = (method, hostname, path, headers, body) => {
  return new Promise((resolve, reject) => {
    const reqOpts = {
      method,
      hostname,
      path,
      headers,
      rejectUnauthorized: false,
    };
    let resBody = "";
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
      reject(e);
    });
    if (method !== "GET") {
      req.write(body);
    }
    req.end();
  });
};
