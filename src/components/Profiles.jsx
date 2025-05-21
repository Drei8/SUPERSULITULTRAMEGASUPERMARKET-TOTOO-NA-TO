// src/components/Profiles.jsx
import React, { useState, useEffect } from "react";
import "./Profiles.css";

const BASE_URL1 = "http://127.0.0.1:4001";

/* ───────────────────────────────────────────────────────────
   Helper component: draws the image onto an off-screen canvas,
   rotates it +90°, then converts to a dataURL once on mount.
   Used only for card thumbnails; the modal keeps the photo
   upright.
   ─────────────────────────────────────────────────────────── */
function RotatedThumb({ src, alt, className }) {
  const [rotated, setRotated] = useState(null);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = "anonymous";      // handle data-URLs & same-origin
    img.onload = () => {
      const c   = document.createElement("canvas");
      c.width   = img.height;           // swap w/h for 90° rotation
      c.height  = img.width;
      const ctx = c.getContext("2d");
      ctx.translate(img.height, 0);     // move origin to top-right
      ctx.rotate(Math.PI / 2);          // +90° (clockwise)
      ctx.drawImage(img, 0, 0);
      setRotated(c.toDataURL());
    };
    img.src = src;
  }, [src]);

  return <img src={rotated || src} alt={alt} className={className} />;
}

/* ───────────────────────────────────────────────────────── */

export default function Profiles({
  onSetActiveUser,
  setSelectedMenu,
  setActiveIndex        // either name works
}) {
  const setMenu = setSelectedMenu || setActiveIndex;

  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  /* fetch once */
  useEffect(() => {
    fetch(`${BASE_URL1}/api/getUsers`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { setUsers(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <p>Loading users…</p>;
  if (error)   return <p className="error">Error: {error}</p>;

  const closeModal      = () => setSelectedUser(null);
  const handleSetActive = () => {
    onSetActiveUser?.(selectedUser);
    closeModal();
    setMenu?.(3);                      // jump to Virtual Try-On tab
  };

  return (
    <div className="profiles-container">
      <h2 className="profiles-title">Saved Profiles</h2>

      {users.length === 0 ? (
        <p>No saved profiles yet.</p>
      ) : (
        <ul className="user-list">
          {users.map((u, i) => (
            <li
              key={i}
              className="user-card"
              onClick={() => setSelectedUser(u)}
            >
              {/* programmatic +90° rotation */}
              {u.photo && (
                <RotatedThumb
                  src={u.photo}
                  alt={u.userName || "Guest"}
                  className="user-thumb"
                />
              )}
              <div className="user-name">{u.userName || "Guest"}</div>
            </li>
          ))}
        </ul>
      )}

      {/* ───── Profile modal ───── */}
      {selectedUser && (
        <div className="profile-modal-overlay" onClick={closeModal}>
          <div
            className="profile-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="profile-modal-close" onClick={closeModal}>
              &times;
            </button>

            <h3 className="modal-user-name">
              {selectedUser.userName || "Guest"}
            </h3>

            {selectedUser.photo && (
              <RotatedThumb
                src={selectedUser.photo}
                alt={selectedUser.userName || "Profile"}
                className="profile-modal-image"
              />
            )}

            <div className="profile-section">
              <strong>Measurements:</strong>
              <ul>
                {selectedUser.measurements.map((m) => (
                  <li key={m.label}>
                    {m.label}: {m.value}
                  </li>
                ))}
              </ul>
            </div>

            <div className="profile-section">
              <strong>Recommendations:</strong>
              <ul>
                {selectedUser.recommendations.map((r) => (
                  <li key={r.region}>
                    {r.region}: {r.label}
                  </li>
                ))}
              </ul>
            </div>

            <button className="set-active-btn" onClick={handleSetActive}>
              Set as Current User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
