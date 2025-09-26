import { HttpException } from "../exceptions/HttpException.js";
import { GeminiService } from "./gemini.service.js";
import { SpotifyService, type SpotifyTokens } from "./spotify.service.js";
import { YoutubeService } from "./youtube.service.js";

export async function searchTracks(tokens: SpotifyTokens, videoUrl: string) {
  const info = await YoutubeService.getVideoInformation(videoUrl);
  const extractSongs = await GeminiService.getSongsFromInfo(info)

  console.log("extracted song: ", extractSongs)
  
  if (! extractSongs || extractSongs?.length === 0)
    throw new HttpException(400, "Can't get any song from video, there is probaly no song in this video")

  const spotifyTracks = Promise.all(
    extractSongs.map(async (item) => {
      return await SpotifyService.searchTrack(tokens, { title: item.song_title, artist: item.artist_name });
    })
  )
  return spotifyTracks
}
