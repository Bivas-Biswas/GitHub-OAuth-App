import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { filesDay1, filesDay2, filesDay3 } from "./data";
import { deleteRepo } from "./utils";
import {
  handleCreateRepoAndUploadIntialFilesAndSecrects,
  handleDaywiseFolderCreateOrUpdate,
} from "./helper";

const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
const GITHUB_REDDRIECT_URL = "http://localhost:4000/api/auth/github";
const PATH = "/";
const SCOPE = "delete_repo repo";
const GITHUB_LOGIN_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDDRIECT_URL}?path=${PATH}&scope=${encodeURI(
  SCOPE
)}`;
const LOGIN_API_ENPOINT = `http://localhost:4000/api/me`;

/**
 * Github Static Details
 */
export const REPO_NAME = "TEST-SECRETS-101";
export const BRANCH_NAME = "main";
export const DYNAMIC_CHANGE_THA_NO_SECRETS = "DEVSNEST_THA_NO";

export const handleInitialSecrets = (intial_secrets) => {
  return [
    {
      name: "DEVSNEST_USER_ID",
      value: intial_secrets.desnest_user_id,
    },
    {
      name: "DEVSNEST_THA_NO",
      value: intial_secrets.tha_no,
    },
  ];
};

const App = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    (async function () {
      const usr = await axios
        .get(LOGIN_API_ENPOINT, {
          withCredentials: true,
        })
        .then((res) => res.data);
      setUser(usr);
    })();
  }, []);

  return (
    <div className="App">
      {!user ? (
        <a className={"login"} href={GITHUB_LOGIN_URL}>
          LOGIN WITH GITHUB
        </a>
      ) : (
        <>
          <h1>Welcome {user?.login}</h1>
          <div className={"wrapper"}>
            <button
              className="button"
              onClick={() =>
                handleCreateRepoAndUploadIntialFilesAndSecrects({
                  owner: user?.login,
                  access_token: user?.accessToken,
                  repo: REPO_NAME,
                  intial_secrets: {
                    desnest_user_id: "devsnest_test_101",
                    tha_no: "00",
                  },
                  repo_options: {
                    private: true,
                  },
                })
              }
            >
              Initalize the Repo <b>{REPO_NAME}</b>
            </button>
          </div>
          <div className={"wrapper"}>
            <button
              className="button"
              onClick={() =>
                handleDaywiseFolderCreateOrUpdate({
                  owner: user?.login,
                  access_token: user?.accessToken,
                  secret_value: "01",
                  message: "added day 1",
                  files: filesDay1,
                })
              }
            >
              Add Day 1
            </button>

            <button
              className="button"
              onClick={() =>
                handleDaywiseFolderCreateOrUpdate({
                  owner: user?.login,
                  access_token: user?.accessToken,
                  secret_value: "02",
                  message: "added day 2",
                  files: filesDay2,
                })
              }
            >
              Add Day 2
            </button>

            <button
              className="button"
              onClick={() =>
                handleDaywiseFolderCreateOrUpdate({
                  owner: user?.login,
                  access_token: user?.accessToken,
                  secret_value: "03",
                  message: "added day 3",
                  files: filesDay3,
                })
              }
            >
              Add Day 3
            </button>
          </div>
          <button
            className={"button"}
            style={{ marginTop: "20px" }}
            onClick={() =>
              deleteRepo({
                access_token: user?.accessToken,
                owner: user?.login,
              })
            }
          >
            Delete Repo <b>{REPO_NAME}</b>
          </button>
        </>
      )}
    </div>
  );
};

export default App;
