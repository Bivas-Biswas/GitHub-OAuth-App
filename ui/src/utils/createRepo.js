import { Octokit } from "octokit";

export const createRepo = async (acess_token, repo_name, { ...rest }) => {
  const octokit = new Octokit({
    auth: acess_token,
  });

  const { data } = await octokit.request("POST /user/repos", {
    name: repo_name,
    ...rest,
  });

  return data;
};
