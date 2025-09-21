import { Router } from "express";
import { authCallback, authorize, getProfileInfo, searchTrack } from "../controllers/spotify.controller.js";

const spotifyRoutes: Router = Router();

spotifyRoutes.get("/auth", authorize);
spotifyRoutes.get("/callback", authCallback);
spotifyRoutes.get("/me", getProfileInfo);
spotifyRoutes.get("/search", searchTrack);

export default spotifyRoutes;
