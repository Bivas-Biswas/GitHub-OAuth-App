import { Octokit } from "octokit";

export const createFileContent = async ({
  owner,
  acess_token,
  repo,
  path,
  content,
  message,
}) => {
  console.log(acess_token);
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
