import type { Request, Response } from "express";
import { YoutubeService } from "../services/youtube.service.js";

export  async function getVideoInfo(req: Request, res: Response) {
  console.log(req.body)
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: "Bad request! Missing video URL." });
  }
  const info = await YoutubeService.getVideoInfo(url)
  return res.json(info)
};
