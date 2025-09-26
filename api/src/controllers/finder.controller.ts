import type { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/HttpException.js";
import { searchTracks } from "../services/music.service.js";

export async function searchTracksByYtURL(req: Request, res: Response, next: NextFunction) {
  try {
    const url = req.body.url;

    if (typeof url !== "string" || url.trim() === ""
      || url?.trim().length > 500 || !isValidYoutubeUrl(url.trim())) {
      throw new HttpException(400, "Invalid url");
    }

    const matchId = url.match(/v=([^&#]+)/);
    console.log(matchId)
    const id = matchId ? matchId[1] : null;

    if (id && !isValidYoutubeVideoId(id)) {
      throw new HttpException(400, "Invalid video id");
    }

    const tokens = req.session!.spotify
    if (!tokens) throw new HttpException(401, "Spotify is not authorized")

    const extractSongs = await searchTracks(tokens, url.trim())

    return res.json(extractSongs)
  } catch (error: any) {
    next(error)
  }
}

function isValidYoutubeUrl(url: string) {
  const ytUrlRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&?].*)?$/;
  return ytUrlRegex.test(url)
}

function isValidYoutubeVideoId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}
