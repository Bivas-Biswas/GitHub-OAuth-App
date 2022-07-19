import { Octokit } from "octokit";

export const addWebHooks = async (owner, acess_token, repo, options) => {
  const { hookName, events, active = true, config = {} } = options;
  const octokit = new Octokit({
    auth: acess_token,
  });

  const { data } = await octokit.request(`POST /repos/${owner}/${repo}/hooks`, {
    owner: owner,
    repo: repo,
    name: hookName,
    active,
    events,
    config,
  });

  return data;
};
