import { commonFiles } from "../data";
import {
  createFileContent,
  createOrUpdateSecrets,
  createRepo,
  encryptSodium,
  filesContentBase64,
  getPublickey,
} from "../utils";
import { handleInitialSecrets } from "../App";

/**
 * ------------------------------------------------------------------------
 * |     Intial Process ( create reop, secrets, reame & actions add        |
 * -------------------------------------------------------------------------
 *
 * @param owner -> user github user anem
 * @param intial_secrets
 * @param access_token -> github accesss token
 * @param repo -> github repository name
 * @param repo_options -> github repository options
 * @returns {Promise<void>}
 * --------------------------------------------------
 *
 * Step 1: Create Private Repo
 * @function createRepo()
 *
 * Step 2: Create Action Secrets
 * @function handleCreateSecrets()
 *
 * Step 3: Add Readme and Action files
 * @function createFileContent()
 * -----------------------------------------
 *
 * Notes:
 * In empty repo and hidden files(start with .)
 * We cann't add files using tree because their no SHA of parent tree
 * so, here first readme file and action files using same function
 * ---------------------------------------------------------------------
 *
 */

export const handleCreateRepoAndUploadIntialFilesAndSecrects = async ({
  owner,
  intial_secrets,
  access_token,
  repo,
  repo_options = { private: true },
}) => {
  const commonFilesBase64 = filesContentBase64(commonFiles);

  await createRepo(access_token, repo, repo_options);

  await handleCreateSecrets({
    access_token,
    owner,
    repo,
    intial_secrets,
  });

  await createFileContent({
    owner,
    access_token,
    repo,
    message: "added readme",
    path: commonFilesBase64[0].path,
    content: commonFilesBase64[0].content,
  });

  await createFileContent({
    owner,
    access_token,
    repo,
    message: "added action file",
    path: commonFilesBase64[1].path,
    content: commonFilesBase64[1].content,
  });
};

const handleCreateSecrets = async ({
  access_token,
  owner,
  repo,
  intial_secrets,
}) => {
  const publicSecret = await getPublickey({ access_token, owner, repo });

  await Promise.all(
    handleInitialSecrets(intial_secrets).map(async (secret) => {
      return await createOrUpdateSecrets({
        access_token,
        owner,
        repo,
        secret_name: secret.name,
        encrypted_value: await encryptSodium(secret.value, publicSecret.key),
        key_id: publicSecret.key_id,
      });
    })
  );
};
