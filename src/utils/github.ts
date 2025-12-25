import axios from "axios";
import { env } from "../config/env";

const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET!;
const GITHUB_REDIRECT_URI = env.GITHUB_REDIRECT_URI!;

export const getGitHubToken = async (code: string): Promise<string> => {
  const response = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (response.data.error) {
    throw new Error(`GitHub OAuth Error: ${response.data.error_description}`);
  }

  return response.data.access_token;
};