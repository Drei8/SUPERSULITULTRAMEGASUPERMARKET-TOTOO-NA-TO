// src/components/WardrobeHistory.jsx
import React, { useState, useEffect } from "react";
import "./WardrobeHistory.css";

const API = "http://localhost:4001/api/getWardrobeItems";

export default function WardrobeHistory() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [preview, setPreview] = useState(null);   // clicked outfit

  /* fetch once */
  useEffect(() => {
    fetch(API)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => { setItems(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const closeModal = () => setPreview(null);

  /* ───── UI ───── */
  if (loading) return <p>Loading wardrobe…</p>;
  if (error)   return <p className="wh-error">Error: {error}</p>;

  return (
    <div className="wh-container">
      <h2 className="wh-title">Wardrobe History</h2>

      {items.length === 0 ? (
        <p>No saved outfits yet.</p>
      ) : (
        <ul className="wh-list">
          {items.map((it, i) => (
            <li
              key={i}
              className="wh-card"
              onClick={() => setPreview(it)}
              title="Click to view"
            >
              <img
                src={`data:image/png;base64,${it.outfit}`}
                alt="outfit"
                className="wh-thumb"
              />
              <div className="wh-name">{it.userName || "Guest"}</div>
            </li>
          ))}
        </ul>
      )}

      {/* ───── landscape preview modal ───── */}
      {preview && (
        <div className="wh-overlay" onClick={closeModal}>
          <div className="wh-modal" onClick={e => e.stopPropagation()}>
            <button className="wh-close" onClick={closeModal}>
              &times;
            </button>

            <h3 className="wh-modal-title">
              {preview.userName || "Guest"}’s&nbsp;Outfit
            </h3>

            {/* rotate for landscape view */}
            <img
              src={`data:image/png;base64,${preview.outfit}`}
              alt="wardrobe preview"
              className="wh-preview-img landscape"
            />
          </div>
        </div>
      )}
    </div>
  );
}
