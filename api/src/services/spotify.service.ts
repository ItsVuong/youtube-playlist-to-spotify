import axios, { type AxiosRequestConfig, type Method } from "axios";
import { HttpException } from "../exceptions/HttpException.js";

const client_id = process.env.SPOTIFY_CLIENT_ID || "";
const client_secret = process.env.SPOTIFY_CLIENT_SECRET || "";
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || "";

export interface SpotifyTokens {
  access_token: string,
  refresh_token: string | undefined,
  expire_at?: number,
}

interface SpotifyCallOptions {
  method?: Method;
  params?: Record<string, any>;
  body?: Record<string, any>;
}

async function exchangeCodeForToken(code: string) {
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

// axios wrapper for spotify apis
async function callSpotify(
  tokens: SpotifyTokens,
  endpoint: string,
  options: SpotifyCallOptions = {}
): Promise<{ data: any; newAccessToken?: string; newRefreshToken?: string }> {
  const { method = "GET", params, body } = options;

  const axiosRequestConfig: AxiosRequestConfig = {
    url: `https://api.spotify.com/v1/${endpoint}`,
    method,
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
    },
  }

  if (body) {
    axiosRequestConfig.data = body
  }
  if (params) {
    axiosRequestConfig.params = params
  }

  try {
    const response = await axios.request(axiosRequestConfig);

    return { data: response.data };
  } catch (err: any) {
    if (err.response?.status === 401 && tokens.refresh_token) {
      // Refresh token
      const newToken = await refreshSpotifyToken(tokens.refresh_token);
      axiosRequestConfig.headers!.Authorization = `Bearer ${newToken.access_token}`

      // Retry once with new token
      const retryResponse = await axios.request(axiosRequestConfig);

      return {
        data: retryResponse.data,
        newAccessToken: newToken.access_token,
        newRefreshToken: newToken.refresh_token ?? undefined,
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

async function searchTrack(
  tokens: SpotifyTokens,
  track: { artist?: string | undefined, title: string }
) {
  let q = `track:${track.title}`;
  if (track.artist) {
    q += ` artist:${track.artist}`;
  }

  const response = await callSpotify(tokens, "search", {
    params: { q, type: "track", market: "ES", limit: 15, offset: 0 }
  });

  return response.data.tracks.items;
}

async function getProfile(tokens: SpotifyTokens) {
  const response = await callSpotify(tokens, "me")
  return response
}

async function createPlaylist(tokens: SpotifyTokens, userId: string, playlistName: string, description: string, isPublic: boolean) {
  const response = await callSpotify(tokens,
    `users/${userId}/playlists`,
    { body: { name: playlistName, description, public: isPublic } });
  return response
}

async function addToPlaylist(tokens: SpotifyTokens, playlistId: string, trackUris: string[], position: number = 0) {
  const response = await callSpotify(tokens,
    `playlists/${playlistId}/tracks`,
    {
      body: {
        uris: trackUris, position
      }
    })
  return response
}

export const SpotifyService = {
  exchangeCodeForToken,
  callSpotify,
  refreshSpotifyToken, searchTrack,
  getProfile,
  createPlaylist,
  addToPlaylist
}
