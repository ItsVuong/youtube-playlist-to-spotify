import { createContext, useContext, useEffect, useState } from "react";
import axiosClient, { setSignOutHandler } from "../api-calls/axios";
import { fetchProfile, Profile } from "../api-calls/spotify";

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const signIn = () => {
    const popup = window.open(
      "http://localhost:3000/spotify/auth", // your backend’s Spotify OAuth route
      "Spotify Login",
      "width=600,height=700"
    );
  };

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== "http://localhost:3000") return;
      if (event.data.type === "SPOTIFY_AUTH_SUCCESS") {
        localStorage.setItem("spotifySignedIn", "true");
        fetchProfile().then(res => setUser(res.data));
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const signOut = () => {
    axiosClient.post("http://localhost:3000/spotify/logout")
    localStorage.removeItem("spotifySignedIn");
    setUser(null);
  };

  useEffect(() => {
    setSignOutHandler(signOut);

    async function load() {
      try {
        const profile = await fetchProfile()
        setUser(profile.data)
        localStorage.setItem("spotifySignedIn", "true")
      } catch (error) {
        setUser(null)
        localStorage.removeItem("spotifySignedIn")
      } finally {
        setLoading(false)
      }
    }

    if (localStorage.getItem("spotifySignedIn")) {
      load();
    } else {
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
