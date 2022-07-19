import { Octokit } from "octokit";

export const deleteRepo = async ({ access_token, owner, repo }) => {
  const octokit = new Octokit({
    auth: access_token,
  });

  const { data } = await octokit.request(`DELETE /repos/${owner}/${repo}`);

  return data;
};
