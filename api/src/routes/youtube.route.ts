import { Router } from "express";
import { getNextData, getVideoInfo } from "../controllers/youtube.controller.js";

const youtubeRoutes: Router = Router();

youtubeRoutes.post("/", getVideoInfo);
youtubeRoutes.post("/next", getNextData);

export default youtubeRoutes;

