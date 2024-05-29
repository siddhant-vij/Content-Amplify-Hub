import fetch from "node-fetch";
import { sendEmail } from "../failure/email.js";

const HASHNODE_GQL_URL = "https://gql.hashnode.com";
const HASHNODE_TOKEN = process.env.HASHNODE_TOKEN;

const publishPostMutation = `
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        title
        publication {
          id
        }
        content {
          markdown
        }
        url
        coverImage {
          url
        }
        tags {
          id
        }
        ogMetaData {
          image
        }
        seo {
          title
          description
        }
        features {
          tableOfContents {
            isEnabled
          }
        }
      }
    }
  }
`;

const fetchGraphQL = async (query, variables) => {
  const response = await fetch(HASHNODE_GQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: HASHNODE_TOKEN,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();
  if (result.errors) {
    await sendEmail("Hashnode - GQL Error", result.errors[0].message);
    process.exit(1);
  }
  return result.data;
};

export const publishHashnode = async (hashnodeContent) => {
  const {
    title,
    publicationId,
    contentMarkdown,
    coverImageOptions,
    tags,
    metaTags,
    settings,
  } = hashnodeContent;

  const variables = {
    input: {
      title,
      publicationId,
      contentMarkdown,
      coverImageOptions,
      tags,
      metaTags,
      settings,
    },
  };

  const response = await fetchGraphQL(publishPostMutation, variables);
  return response.publishPost.post.url;
};
