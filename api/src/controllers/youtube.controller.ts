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

    if (id && !isValidYouTubeVideoId(id)) {
      throw new HttpException(400, "Invalid video id");
    }

    const info = await YoutubeService.getVideoInformation(url)
    //return res.json({
    //  continuationToken: info.continuationToken,
    //  title: YoutubeService.getTitleFromYtInitialData(info.ytInitialData),
    //  description: YoutubeService.getDescriptionsFromInitialData(info.ytInitialData),
    //  chapters: YoutubeService.getChaptersFromInitialData(info.ytInitialData),
    //  musics: YoutubeService.getIncludedMusicFromInitialData(info.ytInitialData)
    //})
    
    return res.json(info) 
  } catch (error: any) {
    next(error)
  }
};

export async function getNextData(req: Request, res: Response, next: NextFunction){
  return res.json(YoutubeService.getFirstComments(await YoutubeService.getNextData("")))
}

function isValidYouTubeVideoId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

