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
    req.session.spotify = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token
    }
    console.log(req.session.spotify)
    return res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function getProfileInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, newAccessToken, newRefreshToken } = await SpotifyService.fetchSpotifyTokens(
      req.session.spotify!,
      "me"
    );

    if (newAccessToken) {
      req.session.spotify!.access_token = newAccessToken;
    }
    if (newRefreshToken) {
      req.session.spotify!.refresh_token = newRefreshToken;
    }

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

export async function testRefreshToken(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.session.spotify?.refresh_token
  if (!refreshToken)
    throw new HttpException(401, "Unauthorized")
  const refreshTokenResponse = await SpotifyService.refreshSpotifyToken(refreshToken)
  console.log(refreshTokenResponse)
  return res.json(refreshTokenResponse)
}
