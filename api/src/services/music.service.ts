import { GeminiService } from "./gemini.service.js";
import { SpotifyService, type SpotifyTokens } from "./spotify.service.js";
import { YoutubeService } from "./youtube.service.js";

export async function searchTracks(tokens: SpotifyTokens, videoUrl: string) {
  const info = await YoutubeService.getVideoInformation(videoUrl);
  const extractSongs = await GeminiService.getSongsFromInfo(info)
  if (!extractSongs)
    throw new Error("Can't get song from video")

  const spotifyTracks = Promise.all(
    extractSongs.map(async (item) => {
      return await SpotifyService.searchTrack(tokens, { title: item.song_title, artist: item.artist_name });
    })
  )
  return spotifyTracks
}
