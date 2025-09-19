import axios from "axios";
import { HttpException } from "../exceptions/HttpException.js";
import type { Request } from "express";

const client_id = process.env.SPOTIFY_CLIENT_ID || "";
const client_secret = process.env.SPOTIFY_CLIENT_SECRET || "";
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || "";

export async function exchangeCodeForToken(code: string) {
  const data = new URLSearchParams({
    code,
    redirect_uri,
    grant_type: "authorization_code",
  });

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      data.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization":
            "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Spotify auth error:", error);
    throw new HttpException(500, "Failed to exchange token with Spotify!")
  }
}

// spotify.service.ts
export async function fetchSpotifyTokens(tokens: { access_token: string, refresh_token?: string }, endpoint: string) {
  try {
    return {
      data: (await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })).data,
    };
  } catch (err: any) {
    if (err.response?.status === 401 && tokens.refresh_token) {
      const newToken = await refreshSpotifyToken(tokens.refresh_token);
      const response = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
        headers: { Authorization: `Bearer ${newToken.access_token}` },
      });
      return {
        data: response.data,
        newAccessToken: newToken.access_token,
        newRefreshToken: newToken?.refresh_token || null,
      };
    }
    throw err;
  }
}

async function refreshSpotifyToken(refresh_token: string) {
  const response = await axios.post("https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: process.env.SPOTIFY_CLIENT_ID!
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization":
          "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
      }
    }
  );
  return response.data;
}


export const SpotifyService = {
  exchangeCodeForToken,
  fetchSpotifyTokens,
  refreshSpotifyToken
}
