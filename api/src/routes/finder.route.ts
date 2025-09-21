import { Router } from "express";
import { searchTracksByYtURL } from "../controllers/finder.controller.js";

const finderRoutes: Router = Router();

finderRoutes.post("/tracks-by-url", searchTracksByYtURL)

export default finderRoutes
