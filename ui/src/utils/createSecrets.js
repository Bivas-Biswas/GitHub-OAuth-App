import { Octokit } from "octokit";

export const createOrUpdateSecrets = async ({
  access_token,
  owner,
  repo,
  secret_name,
  encrypted_value,
  key_id,
}) => {
  const octokit = new Octokit({
    auth: access_token,
  });
  await octokit.request(
    `PUT /repos/${owner}/${repo}/actions/secrets/${secret_name}`,
    {
      owner,
      repo,
      secret_name,
      encrypted_value,
      key_id,
    }
  );
};

export const getPublickey = async ({ access_token, owner, repo }) => {
  const octokit = new Octokit({
    auth: access_token,
  });

  const { data } = await octokit.request(
    `GET /repos/${owner}/${repo}/actions/secrets/public-key`,
    {
      owner: owner,
      repo: repo,
    }
  );

  return data;
};

export const fetchSecrets = async ({ access_token, owner, repo }) => {
  const octokit = new Octokit({
    auth: access_token,
  });

  const { data } = await octokit.request(
    `GET /repos/${owner}/${repo}/actions/secrets`,
    {
      owner: owner,
      repo: repo,
    }
  );

  return data;
};
