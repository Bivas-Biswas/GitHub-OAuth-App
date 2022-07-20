import { Octokit } from "octokit";

export const createFileContent = async ({
  owner,
  access_token,
  repo,
  path,
  content,
  message,
}) => {
  const octokit = new Octokit({
    auth: access_token,
  });

  const { data } = await octokit.request(
    `PUT /repos/${owner}/${repo}/contents/${path}`,
    {
      message: message,
      content: content,
    }
  );

  return data;
};
