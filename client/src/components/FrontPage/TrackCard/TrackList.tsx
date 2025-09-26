import { SpotifyTrack } from "../../../types/spotify"
import TrackCard from "./TrackCard"
import "./TrackList.css"

function TrackList({ tracks }: { tracks: SpotifyTrack[][] }) {
  return (
    <div className="track-list">
      {tracks.map(track => <TrackCard track={track[0]} />)}
    </div>
  )
}

export default TrackList
