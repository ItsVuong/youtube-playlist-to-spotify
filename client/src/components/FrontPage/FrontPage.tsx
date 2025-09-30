import React, { useEffect, useState } from 'react';
import { playlistLookup } from '../../api-calls/spotify';
import { useAuth } from '../../contexts/AuthContext';
import "./FrontPage.css"
import ProfilePic from './ProfilePic/ProfilePic';
import TrackList from './TrackCard/TrackList';
import { ToastContainer, toast } from 'react-toastify';
import SignInModal from './SignInModal/SignInModal';

function FrontPage() {
  const authContext = useAuth()
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [signInModal, setSignInModal] = useState(false);
  const [tracks, setTracks] = useState<Awaited<ReturnType<typeof playlistLookup>>>([]);


  const { user: profile, loading, signIn, signOut } = authContext

  async function searchHandler(e: React.FormEvent) {
    e.preventDefault();

    if (!localStorage.getItem("spotifySignedIn")) {
      setSignInModal(true)
      return
    }

    if (search.trim() === "" || !search || isSearching) return

    const ytUrlRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&?].*)?$/;

    if (!ytUrlRegex.test(search)) {
      return toast.error("Invalid youtube url");
    }

    let loadingId: any;
    try {
      setIsSearching(true)
      loadingId = toast.loading("Searching, please wait");

      const fetchedTracks = await playlistLookup(search)
      if (!fetchedTracks) {
        toast.error("No track found :(")
        return
      }
      setTracks(fetchedTracks)
      console.log(fetchedTracks)
    } catch (error: any) {
      console.log(error)
      toast.error(error.response?.data?.error || "Search failed")
    } finally {
      toast.dismiss(loadingId)
      setIsSearching(false)
    }
  }

  // Close sign-in modal if sign-in is successful
  useEffect(() => {
    if (profile) {
      setSignInModal(false)
    }
  }, [profile])

  if (loading) return <div>Loading...</div>;

  return (
    <div className='Front'>
      <header >
        <div className='logo-wrapper'>
          <a  className='logo'
            target='_blank'
            href='https://github.com/ItsVuong/youtube-playlist-to-spotify'>
            MagicalTaco
          </a>
        </div>
        {profile ? (
          profile.images?.length > 0 ? (
            <ProfilePic profilePic={profile.images[0].url} onLogout={signOut} />
          ) : (
            <span>{profile.display_name}</span>
          )
        ) : (
          <button className="green-button sign-in-button" onClick={signIn}>
            SIGN IN
          </button>
        )}

      </header>
      <div className='main-content'>
        <div className='main-title'>
          <h2>YOUTUBE PLAYLIST TO SPOTIFY</h2>
          <span>Quickly create a playlist from playlist videos (not youtube playlist)</span><br />
          <span>
            <strong>
              The playlist has to be provided somewhere in the video (chapters, description, comment) for this to work
            </strong>
          </span>
        </div>
        <form className='main-search-form' onSubmit={searchHandler}>
          <input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Paste your youtube URL here..."
          />
          <button type='submit' className='green-button'
            disabled={isSearching}
          >
            submit
          </button>
        </form>
        {tracks.length > 0 &&
          <div style={{ width: "100%" }}>
            <TrackList
              tracks={tracks}
              setTracks={setTracks}
            />
          </div>
        }
      </div>
      <ToastContainer position='bottom-right' />
      <SignInModal isOpen={signInModal} onClose={() => setSignInModal(false)} />
    </div>
  )
}

export default FrontPage
