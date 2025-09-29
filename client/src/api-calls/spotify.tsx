import { AxiosResponse } from "axios";
import { SpotifyTrack } from "../types/spotify";
import axiosClient from "./axios";

export interface Profile {
  display_name: string,
  images: {
    height: number, url: string, width: number
  }[]
}

export function fetchProfile(): Promise<AxiosResponse<Profile>> {
  return axiosClient.get<Profile>("spotify/me");
}

export function createPlaylist({ playlistName, description, isPublic, tracks }:
  { playlistName: string, description: string, isPublic: boolean, tracks: string[] }) {
  return axiosClient.post("spotify/playlists", { playlistName, description, isPublic, tracks })
}

export async function playlistLookup(url: string): Promise<SpotifyTrack[][]> {
  const response = await axiosClient.post<SpotifyTrack[][]>("finder/tracks-by-url", { url });
  return response.data;
}
