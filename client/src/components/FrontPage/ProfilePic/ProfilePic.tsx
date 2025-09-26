import { useState, useRef, useEffect } from "react";
import "./ProfilePic.css";

function ProfilePic({ profilePic, onLogout }: { profilePic: string, onLogout: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="profile-dropdown">
      <img
        src={profilePic}
        alt="Profile"
        className="profile-pic"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="dropdown-menu">
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default ProfilePic;
