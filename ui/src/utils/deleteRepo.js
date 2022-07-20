import { Octokit } from "octokit";
import { REPO_NAME } from "../App";

export const deleteRepo = async ({ access_token, owner, repo = REPO_NAME }) => {
  const octokit = new Octokit({
    auth: access_token,
  });

  const { data } = await octokit.request(`DELETE /repos/${owner}/${repo}`);

  return data;
};
