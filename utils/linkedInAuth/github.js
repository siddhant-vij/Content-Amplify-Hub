import { Octokit } from "@octokit/core";
import _sodium from "libsodium-wrappers";
import { sendEmail } from "../failure/email.js";

const user = process.env.GH_USER;
const repo = process.env.GH_REPO;
const secret = process.env.SECRET_NAME;
const ghAccessToken = process.env.GH_ACCESS_TOKEN;

const octokit = new Octokit({
  auth: ghAccessToken,
});

const getRepoPublicKey = async () => {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/actions/secrets/public-key",
      {
        owner: user,
        repo: repo,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    return data;
  } catch (error) {
    await sendEmail(
      "GitHub - Secret Update Error",
      `URGENT: Handle this manually right now!!!
    
${error.message}`
    );
    process.exit(1);
  }
};

export const updateGitHubSecret = async (secretValue) => {
  await _sodium.ready;
  const sodium = _sodium;
  const { key, key_id } = await getRepoPublicKey();

  const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
  const binsec = sodium.from_string(secretValue);

  const encBytes = sodium.crypto_box_seal(binsec, binkey);

  const secretValueEncrypted = sodium.to_base64(
    encBytes,
    sodium.base64_variants.ORIGINAL
  );

  try {
    await octokit.request(
      "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
      {
        owner: user,
        repo: repo,
        secret_name: secret,
        encrypted_value: secretValueEncrypted,
        key_id: key_id,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log("GitHub - Secret Updated");
  } catch (error) {
    await sendEmail(
      "GitHub - Secret Update Error",
      `URGENT: Handle this manually right now!!!
    
${error.message}`
    );
    process.exit(1);
  }
};
