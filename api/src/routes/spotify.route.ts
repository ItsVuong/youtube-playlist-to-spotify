import { Router } from "express";
import { authCallback, authorize, getProfileInfo, testRefreshToken } from "../controllers/spotify.controller.js";

const spotifyRoutes: Router = Router();

spotifyRoutes.get("/auth", authorize);
spotifyRoutes.get("/callback", authCallback);
spotifyRoutes.get("/me", getProfileInfo);
spotifyRoutes.get("/refresh", testRefreshToken);

export default spotifyRoutes;
