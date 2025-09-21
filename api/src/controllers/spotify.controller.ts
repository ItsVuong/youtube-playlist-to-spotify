import type { NextFunction, Request, Response } from "express";
import querystring from "querystring";
import crypto from "crypto";
import { HttpException } from "../exceptions/HttpException.js";
import { SpotifyService } from "../services/spotify.service.js";

const client_id = process.env.SPOTIFY_CLIENT_ID || "";
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || "";

export function authorize(req: Request, res: Response, next: NextFunction) {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("spotify_auth_state", state);

  const scope = "user-read-private"

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
}

export async function authCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const state = req.cookies?.spotify_auth_state
    console.log("state: ", state)

    if (!state || state !== req.query?.state)
      throw new HttpException(400, "Invalid request")

    const code = req.query?.code
    if (!code)
      throw new HttpException(400, "Invalid request")

    const tokenData = await SpotifyService.exchangeCodeForToken(code as string)
    console.log(tokenData)
    req.session.spotify = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000
    }
    return res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function searchTrack(req: Request, res: Response, next: NextFunction) {
  try {
    const { artist, title } = req.query as { artist: string; title: string };
    const spotifyTokens = req.session!.spotify
    console.log(spotifyTokens, title)

    if (!spotifyTokens || !title) throw new Error()

    const searchResult = await SpotifyService.searchTrack(spotifyTokens,
      { title, artist })
    res.json(searchResult.data)
  } catch (error) {
    next(error)
  }
}

export async function getProfileInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await callAndSetTokens(req, "me")

    const simplified = {
      username: data.display_name,
      country: data.country,
      followers: data.followers.total,
    };

    res.json(simplified);
  } catch (err) {
    next(err);
  }
}

async function callAndSetTokens(req: Request, endpoint: string): Promise<any> {
  const { data, newAccessToken, newRefreshToken } = await SpotifyService.callSpotify(
    req.session.spotify!,
    endpoint
  );

  if (newAccessToken) {
    req.session.spotify!.access_token = newAccessToken;
  }
  if (newRefreshToken) {
    req.session.spotify!.refresh_token = newRefreshToken;
  }
  return data
}

