# Content Amplify Hub

A Nodejs-based project which automates the process of fetching blog and social media posts from a Notion database & publishing them to Dev.to, Hashnode, Medium, Twitter, and LinkedIn as per a specified schedule using GitHub Actions. For a user, all you have to do now is write & maintain your content in the Notion DB and the rest will be taken care of.

- Automatically fetches posts from Notion DB
- Publishes to blogging & social media platforms
- Scheduled posting based on specified times
- Success/failure updates sent via email
- Automated retries in case of failure
- Re-authentication in case of access token expiry
- Update Notion DB page with published URLs
- Workflow runners for GitHub Actions

<br>

## Table of Contents

1. [Environment Variables](#environment-variables)
   1. [Notion](#-notion)
   1. [Dev.to](#-devto)
   1. [Hashnode](#-hashnode)
   1. [Medium](#-medium)
   1. [Twitter](#-twitter)
   1. [LinkedIn](#-linkedin)
   1. [Email](#-email)
   1. [GitHub](#-github)
1. [Notion Setup](#notion-setup)
1. [Usage Instructions](#usage-instructions)
    1. [Local Setup](#local-setup)
    1. [Github Actions](#github-actions)
1. [Contributions](#contributions)
1. [License](#license)

<br>

## Environment Variables

### 🚀 Notion

Create a Notion Integration & get your API key:
https://www.notion.so/my-integrations

To share a page with an integration, visit the page in your Notion workspace, click the ••• menu at the top right of a page, scroll down to **Add connections**, and use the search bar to find and select the integration from the dropdown list.

- `NOTION_DOMAIN`: Get from Settings & members > Workspace > Settings > Public settings > Domain
- `NOTION_TOKEN`: Token on a Notion internal integration
- `NOTION_DB_ID`: To find a database ID, navigate to the database URL in your Notion workspace:

<img src="https://i.imgur.com/i2aLVbc.png" width="800px">

<br>

### 🚀 Dev.to

To obtain the token below, follow these steps:

Visit https://dev.to/settings/extensions

- `DEVTO_TOKEN`: In the "DEV Community API Keys" section create a new key by adding a description and clicking on "Generate API Key"

<br>

### 🚀 Hashnode

To obtain the token below, follow these steps:

Visit https://hashnode.com/settings/developer

- `HASHNODE_TOKEN`: In the "Personal Access Token" section create a new token by clicking on "Generate new token"
- `HASHNODE_PUBLICATION_ID`: To find the publication ID, navigate to your blog home page URL. Open the DevTools Console:

```javascript
console.log(window.__NEXT_DATA__.props.pageProps.publication.id);
```

<br>

### 🚀 Medium

To obtain the token below, follow these steps:

Visit https://medium.com/me/settings/security

- `MEDIUM_TOKEN`: Click "Integration tokens" and create a new token by entering the description & clicking on "Get token"
- `MEDIUM_AUTHOR_ID`: Run the following command in your own terminal - in the project root:

```bash
node utils/mediumId/idOnce.js
```

<br>

### 🚀 Twitter

- `TWITTER_PROFILE_NAME`: Your profile name on Twitter followed by @

<br>

Follow the steps [@humanwhocodes](https://humanwhocodes.com/blog/2023/04/automating-tweets-v2-api/) to obtain the tokens below:

- `TWITTER_API_KEY`
- `TWITTER_API_KEY_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`

<br>

### 🚀 LinkedIn

For the automated re-auth to work, the [Two-step verification](https://www.linkedin.com/mypreferences/d/two-factor-authentication) needs to be turned off. Your email & password below will be used for re-auth with LinkedIn (automated monthly - in headless mode - GitHub Actions). Post re-auth, the access token will be updated in the GitHub secrets via API call (details below).

**Reason**: The access token expires in 2 months. Btw, GitHub secrets are fully encrypted.

**_Alternative_**: To manually update GitHub secrets after performing a re-auth (before the access token expires) - in that case, no need to add the email & password below to your GitHub secrets. **Not to be discussed any further.**

- `LINKEDIN_USERNAME`: Your LinkedIn email
- `LINKEDIN_PASSWORD`: Your LinkedIn password

<br>

Step 1: Register the App

Create a LinkedIn Page & App (verified) in LinkedIn Developer Network with redirect url set to http://localhost:3000/auth & following products added:

- Share on LinkedIn
- Sign In with LinkedIn using OpenID Connect

Copy the Client ID and Client Secret keys:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

<br>

Step 2: Generate Access Token

With all the above details provided, run the following command in your terminal:

```bash
node utils/linkedInAuth/auth.js
```

<br>

This will directly update the GitHub secrets via API call.

**Note**: Check [line 70](https://github.com/siddhant-vij/Content-Amplify-Hub/blob/1ee2d29d271f16665e7c154e2e0722599c6b05dc/utils/linkedInAuth/auth.js#L70)

But, if you need to further develop this project or work locally - you can add a line to console.log the access_token to be saved to your .env file (already added in .gitignore):

- `LINKEDIN_ACCESS_TOKEN`

<br>

Step 3: Generate URN

Run the following command in your terminal:

```bash
node utils/linkedInAuth/urnOnce.js
```

To be run only once to get the URN (in the terminal) for the LinkedIn User with the access token:

- `LINKEDIN_URN`

<br>

### 🚀 Email

- `USER_TO_EMAIL`: Your primary gmail - acting as recipient.
- `USER_FROM_EMAIL`: Your own secondary gmail - acting as sender. You can use the primary gmail if you want to.
- `USER_PASSWORD`: This is not the gmail password, but the app password generated at https://security.google.com/settings/security/apppasswords. Use the `USER_FROM_EMAIL` for this.
- `SMTP_HOST`:smtp.gmail.com
- `SMTP_PORT`:465

<br>

### 🚀 GitHub

- `GH_USER`: Your GitHub username
- `GH_REPO`: Your GitHub repository name
- `SECRET_NAME`:LINKEDIN_ACCESS_TOKEN
- `GH_ACCESS_TOKEN`: Go to https://github.com/settings/tokens and Generate a new (classic) token with "repo" scope & no-expiry.

<br>

## Notion Setup

The following images will explain how to setup your Notion DB so that it integrates with the Content Amplify Hub.
- Image 1: Notion DB Page Properties (with Buttons)

Hashnode Tag IDs: https://github.com/Hashnode/support/blob/main/misc/tags.json

<img src="https://i.imgur.com/M6dlWIg.png" width="800px">

- Image 2: Blog Post Button

<img src="https://i.imgur.com/1PtZoP5.png" width="500px">

- Image 3: LinkedIn Post Button

<img src="https://i.imgur.com/A5UxKzR.png" width="500px">

- Image 4: X Text Tweet Button

<img src="https://i.imgur.com/Y8ArFUG.pngv" width="500px">

<br>

## Usage Instructions

### Local Setup

You can clone this repository, then run the following command after installing the dependencies (`npm install`) & setting up he .env file:

```bash
npm start
```

<br>

### GitHub Actions

You can clone this repository. For GitHub Actions to work, add all of the above secrets to your GitHub secrets (under Repository secrets) at

**<a style="text-decoration: none; color: inherit; cursor: inherit;">
https://github.com/{GitHub-Username}/{Repository-Name}/settings/secrets/actions
</a>**


Here's the cron schedule set up in GitHub Actions. Change it according to your needs:

- For amplify workflow. The following determines when the workflow runs. It's the user's job to set it up in the Notion so that the blog posts are published on Saturday every week & social media posts go live daily as below:
  - cron: "17 7 \* \* 6"
  - cron: "19 8 \* \* \*"
  - cron: "23 6 \* \* \*"
  - cron: "37 10 \* \* \*"
  - cron: "43 14 \* \* \*"
- For reAuth workflow:
  - To be run once every month on 5th Day at 01:13am. This is to ensure that the access token is updated in the GitHub secrets, which expires in 2 months.

<br>

## Contributions

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
1. **Create your Feature Branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
1. **Commit your Changes**:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
1. **Push to the Branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
1. **Open a Pull Request**

<br>

## License

Distributed under the MIT License. See [`LICENSE`](https://github.com/siddhant-vij/Content-Amplify-Hub/blob/main/LICENSE) for more information.

<br>

<p align="right">
  <a href="#content-amplify-hub">🔝 Back to top</a>
</p>
