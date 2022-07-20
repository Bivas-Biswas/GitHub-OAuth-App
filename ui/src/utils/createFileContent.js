import { Octokit } from "octokit";

export const createFileContent = async ({
  owner,
  acess_token,
  repo,
  path,
  content,
  message,
}) => {
  const octokit = new Octokit({
    auth: acess_token,
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
