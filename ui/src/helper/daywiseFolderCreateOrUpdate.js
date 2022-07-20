import {
  createOrUpdateSecrets,
  encryptSodium,
  filesContentBase64,
  getPublickey,
  pushFiles,
} from "../utils";
import { BRANCH_NAME, DYNAMIC_CHANGE_THA_NO_SECRETS, REPO_NAME } from "../App";

/**
 * --------------------------------------------
 * |     Day wise folder create or update     |
 * --------------------------------------------
 *
 * @param owner -> github user name
 * @param access_token -> github access token
 * @param repo -> github repository name
 * @param secret_name -> action secret key
 * @param secret_value -> action secret value
 * @param message -> commit message
 * @param branch_name
 * @param files -> folder needs to be create or update
 * @returns {Promise<void>}
 * --------------------------------------------
 *
 * Step - 1 : update the DEVSNEST_THA_NO secrets
 * @function handleUpdateSecrets()
 *
 * Step - 2 : create or update the Daywise folder
 * @function pushFiles()
 * --------------------------------------------
 *
 * Notes: we can't update multiple folder same time.
 * ---------------------------------------------------
 */

export const handleDaywiseFolderCreateOrUpdate = async ({
  owner,
  access_token,
  repo = REPO_NAME,
  secret_name = DYNAMIC_CHANGE_THA_NO_SECRETS,
  secret_value,
  message = "added files",
  branch_name = BRANCH_NAME,
  files,
}) => {
  await handleUpdateSecrets({
    access_token,
    owner,
    repo,
    secret_name,
    secret_value,
  });
  await pushFiles({
    owner,
    access_token,
    repo,
    message,
    branch_name,
    files: [...filesContentBase64(files)],
  });
};

const handleUpdateSecrets = async ({
  access_token,
  owner,
  repo,
  secret_name,
  secret_value,
}) => {
  const publicSecret = await getPublickey({
    access_token,
    owner,
    repo,
  });

  await createOrUpdateSecrets({
    access_token,
    owner,
    repo,
    secret_name: secret_name,
    encrypted_value: await encryptSodium(secret_value, publicSecret.key),
    key_id: publicSecret.key_id,
  });
};
