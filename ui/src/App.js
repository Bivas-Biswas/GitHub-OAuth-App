import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { commonFiles, filesDay1, filesDay2, filesDay3 } from "./data";
import {
  createFileContent,
  createRepo,
  deleteRepo,
  pushFiles,
  utf8_to_b64,
} from "./utils";

const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
const GITHUB_REDDRIECT_URL = "http://localhost:4000/api/auth/github";
const PATH = "/";
const SCOPE = "delete_repo repo";
const GITHUB_LOGIN_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDDRIECT_URL}?path=${PATH}&scope=${encodeURI(
  SCOPE
)}`;
const LOGIN_API_ENPOINT = `http://localhost:4000/api/me`;
const REPO_NAME = "GitHub OAuth App";
const BRANCH_NAME = "main";

const filesContentBase64 = (files) => {
  return files.map((file) => ({
    path: file.path,
    content: utf8_to_b64(file.content),
  }));
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

  const commonFilesBase64 = filesContentBase64(commonFiles);

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
              onClick={() => {
                createRepo(user?.accessToken, REPO_NAME, { private: true });
              }}
            >
              Create repo <b>{REPO_NAME}</b>
            </button>

            <button
              className="button"
              onClick={() => {
                createFileContent({
                  owner: user?.login,
                  acess_token: user?.accessToken,
                  repo: REPO_NAME,
                  message: "added readme",
                  path: commonFilesBase64[0].path,
                  content: commonFilesBase64[0].content,
                });
              }}
            >
              Initial Commit Readme Add
            </button>

            <button
              className="button"
              onClick={() => {
                createFileContent({
                  owner: user?.login,
                  acess_token: user?.accessToken,
                  repo: REPO_NAME,
                  message: "added action file",
                  path: commonFilesBase64[1].path,
                  content: commonFilesBase64[1].content,
                });
              }}
            >
              Add Action file
            </button>
          </div>
          <div className={"wrapper"}>
            <button
              className="button"
              onClick={() =>
                pushFiles({
                  options: {
                    userName: user?.login,
                    acessToken: user?.accessToken,
                    reponame: REPO_NAME,
                    message: "added day 1",
                    branchName: BRANCH_NAME,
                  },
                  files: [...filesContentBase64(filesDay1)],
                })
              }
            >
              Add Day 1
            </button>

            <button
              className="button"
              onClick={() =>
                pushFiles({
                  options: {
                    userName: user?.login,
                    acessToken: user?.accessToken,
                    reponame: REPO_NAME,
                    message: "added day 2",
                    branchName: BRANCH_NAME,
                  },
                  files: [...filesContentBase64(filesDay2)],
                })
              }
            >
              Add Day 2
            </button>

            <button
              className="button"
              onClick={() =>
                pushFiles({
                  options: {
                    userName: user?.login,
                    acessToken: user?.accessToken,
                    reponame: REPO_NAME,
                    message: "added day 3",
                    branchName: BRANCH_NAME,
                  },
                  files: [...filesContentBase64(filesDay3)],
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
                repo: REPO_NAME,
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
