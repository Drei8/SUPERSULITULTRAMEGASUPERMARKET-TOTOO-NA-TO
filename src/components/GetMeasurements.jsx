import React, { useState } from "react";
import "./GetMeasurements.css";

import Camera              from "./Camera";
import ResultsMeasurements from "./ResultsMeasurements";

import measureIcon from "../assets/tutorial-img/13.png";
import uploadIcon  from "../assets/tutorial-img/12.png";

export default function GetMeasurements() {
  const [firstVisit,    setFirstVisit]    = useState(true);

  /* upload modal */
  const [showUpload,    setShowUpload]    = useState(false);
  const [frontFile,     setFrontFile]     = useState(null);
  const [sideFile,      setSideFile]      = useState(null);

  /* shared */
  const [processing,    setProcessing]    = useState(false);
  const [measureData,   setMeasureData]   = useState(null);   // full JSON
  const [photoPreview,  setPhotoPreview]  = useState(null);   // rotated front
  const [errorMsg,      setErrorMsg]      = useState(null);   // user-facing

  const API_URL = "http://127.0.0.1:7000/measure";

  /* ---------- helpers ---------- */
  const rotateAndBase64 = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width  = img.height;
          c.height = img.width;
          const ctx = c.getContext("2d");
          ctx.translate(0, c.height);
          ctx.rotate(-Math.PI / 2);
          ctx.drawImage(img, 0, 0);
          resolve(c.toDataURL("image/jpeg", 0.9));
        };
        img.onerror = reject;
        img.src = fr.result;
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  const strip = (d) => d.split(",")[1];

  const startMeasurementUpload = async () => {
    if (!frontFile || !sideFile) return;

    setShowUpload(false);
    setFirstVisit(false);
    setProcessing(true);
    setErrorMsg(null);

    try {
      const [frontURL, sideURL] = await Promise.all([
        rotateAndBase64(frontFile),
        rotateAndBase64(sideFile),
      ]);

      const res = await fetch(API_URL, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          image_front: strip(frontURL),
          image_side : strip(sideURL),
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.error) {
        /* backend sent error (or HTTP 4xx/5xx) */
        setErrorMsg(
          json.error ?? `Unexpected server error (code ${res.status}).`
        );
        return;
      }

      setMeasureData(json);
      setPhotoPreview(frontURL);
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error – please check your connection.");
    } finally {
      setProcessing(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="measurements-tab">
      {/* ───── intro ───── */}
      {firstVisit && (
        <div className="intro-screen">
          <h2>Ready to get measured?</h2>
          <div className="intro-actions">
            <button className="image-btn" onClick={() => setFirstVisit(false)}>
              <img src={measureIcon} alt="Measure now" className="image-icon" />
              <span className="image-label">Measure now</span>
            </button>
            <button className="image-btn" onClick={() => setShowUpload(true)}>
              <img src={uploadIcon} alt="Upload" className="image-icon" />
              <span className="image-label">Upload Image</span>
            </button>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="upload-modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="upload-modal-content wide" onClick={(e) => e.stopPropagation()}>
            <button className="upload-close" onClick={() => setShowUpload(false)}>×</button>
            <h3 className="upload-heading">📸 Upload Front & Side View</h3>

            <div className="upload-body">
              {/* Front View Column */}
              <div className="upload-section">
                <label className="upload-label">Front view</label>
                <label className="upload-clickable-area">
                  {frontFile ? (
                    <img
                      src={URL.createObjectURL(frontFile)}
                      alt="Front Preview"
                      className="preview-img large"
                    />
                  ) : (
                    <div className="upload-placeholder">Click to upload front view</div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setFrontFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Side View Column */}
              <div className="upload-section">
                <label className="upload-label">Side view</label>
                <label className="upload-clickable-area">
                  {sideFile ? (
                    <img
                      src={URL.createObjectURL(sideFile)}
                      alt="Side Preview"
                      className="preview-img large"
                    />
                  ) : (
                    <div className="upload-placeholder">Click to upload side view</div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setSideFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <button
              className="upload-start-btn pulse"
              disabled={!frontFile || !sideFile}
              onClick={startMeasurementUpload}
            >
              Start Measurement
            </button>
          </div>
        </div>
      )}




      {/* ───── processing spinner ───── */}
      {processing && (
        <div className="processing-screen">
          <h3>Processing your measurements…</h3>
          <div className="loader" />
        </div>
      )}

      {/* ───── error modal ───── */}
      {errorMsg && (
        <div className="error-modal-overlay" onClick={() => setErrorMsg(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Oops!</h3>
            <p>{errorMsg}</p>
            <button className="error-btn" onClick={() => setErrorMsg(null)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ───── results modal ───── */}
      {measureData && (
        <ResultsMeasurements
          measurements    ={measureData.measurements_cm   ?? {}}
          recommendations ={measureData.recommended_sizing ?? {}}
          photo           ={photoPreview}
          onClose={() => {
            setMeasureData(null);
            setPhotoPreview(null);
            setFirstVisit(true);
          }}
        />
      )}

      {/* ───── live camera ───── */}
      {!firstVisit && !processing && !measureData && !errorMsg && (
        <div className="main-get-measurements">
          <Camera className="cameraA" />
        </div>
      )}
    </div>
  );
}
