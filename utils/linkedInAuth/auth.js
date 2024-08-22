import "dotenv/config";
import http from "http";
import https from "https";
import url from "url";
import puppeteer from "puppeteer";
import fs from "fs";
import dotenv from "dotenv";
import { updateGitHubSecret } from "./github.js";

const linkedInUsername = process.env.LINKEDIN_USERNAME;
const linkedInPassword = process.env.LINKEDIN_PASSWORD;
const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const environment = process.env.ENVIRONMENT;
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
  const reqPathname = url.parse(req.url, true).pathname;
  const reqQuery = url.parse(req.url, true).query;

  const redirectUriPathname = new URL(redirectUri).pathname;

  if (reqPathname === "/") {
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

          if (environment !== "production") {
            dotenv.config();
            const envConfig = dotenv.parse(fs.readFileSync(".env"));
            envConfig.LINKEDIN_ACCESS_TOKEN = accessToken;
            const newEnvConfig = Object.keys(envConfig)
              .map((key) => `${key}=${envConfig[key]}`)
              .join("\n");
            fs.writeFileSync(".env", newEnvConfig);
          }

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

  await runPuppeteer();

  await serverPromise;
  server.close();
});

const runPuppeteer = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:3000");

  await page.waitForSelector("#username");
  await page.type("#username", linkedInUsername);

  await page.waitForSelector("#password");
  await page.type("#password", linkedInPassword);

  await Promise.all([
    page.waitForNavigation(),
    page.click(".btn__primary--large"),
  ]);

  await checkUrlCode(page.url(), browser);
};

const checkUrlCode = async (url, browser) => {
  if (url.includes("code=")) {
    await browser.close();
  } else {
    setTimeout(() => checkUrlCode(url, browser), 1000);
  }
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
