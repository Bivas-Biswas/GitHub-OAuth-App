import { Octokit } from "octokit";

export const pushFiles = async ({
  owner,
  access_token,
  repo,
  branch_name,
  message,
  files,
}) => {
  /**
   *  Enable ocktokit
   */
  const octokit = new Octokit({
    auth: access_token,
  });

  /**
   * Get details of last commit of the repo
   * @type {{treeSha: string, commitSha: string}}
   */
  const currentCommit = await getCurrentCommit(
    octokit,
    owner,
    repo,
    branch_name
  );

  /**
   * Get files tree details of present commit
   * @type {{mode: string, path: string, sha: string, type: string, url: string }[]}
   */
  const currtTreeDetails = await getTreeDetails(
    octokit,
    owner,
    repo,
    branch_name,
    currentCommit.treeSha
  );

  /**
   * create blobs of all files one folder
   * @type {{sha: string}[]}
   */
  const filesBlobs = await Promise.all(
    files.map(createBlobForFile(octokit, owner, repo))
  );

  /**
   * use for create trees
   * @type {{mode: string, path: string, type: string, sha: string}[]}
   */
  const blobsTree = filesBlobs.map((blob, idx) => ({
    path: files[idx].path,
    mode: "100644",
    type: "blob",
    sha: blob.sha,
  }));

  /**
   * create new trees with blobs
   * @type {{sha: string, tree: {mode: string, path: string, type: string, sha: string}[]}}
   */
  const newTree = await createNewTree(octokit, owner, repo, blobsTree);

  /**
   * merge current tree with the new tree.
   * otherwise current tree update with new tree.
   * ------------------------
   *     merge tree
   *       /    \
   *      /      \
   *  current    new blobs
   *  tree        tree
   *  ------------------------
   * @type {{mode: string, path: string, type: string, sha: string, url: string}[]}
   */
  const mergeTree = [...currtTreeDetails, ...newTree.tree];

  const mergeTreesDetails = await createNewTree(
    octokit,
    owner,
    repo,
    mergeTree
  );

  /**
   * commit the merge tree
   * @type {{sha: string}}
   */
  const newCommit = await createNewCommit({
    octokit,
    owner,
    repo,
    message,
    parents: [currentCommit.commitSha],
    tree: mergeTreesDetails.sha,
  });

  /**
   * Update the head reference
   */
  await setBranchToCommit(octokit, owner, repo, branch_name, newCommit.sha);
};

/**
 * Docs - https://docs.github.com/en/rest/git/refs#update-a-reference
 *
 * Update a reference
 * @param octokit
 * @param owner
 * @param repo
 * @param branch
 * @param commitSha
 * @return {Promise<{node_id: string, object: {sha: string, type: string, url: string}, ref: string, url: string}>}
 */
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

/**
 *
 * Docs: https://docs.github.com/en/rest/git/commits#create-a-commit
 *
 * Create a commit
 *
 * @param octokit
 * @param owner
 * @param repo
 * @param message
 * @param parents
 * @param tree
 * @return {Promise<{sha: string}>}
 */
const createNewCommit = async ({
  octokit,
  owner,
  repo,
  message,
  parents,
  tree,
}) => {
  const { data } = await octokit.request(
    `POST /repos/${owner}/${repo}/git/commits`,
    {
      owner: owner,
      repo: repo,
      message: message,
      parents,
      tree,
    }
  );
  return { sha: data.sha };
};

/**
 * Docs: https://docs.github.com/en/rest/git/trees#create-a-tree
 *
 * Create a treee
 * @param octokit
 * @param owner
 * @param repo
 * @param tree
 * @return {Promise<{tree: {mode: string, path: string, type: string, sha: string, url: string}[], sha: string}>}
 */
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

  return {
    sha: data.sha,
    tree: data.tree,
  };
};

/**
 * Docs - https://docs.github.com/en/rest/git/trees#get-a-tree
 *
 * Get tree details
 * @param octokit
 * @param owner
 * @param repo
 * @param branch
 * @param treeSha
 * @return {Promise<{mode: string, path: string, sha: string, type: string, url: string }[]>}
 */
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

/**
 * Docs - https://docs.github.com/en/rest/git/refs#get-a-reference
 *
 * Get current commit detials api
 * @param octokit
 * @param owner
 * @param repo
 * @param branch
 * @return {Promise<{treeSha: string, commitSha}>}
 */
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

/**
 * Docs - https://docs.github.com/en/rest/git/blobs#create-a-blob
 *
 * Create a blob
 * @param octokit
 * @param owner
 * @param repo
 * @return {function(file:{path: string, content: string }): Promise<{sha: string}>}
 */
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
  return { sha: blobData.data.sha };
};
