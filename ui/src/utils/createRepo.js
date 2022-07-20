import { Octokit } from "octokit";

export const createRepo = async (acess_token, repo_name, repo_options) => {
  const octokit = new Octokit({
    auth: acess_token,
  });

  const { data } = await octokit.request("POST /user/repos", {
    name: repo_name,
    ...repo_options,
  });

  return data;
};
