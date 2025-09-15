import { Router } from "express";
import { getVideoInfo } from "../controllers/youtube.controller.js";

const youtubeRoutes: Router = Router();

youtubeRoutes.post("/", getVideoInfo);

export default youtubeRoutes;

