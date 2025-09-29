import { useState } from "react"
import { SpotifyTrack } from "../../../types/spotify"
import CreatePlaylistModal from "../CreatePlaylistModal/CreatePlaylist"
import TrackSelectModal from "../TrackSelectModal/TrackSelectModal"
import TrackCard from "./TrackCard"
import "./TrackList.css"

function TrackList({ tracks, setTracks }: {
  tracks: SpotifyTrack[][],
  setTracks: any
}) {
  const [createModal, setCreateModal] = useState(false);
  // The index of the card to open options dropdown
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null)

  function removeTrack(index: number) {
    setTracks(tracks.filter((_, i) => i !== index));
  }

  function replaceTrack(trackIndex: number) {
    if (!selectedTrack) return
    const trackList = [...tracks[selectedTrack]];
    [trackList[0], trackList[trackIndex]] = [trackList[trackIndex], trackList[0]];
    setTracks((prev: SpotifyTrack[][]) => prev.map((item: SpotifyTrack[], i) => i === selectedTrack ? trackList : item))

  }

  return (
    <div className="track-list-wrapper">
      <div className="track-list-header">
        <button className="green-button"
          onClick={() => setCreateModal(true)}
        >
          Create playlist
        </button>
      </div>
      <div className="track-list">
        {tracks.map((track, index) => {
          if (track?.length > 0) {
            return <>
              <TrackCard
                key={index}
                isSelected={selectedOption === index}
                onOption={() => setSelectedOption(index)}
                onOptionClose={() => setSelectedOption(null)}
                onRemove={() => removeTrack(index)}
                // Select track to swap songs with same name
                onTrackSelect={() => {
                  setSelectedTrack(index)
                  setSelectedOption(null)
                }}
                track={track[0]} />
            </>
          }
        })}
      </div>
      <CreatePlaylistModal tracks={tracks} isOpen={createModal}
        onClose={() => setCreateModal(false)}
        setModal={setCreateModal}
      />
      {
        selectedTrack &&
        <TrackSelectModal
          onClose={() => setSelectedTrack(null)}
          tracks={tracks[selectedTrack]}
          setTracks={replaceTrack}
        />
      }
    </div>
  )
}

export default TrackList
