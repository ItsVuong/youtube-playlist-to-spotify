import React, { useState } from "react"
import "./CreatePlaylist.css"
import { toast } from "react-toastify";
import { createPlaylist } from "../../../api-calls/spotify";

function CreatePlaylistModal({ tracks, isOpen, onClose, setModal }: { tracks?: any, isOpen: boolean, onClose: any, setModal: any }) {
  const [playlistName, setPlaylistName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [errorInputs, setErrorInputs] = useState({ playlistName: false, description: false })
  // loading status for creating playlist
  const [loadingCreate, setLoadingCreate] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let hasError = false

    if (playlistName.length > 100 || playlistName.trim() == "") {
      setErrorInputs(prev => ({ ...prev, playlistName: true }))
      hasError = true
    } else {
      setErrorInputs(prev => ({ ...prev, playlistName: false }))
    }

    if (description.length > 255) {
      setErrorInputs(prev => ({ ...prev, description: true }))
      hasError = true
    } else {
      setErrorInputs(prev => ({ ...prev, description: false }))
    }

    if (hasError) {
      toast.error(`Invalid inputs, please check again!`)
      return
    }

    let loadingId: any // hold toast id for loading noti
    try {
      if (!tracks || tracks?.length === 0) {
        return toast.error("No track found!")
      }
      console.log(tracks)

      // Get the uris to add to the playlist
      const trackUris = tracks
        ?.map((track: any) => track.length > 0 ? track[0].uri : null)
        .filter((uri: string | null) => uri !== null);

      setLoadingCreate(true)
      loadingId = toast.loading("Creating playlist...")

      const response = await createPlaylist({ tracks: trackUris as string[], playlistName, description, isPublic })
      console.log(response.data)
      toast.update(loadingId, {
        render: "Playlist created",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });

    } catch (error: any) {
      console.log(error);
      toast.update(loadingId, {
        render: error?.response?.data?.error || "Fail to create playlist",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });

    } finally {
      setLoadingCreate(false)
      setModal(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button className="modal-close"
          onClick={onClose}
        >
          ✖
        </button>
        <h2>
          CREATE PLAYLIST
        </h2>
        <form className="create-form"
          onSubmit={handleSubmit}
        >
          <input type="text"
            className={errorInputs.playlistName ? "input-error" : ""}
            maxLength={100}
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            disabled={loadingCreate}
            placeholder="Playlist name" />
          <input type="text"
            className={errorInputs.description ? "input-error" : ""}
            maxLength={255}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loadingCreate}
            placeholder="Description" />
          <div className="checkbox-group">
            <label>Public:</label>
            <input type="checkbox"
              checked={isPublic}
              disabled={loadingCreate}
              onChange={() => setIsPublic(!isPublic)}
            />
          </div>
          <button
            disabled={loadingCreate}
            type="submit">Create</button>
        </form>

      </div>
    </div>
  );
}

export default CreatePlaylistModal
