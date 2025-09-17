import type { NextFunction, Request, Response } from "express";
import { YoutubeService } from "../services/youtube.service.js";
import { HttpException } from "../exceptions/HttpException.js";

export async function getVideoInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const url = req.body.url;

    if (typeof url !== "string" || url.trim() === "") {
      throw new HttpException(400, "Invalid url");
    }
    
    const matchId = url.match(/v=([^&#]+)/);
    console.log(matchId)
    const id = matchId ? matchId[1] : null;

    if (id && !isValidYouTubeVideoId(id)){
      throw new HttpException(400, "Invalid video id");
    }

    const info = await YoutubeService.extractYtInitialData(url)
    return res.json(info)
  } catch (error: any) {
    next(error)
  }
};

function isValidYouTubeVideoId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

