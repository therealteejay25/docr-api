import { Request, Response } from "express";
import { githubScopes } from "../config/scopes/github";
import { env } from "../config/env";
import { getGitHubToken } from "../utils/github";
import { User } from "../models/User";
import { encrypt } from "../utils/encryption";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { creditsService } from "../services/credits.service";
import axios from "axios";
import { logger } from "../lib/logger";

const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID!;
const GITHUB_REDIRECT_URI = env.GITHUB_REDIRECT_URI!;

export const redirectToGitHub = (_req: Request, res: Response): Response | void => {
  const scopes = githubScopes.join(",");
  try {
    const state = Math.random().toString(36).substring(7);
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(
      GITHUB_REDIRECT_URI
    )}&state=${state}`;
    res.redirect(url);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return res
      .status(500)
      .json({ message: "Unable to get GitHub OAuth url", err: errorMessage });
  }
};

export const gitHubCallback = async (req: Request, res: Response): Promise<Response | void> => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ message: "No code provided." });
  }

  try {
    const tokenRes = await getGitHubToken(code);
    const userCheck = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenRes}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Docr",
      },
    });

    const userProfile = userCheck.data;
    const { encrypted, iv } = encrypt(tokenRes);

    let user = await User.findOne({ githubId: userProfile.id });
    if (!user) {
      user = await User.findOne({ email: userProfile.email });
    }

    if (user) {
      user.githubId = userProfile.id;
      user.githubToken = encrypted;
      user.githubTokenIv = iv;
      user.name = userProfile.name || user.name;
      user.avatarUrl = userProfile.avatar_url;
      await user.save();
    } else {
      user = await User.create({
        githubId: userProfile.id,
        name: userProfile.name,
        email:
          userProfile.email || `${userProfile.login}@users.noreply.github.com`,
        avatarUrl: userProfile.avatar_url,
        githubToken: encrypted,
        githubTokenIv: iv,
      });

      // Initialize credits for new user
      await creditsService.getOrCreateCredits(user._id.toString());
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
    });

    user.refreshToken = refreshToken;
    await user.save();

    // Redirect to frontend with tokens
    const frontendUrl = "http://localhost:3000";
    res.redirect(
      `${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.error("GitHub OAuth callback failed", { error: errorMessage });
    return res
      .status(500)
      .json({ message: "Authentication failed", error: errorMessage });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const { verifyRefreshToken } = await import("../utils/jwt");
    const payload = verifyRefreshToken(token);

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
};
