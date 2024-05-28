import "dotenv/config";
import http from "http";
import https from "https";
import url from "url";
import fs from "fs";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

const LINKEDIN_USERNAME = process.env.LINKEDIN_USERNAME;
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;
const client_id = process.env.LINKEDIN_CLIENT_ID;
const client_secret = process.env.LINKEDIN_CLIENT_SERCRET;
const auth_base_url = "https://www.linkedin.com/oauth/v2/authorization";
const redirect_uri = "http://localhost:3000/auth";
const response_type = "code";
const state = Math.random();
const scope = "openid profile email w_member_social";

let server;

const app = http.createServer(function (req, res) {
  const req_pathname = url.parse(req.url, true).pathname;
  const req_query = url.parse(req.url, true).query;

  const redirect_uri_pathname = new URL(redirect_uri).pathname;

  if (req_pathname == "/") {
    const auth_url =
      auth_base_url +
      "?response_type=" +
      response_type +
      "&client_id=" +
      client_id +
      "&redirect_uri=" +
      encodeURIComponent(redirect_uri) +
      "&state=" +
      state +
      "&scope=" +
      encodeURIComponent(scope);
    res.writeHead(302, { Location: auth_url });
    res.end();
  } else if (req_pathname == redirect_uri_pathname) {
    const req_code = req_query.code;

    const path_query =
      "grant_type=authorization_code&" +
      "code=" +
      req_code +
      "&" +
      "redirect_uri=" +
      encodeURIComponent(redirect_uri) +
      "&" +
      "client_id=" +
      client_id +
      "&" +
      "client_secret=" +
      client_secret;

    const method = "POST";
    const hostname = "www.linkedin.com";
    const path = "/oauth/v2/accessToken?" + path_query;
    const headers = {
      "Content-Type": "x-www-form-urlencoded",
    };
    const body = "";
    _request(method, hostname, path, headers, body)
      .then((r) => {
        if (r.status == 200) {
          const access_token = JSON.parse(r.body).access_token;

          // TODO: Once app is deployed, directly update the GitHub Environment Variable using the GitHub API?

          // Local: Update the .env file with the new access token
          dotenv.config();
          const envConfig = dotenv.parse(fs.readFileSync(".env"));
          envConfig.LINKEDIN_ACCESS_TOKEN = access_token;
          const newEnvConfig = Object.keys(envConfig)
            .map((key) => `${key}=${envConfig[key]}`)
            .join("\n");
          fs.writeFileSync(".env", newEnvConfig);

          res.writeHead(200, { "content-type": "text/html" });
          res.write("Access token retrieved. You can close this page");
          console.log("Access token retrieved.");
          res.end();
        } else {
          console.error("ERROR - " + r.status + JSON.stringify(r.body));
          res.writeHead(r.status, { "content-type": "text/html" });
          res.write(r.status + " Internal Server Error");
          res.end();
        }
      })
      .catch((e) => {
        console.error("ERROR - " + e);
        res.writeHead(500, { "content-type": "text/html" });
        res.write("500 Internal Server Error");
        res.end();
      });
  } else {
    server.close();
  }
});

server = app.listen(3000);
server.on("error", (e) => console.log("Error on port " + 3000 + " - " + e));
server.on("listening", async () => {
  console.log("Listening on port " + 3000);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");

  await page.waitForSelector("#username");
  await page.type("#username", LINKEDIN_USERNAME);

  await page.waitForSelector("#password");
  await page.type("#password", LINKEDIN_PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    page.click(".btn__primary--large"),
  ]);

  await browser.close();
});

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
