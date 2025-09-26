import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import "./SignInModal.css"

export default function SignInModal({ isOpen, onClose }:
  { isOpen: boolean, onClose: any }) {
  const {signIn} = useAuth()

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        <h2>
          SIGN IN WITH SPOTIFY TO SEARCH
        </h2>
        <button className="green-button" onClick={signIn}>
          SIGN IN
        </button>
      </div>
    </div>
  );
}

