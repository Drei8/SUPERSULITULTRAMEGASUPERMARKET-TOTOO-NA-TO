// src/components/ResultsMeasurements.jsx
import React, { useState, useEffect } from 'react';
import './ResultsMeasurements.css';

export default function ResultsMeasurements({
  measurements,
  recommendations,
  photo,
  onClose
}) {
  const [isOpen, setIsOpen]     = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => setIsOpen(true), []);
  if (!isOpen) return null;

  const handleSave = async () => {
    const measArr = Object.entries(measurements).map(([label, val]) => ({
      label,
      value: `${val.toFixed(1)} cm`
    }));
    const recArr  = Object.entries(recommendations).map(([region, lbl]) => ({
      region,
      label: lbl
    }));

    try {
      const res = await fetch('http://127.0.0.1:4001/api/saveUserData', {
        method:  'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          userName,
          measurements:    measArr,
          recommendations: recArr,
          photo            // <-- the data-URL
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const { file } = await res.json();
      alert(`✅ Saved file: ${file}`);
    } catch (err) {
      alert(`❌ Save failed: ${err.message}`);
      console.error(err);
    } finally {
      setIsOpen(false);
      onClose();
    }
  };

  return (
    <div className="rm-modal-overlay">
      <div className="rm-modal">
        <button
          className="rm-btn-close"
          onClick={() => { setIsOpen(false); onClose(); }}
        >
          ×
        </button>
        <h2 className="rm-modal__title">Measurement Results</h2>

        {photo && (
          <div className="rm-photo-preview">
            <img src={photo} alt="Front view" className="rm-photo-img" />
          </div>
        )}

        <div className="rm-name-input-wrapper">
          <input
            type="text"
            className="rm-name-input"
            placeholder="Enter your name (optional)"
            value={userName}
            onChange={e => setUserName(e.target.value)}
          />
        </div>

        <div className="rm-modal__content">
          <div className="rm-measurements" style={{ flex:2, position:'relative' }}>
            <ul className="rm-modal__list">
              {Object.entries(measurements).map(([label, val]) => (
                <li key={label} className="rm-modal__item">
                  <span className="rm-label">{label}</span>
                  <span className="rm-value">
                    {val!=null ? `${val.toFixed(1)} cm` : '---'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rm-recommendations-card"
            style={{
              flex:1, marginLeft:'1.5rem',
              background:'rgba(221,200,163,0.2)',
              border:'2px solid var(--rm-border)',
              borderRadius:'0.8rem', padding:'1rem',
              textAlign:'center'
            }}
          >
            <h3 className="rm-recommendations__title" style={{ margin:'0 0 0.5rem' }}>
              Recommended Sizes
            </h3>
            <ul className="rm-recommendations__list" style={{ listStyle:'none', padding:0, margin:0 }}>
              {Object.entries(recommendations).map(([region, lbl]) => (
                <li key={region} className="rm-recommendations__item" style={{ margin:'0.3rem 0' }}>
                  <strong style={{ marginRight:'0.5rem' }}>
                    {region.charAt(0).toUpperCase()+region.slice(1)}:
                  </strong>
                  <span>{lbl}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rm-modal__actions">
          <button className="rm-btn" onClick={handleSave}>
            Save now
          </button>
        </div>
      </div>
    </div>
  );
}
