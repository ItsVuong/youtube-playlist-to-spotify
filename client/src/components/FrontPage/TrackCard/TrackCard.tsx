import React, { useEffect } from "react";
import { SpotifyTrack } from "../../../types/spotify";
import "./TrackCard.css";

function TrackCard({ track, isSelected, onOption,
  onOptionClose, onRemove,
  onTrackSelect, withOption = true,
  onClick,
  isHighlighted = false
}:
  {
    isSelected: boolean, track: SpotifyTrack,
    onOption?: any, onOptionClose?: any,
    onRemove?: any,
    onTrackSelect?: any,
    withOption?: boolean,
    onClick?: any,
    isHighlighted?: boolean
  }) {

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const dropdown = document.querySelector(".options-dropdown");
      if (dropdown && !dropdown.contains(e.target as Node)) {
        onOptionClose();
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className={`track-card ${isHighlighted && "track-highlighted"}`}
      onClick={onClick}
    >
      <div className="track-image">
        <img
          src={track.album.images[0].url || ""}
          alt="Track's image"
        />
        <button className="play-button">▶</button>
      </div>

      {
        withOption &&
        <button
          className="options-button"
          onClick={(e) => {
            e.stopPropagation(); // prevent document listener
            if (isSelected) {
              onOptionClose();
            } else {
              onOption();
            }
          }}
        >
          ≡
        </button>
      }

      <div className="track-info">
        <h3>{track.name || "Song Title"}</h3>
        <p>{track.artists[0].name || "Artist Name"}</p>
      </div>


      {isSelected && (
        <ul className="options-dropdown">
          <li onClick={onTrackSelect}>Other song</li>
          <li style={{ color: "red" }}
            onClick={onRemove}
          >Remove</li>
        </ul>
      )}
    </div>
  );
}

export default TrackCard;
