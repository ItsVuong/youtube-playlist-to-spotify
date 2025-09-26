import axios from "axios"
import { toast } from 'react-toastify';

const API_URL = "http://localhost:3000"

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

let onSignOut: any;
export function setSignOutHandler(handler: any) {
  onSignOut = handler;
}

axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      if (localStorage.getItem("spotifySignedIn")) {
        toast.error("session expired")
      } else {
        toast.error("Please login with Spotify first!")
      }
      if (onSignOut) onSignOut();
    } else {
      throw error
    }
  }
)
export default axiosClient;
