import { Router } from "express";
import { authCallback, authorize, createPlaylist, getProfileInfo, logout, searchTrack } from "../controllers/spotify.controller.js";

const spotifyRoutes: Router = Router();

spotifyRoutes.get("/auth", authorize);
spotifyRoutes.get("/callback", authCallback);
spotifyRoutes.get("/me", getProfileInfo);
spotifyRoutes.get("/search", searchTrack);
spotifyRoutes.post("/logout", logout);
spotifyRoutes.post("/playlists", createPlaylist);

export default spotifyRoutes;
