/*
Step 1: Register the App
- Create a LinkedIn Page & App (verified) in LinkedIn Developer Network with redirect url set to "http://localhost:3000/auth" & following products added:
    - Share on LinkedIn
    - Sign In with LinkedIn using OpenID Connect
- Copy the Client ID and Client Secret keys into the .env file


Step 2: Generate Access Token

- Start the webserver: node linkedInAuth.js

- In the browser, navigate to http://localhost:3000 to get an access_token in the token.json file.
- Verify the access token in the browser at https://www.linkedin.com/developers/tools/oauth/token-inspector.
- This webserver should ideally update the respective environment variable in the GitHub Actions backend (secret) using the GitHub API, but for development purposes, I am manually updating the .env file.
*/

import "dotenv/config";
import http from "http";
import https from "https";
import url from "url";
import fs from "fs";

const client_id = process.env.LINKEDIN_CLIENT_ID;
const client_secret = process.env.LINKEDIN_CLIENT_SERCRET;
const auth_base_url = "https://www.linkedin.com/oauth/v2/authorization";
const redirect_uri = "http://localhost:3000/auth";
const response_type = "code";
const state = Math.random();
const scope = "openid profile email w_member_social";

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
          const expires_in = Date.now() + JSON.parse(r.body).expires_in * 1000;
          const token_json =
            '{"access_token":"' +
            access_token +
            '","expires_in":"' +
            expires_in +
            '"}';

          // Directly update the GitHub Environment Variable using the GitHub API...

          fs.writeFile("./token.json", token_json, (e) => {
            if (e) {
              console.error("ERROR - " + e);
            }
          });
          res.writeHead(200, { "content-type": "text/html" });
          res.write("Access token retrieved. You can close this page");
          console.log(
            "Access token retrieved. You can stop this app listening."
          );
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
    console.error("ERROR - 404 Not found");
    res.writeHead(404, { "content-type": "text/html" });
    res.write("404 Not Found");
    res.end();
  }
});

app.listen(3000);
app.on("error", (e) => console.log("Error on port " + 3000 + " - " + e));
app.on("listening", () => console.log("Listening on port " + 3000));

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
