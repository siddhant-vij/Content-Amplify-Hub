import { gql, GraphQLClient } from "graphql-request";

const HASHNODE_GQL_URL = "https://gql.hashnode.com";

const hashnodeClient = new GraphQLClient(HASHNODE_GQL_URL, {
  headers: {
    Authorization: process.env.HASHNODE_TOKEN,
  },
});

const publishPostMutation = gql`
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

  const response = await hashnodeClient.request(publishPostMutation, variables);

  return response.publishPost.post.url;
};
