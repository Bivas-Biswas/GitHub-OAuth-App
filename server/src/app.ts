import express, { Request, Response } from "express";
import querystring from "querystring";
import jwt from "jsonwebtoken";
import { get } from "lodash";
import cookieParser from "cookie-parser";
import axios from "axios";
import cors from "cors";
import { GitHubUser } from "./index.types";

const app = express();

require("dotenv").config();

app.use(cookieParser());

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_AUTH_ENDPOINT = "https://github.com/login/oauth/access_token";
const secret = "secret";
const COOKIE_NAME = "github-jwt";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const getGitHubUser = async ({
  code,
}: {
  code: string;
}): Promise<GitHubUser> => {
  const githubToken = await axios
    .post(
      `${GITHUB_AUTH_ENDPOINT}?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
    )
    .then((res) => res.data)

    .catch((error) => {
      throw error;
    });

  const decoded = querystring.parse(githubToken);

  const accessToken = decoded.access_token;

  return axios
    .get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((res) => {
      if (accessToken) {
        return { ...res.data, accessToken };
      }
    })
    .catch((error) => {
      console.error(`Error getting user from GitHub`);
      throw error;
    });
};

app.get("/api/auth/github", async (req: Request, res: Response) => {
  const code = get(req, "query.code");
  const path = get(req, "query.path", "/");

  if (!code) {
    throw new Error("No code!");
  }

  const gitHubUser = await getGitHubUser({ code });

  const token = jwt.sign(gitHubUser, secret);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    domain: "localhost",
  });

  res.redirect(`http://localhost:3000${path}`);
});

app.get("/api/me", (req: Request, res: Response) => {
  const cookie = get(req, `cookies[${COOKIE_NAME}]`);

  try {
    const decode = jwt.verify(cookie, secret);

    return res.send(decode);
  } catch (e) {
    return res.send(null);
  }
});

app.listen(4000, () => {
  console.log("Server is listening");
});
