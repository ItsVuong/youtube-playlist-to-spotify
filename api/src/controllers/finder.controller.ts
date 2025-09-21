import type { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/HttpException.js";
import { searchTracks } from "../services/music.service.js";

export async function searchTracksByYtURL(req: Request, res: Response, next: NextFunction) {
  try {
    const url = req.body;

    if (typeof url !== "string" || url.trim() === "") {
      throw new HttpException(400, "Invalid url");
    }

    const matchId = url.match(/v=([^&#]+)/);
    console.log(matchId)
    const id = matchId ? matchId[1] : null;

    if (id && !isValidYouTubeVideoId(id)) {
      throw new HttpException(400, "Invalid video id");
    }

    const tokens = req.session!.spotify
    if (!tokens) throw new HttpException(401, "Spotify is not authorized")

    const extractSongs = await searchTracks(tokens, url)

    return res.json(extractSongs)
  } catch (error: any) {
    next(error)
  }
}

function isValidYouTubeVideoId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}
