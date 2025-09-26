import type { NextFunction, Request, Response } from "express";
import querystring from "querystring";
import crypto from "crypto";
import { HttpException } from "../exceptions/HttpException.js";
import { SpotifyService, type SpotifyTokens } from "../services/spotify.service.js";

const client_id = process.env.SPOTIFY_CLIENT_ID || "";
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || "";

export function authorize(req: Request, res: Response, next: NextFunction) {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("spotify_auth_state", state);

  const scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private"

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: true
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
    //return res.json({ success: true })
    //res.redirect("http://localhost:8080?loggedIn=true");
    res.send(`
    <script>
      window.opener.postMessage({ type: "SPOTIFY_AUTH_SUCCESS" }, "http://localhost:8080");
      window.close();
    </script>
  `);

  } catch (error) {
    next(error)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      res.clearCookie("connect.sid");
      return res.json({ success: true });
    });
    console.log("session deleted")
  } catch (error) {
    next(error);
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
    const tokens = await checkToken(req)

    const profileResponse = await SpotifyService.getProfile(tokens);
    const data = profileResponse.data;
    const simplified = { display_name: data?.display_name, images: data?.images };
    req.session.spotify!.id = data?.id;

    res.json(simplified);
  } catch (err) {
    next(err);
  }
}

export async function createPlaylist(req: Request, res: Response, next: NextFunction) {
  try {
    let spotifyInfo = req.session.spotify!;
    const { playlistName, description, isPublic, tracks } = req.body;

    const tokens = await checkToken(req);

    if (!spotifyInfo.id) {
      const profile = await SpotifyService.getProfile(tokens);
      if (!profile.data?.id) throw new Error("Failed to fetch Spotify profile");
      spotifyInfo.id = profile.data.id;
    }

    const createdPlaylistRes = await SpotifyService.createPlaylist(
      tokens,
      spotifyInfo.id!,
      playlistName,
      description,
      isPublic
    );
    const createdPlaylist = createdPlaylistRes.data;

    const addTracksRes = await SpotifyService.addToPlaylist(
      tokens,
      createdPlaylist.id,
      tracks,
      0
    );

    res.json({
      playlist: createdPlaylist,
      addTracksResult: addTracksRes.data,
    });
  } catch (error) {
    next(error);
  }
}

async function checkToken(req: Request): Promise<SpotifyTokens> {
  const tokens = req.session?.spotify
  if (!tokens) {
    throw new HttpException(401, "Not authorized")
  }
  if (tokens.expires_at - Date.now() < 60 * 1000) {
    try {
      const { access_token, refresh_token, expires_in } = await SpotifyService.refreshSpotifyToken(tokens.refresh_token);
      if (access_token)
        req.session.spotify!.access_token = access_token
      if (refresh_token)
        req.session.spotify!.refresh_token = refresh_token
      if (expires_in)
        req.session.spotify!.expires_at = Date.now() + expires_in * 1000
      return { access_token, refresh_token }
    } catch (error) {
      throw new Error("Error refreshing token")
    }
  }
  return {
    access_token: req.session.spotify!.access_token,
    refresh_token: req.session.spotify!.refresh_token,
  }
}

