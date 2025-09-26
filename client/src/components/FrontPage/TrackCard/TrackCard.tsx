import React from "react";
import { SpotifyTrack } from "../../../types/spotify";
import "./TrackCard.css";

function TrackCard({track}: {track: SpotifyTrack}) {
  return (
    <div className="track-card">
      <div className="track-image">
        <img
          src={track.album.images[0].url || ""}
          alt="Track's image"
        />
        <button className="play-button">▶</button>
      </div>
      <div className="track-info">
        <h3>{track.name || "Song Title"}</h3>
        <p>{track.artists[0].name || "Artist Name"}</p>
      </div>
    </div>
  );
}

export default TrackCard;
