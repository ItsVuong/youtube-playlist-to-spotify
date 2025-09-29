import { useState } from "react";
import { SpotifyTrack } from "../../../types/spotify";
import TrackCard from "../TrackCard/TrackCard";
import "./TrackSelectModal.css"

function TrackSelectModal({ tracks, onClose, setTracks }:
  { tracks: SpotifyTrack[], onClose: any, setTracks: any }) {
  // Index of the selected track for replacement
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  function handleReplace() {
    if (selectedTrack == null) return;
    setTracks(selectedTrack);
    setSelectedTrack(null)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="track-select-modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        <h2>
          OTHER SONGS WITH THIS NAME
        </h2>
        {tracks.length > 0 ?
          <div className="tracks-wrapper">
            {tracks.map((track, index) =>
              <TrackCard track={track}
                isSelected={false}
                isHighlighted={selectedTrack === index}
                withOption={false}
                onClick={() => setSelectedTrack(index)}
              />)}
          </div> :
          <>
            No track found :(
          </>}
        <button
          className="green-button replace-button"
          disabled={!selectedTrack ? true : false}
          onClick={handleReplace}
        >
          Replace
        </button>
      </div>
    </div>
  )
}

export default TrackSelectModal;
