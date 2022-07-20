import { Octokit } from "octokit";

export const pushFiles = async ({
  owner,
  access_token,
  repo,
  branch_name,
  message,
  files,
}) => {
  const octokit = new Octokit({
    auth: access_token,
  });

  const currentCommit = await getCurrentCommit(
    octokit,
    owner,
    repo,
    branch_name
  );

  const currtTreeDetails = await getTreeDetails(
    octokit,
    owner,
    repo,
    branch_name,
    currentCommit.treeSha
  );

  const filesBlobs = await Promise.all(
    files.map(createBlobForFile(octokit, owner, repo))
  );

  const blobsTree = filesBlobs.map((blob, idx) => ({
    path: files[idx].path,
    mode: "100644",
    type: "blob",
    sha: blob.sha,
  }));

  const newTree = await createNewTree(octokit, owner, repo, blobsTree);

  const mergeTree = [...currtTreeDetails, ...newTree.tree];

  const mergeTreesDetails = await createNewTree(
    octokit,
    owner,
    repo,
    mergeTree
  );

  const newCommit = await createNewCommit(
    octokit,
    owner,
    repo,
    message,
    mergeTreesDetails.sha,
    currentCommit.commitSha
  );

  await setBranchToCommit(octokit, owner, repo, branch_name, newCommit.sha);
};

const setBranchToCommit = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = `master`,
  commitSha: string
) => {
  const { data } = await octokit.request(
    `PATCH /repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      owner: owner,
      repo: repo,
      ref: `heads/${branch}`,
      sha: commitSha,
      force: true,
    }
  );
  return data;
};

const createNewCommit = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  message: string,
  currentTreeSha: string,
  currentCommitSha: string
) => {
  const { data } = await octokit.request(
    `POST /repos/${owner}/${repo}/git/commits`,
    {
      owner: owner,
      repo: repo,
      message: message,
      parents: [currentCommitSha],
      tree: currentTreeSha,
    }
  );
  return data;
};

const createNewTree = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  tree
) => {
  const { data } = await octokit.request(
    `POST /repos/${owner}/${repo}/git/trees`,
    {
      owner: owner,
      repo: repo,
      tree,
    }
  );

  return data;
};

const getTreeDetails = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = "master",
  treeSha: string
) => {
  const { data } = await octokit.request(
    `GET /repos/${owner}/${repo}/git/trees/${treeSha}`,
    {
      owner: owner,
      repo: repo,
      tree_sha: treeSha,
    }
  );

  return data.tree;
};

const getCurrentCommit = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = "master"
) => {
  const { data: refData } = await octokit.request(
    `GET /repos/${owner}/${repo}/git/ref/heads/${branch}`,
    {
      owner: owner,
      repo: repo,
      ref: `heads/${branch}`,
    }
  );

  const commitSha = refData.object.sha;

  const { data: commitData } = await octokit.request(
    `GET /repos/${owner}/${repo}/git/commits/${commitSha}`,
    {
      owner: owner,
      repo: repo,
      commit_sha: commitSha,
    }
  );

  return {
    commitSha,
    treeSha: commitData.tree.sha,
  };
};

const createBlobForFile = (octokit, owner, repo) => async (file) => {
  const blobData = await octokit.request(
    `POST /repos/${owner}/${repo}/git/blobs`,
    {
      owner: owner,
      repo: repo,
      content: file.content,
      encoding: "base64",
    }
  );
  return blobData.data;
};
