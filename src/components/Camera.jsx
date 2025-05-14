// src/components/Camera.jsx
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import ResultsMeasurements from './ResultsMeasurements';
import './Camera.css';

import measureIcon   from '../assets/tutorial-img/14.png';
import calibrateIcon from '../assets/tutorial-img/15.png';
import frontGuideImg from '../assets/tutorial-img/16.png';
import sideGuideImg  from '../assets/tutorial-img/17.png';

const PYTHON_API        = 'http://127.0.0.1:7000';
const DEFAULT_COUNTDOWN = 6;
const STEPS             = ['Front View', 'Side View', 'Processing', 'Result'];

export default function Camera() {
  const webcamRef = useRef(null);

  const [mode, setMode]           = useState('measure');
  const [step, setStep]           = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  const [frontImg, setFrontImg]   = useState(null);
  const [sideImg,  setSideImg]    = useState(null);

  const [result, setResult]       = useState(null);
  const [error,  setError]        = useState(null);      // <- friendly message
  const [showModal, setShowModal] = useState(false);

  /* -------------------------------------------------- countdown logic */
  useEffect(() => {
    if (!isCounting) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    capture();
  }, [isCounting, countdown]);

  /* -------------------------------------------------- helpers */
  const stripDataUrl = (d) => d.split(',')[1] ?? d;

  /* capture still */
  const capture = () => {
    const img = webcamRef.current.getScreenshot();
    setIsCounting(false);

    /* STEP 0  → store front, move to side */
    if (step === 0) {
      setFrontImg(img);
      return setStep(1);
    }

    /* STEP 1  → store side, hit API */
    if (step === 1) {
      setSideImg(img);
      setStep(2);          // show “Processing”

      const payload = mode === 'calibrate'
        ? {
            image_calibrate_front: stripDataUrl(frontImg || img),
            image_calibrate_side:  stripDataUrl(img),
          }
        : {
            image_front: stripDataUrl(frontImg || img),
            image_side:  stripDataUrl(img),
          };

      fetch(`${PYTHON_API}/${mode}`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload),
      })
        .then(async (res) => {
          const text = await res.text();
          if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
          try { return JSON.parse(text); }
          catch { throw new Error('Invalid JSON response'); }
        })
        .then((data) => {
          setResult(data);
          setError(null);
          setStep(3);
        })
        .catch((err) => {
          console.error(err);

          /* ---------- friendly error extraction ---------- */
          let msg = err.message;
          try {
            const obj = JSON.parse(err.message);
            if (obj.error) msg = obj.error;
          } catch { /* leave msg as-is */ }
          /* ------------------------------------------------ */

          setError(msg);
          setResult(null);
          setStep(3);      // still advance so user sees the error screen
        });

      return;
    }
  };

  /* -------------------------------------------------- UI actions */
  const startCapture = () => {
    if (isCounting || step > 1) return;
    setError(null);
    setResult(null);
    setCountdown(DEFAULT_COUNTDOWN);
    setIsCounting(true);
  };

  const toggleMode = () => {
    if (isCounting) return;
    setMode(m => (m === 'measure' ? 'calibrate' : 'measure'));
    setStep(0);
    setFrontImg(null);
    setSideImg(null);
    setResult(null);
    setError(null);
  };

  const openResults = () => setShowModal(true);

  /* -------------------------------------------------- component UI */
  return (
    <div className="camera-wrapper">
      <button className={`mode-toggle ${mode}`} onClick={toggleMode}>
        <img
          src={mode === 'measure' ? calibrateIcon : measureIcon}
          alt={mode === 'measure' ? 'Calibrate Mode' : 'Measure Mode'}
          className="mode-icon"
        />
        <span className="mode-label">{mode === 'measure' ? 'M' : 'C'}</span>
      </button>

      {/* progress bar */}
      <div className="progress-container">
        {STEPS.map((lbl, i) => (
          <div key={i} className={`step ${step === i ? 'active' : ''}`}>
            {lbl}
          </div>
        ))}
      </div>
        <div>
          {step === 0 && (
            <img src={frontGuideImg} alt="Front guide" className="guide-imge" />
          )}
          {step === 1 && (
            <img src={sideGuideImg} alt="Side guide" className="guide-imge" />
          )}
        </div>
      {/* webcam / guide */}
      {step < 3 && (
        <div className="webcam-container">
          

          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'user' }}
            className="camera-feedback"
          />

          {isCounting && (
            <div className="countdown-overlay">{countdown}</div>
          )}
          {step === 2 && !isCounting && (
            <div className="processing-overlay">Loading…</div>
          )}
        </div>
      )}

      {/* controls / results */}
      <div className="controls">
        {step < 2 && (
          <button
            className="capture-button"
            onClick={startCapture}
            disabled={isCounting}
          >
            {isCounting
              ? `Capturing ${STEPS[step]}…`
              : `Capture ${STEPS[step]}`
            }
          </button>
        )}

{step === 3 && (
  <div className="result-container">
    {!error && mode === 'measure' ? (
      <>
        {/* Header with title and request number */}
        <div className="result-header">
          <h3>Measurement Result</h3>
          <span className="request-number"># {result.request_number}</span>
        </div>

        {/* Measurements grid */}
        <div className="measurements-grid">
          {Object.entries(result.measurements_cm).map(([label, value]) => (
            <div key={label} className="measurement-item">
              <span className="label">{label}</span>
              <span className="value">
                {value != null ? `${value} cm` : '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Recommended sizing */}
        <h4 className="sizing-title">Recommended Sizing</h4>
        <div className="sizing-grid">
          {Object.entries(result.recommended_sizing).map(([region, size]) => (
            <div key={region} className="sizing-item">
              <span className="region">{region}</span>
              <span className="size">{size || '—'}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="result-buttons">
          <button className="btn save" onClick={openResults}>
            💾 Save
          </button>
          <button className="btn restart" onClick={() => setStep(0)}>
            ↺ Restart
          </button>
        </div>
      </>
        ) : error ? (
          // You can still show your modal-based error here if you prefer,
          // or render nothing (we handle errors with the overlay below).
          null
        ) : (
          // Calibration result fallback (if you ever need it)
          <>
            <h3>Calibration Result</h3>
            <p>Status: {result.status}</p>
            <pre>{JSON.stringify(result.calculated_factors, null, 2)}</pre>
            <button onClick={() => setStep(0)}>Restart</button>
          </>
        )}
      </div>
    )}

      </div>

      {/* results modal */}
      {showModal && result && (
        <ResultsMeasurements
          measurements={result.measurements_cm}
          recommendations={result.recommended_sizing}
          photo={frontImg}
          onClose={() => {
            setShowModal(false);
            setStep(0);
          }}
        />
      )}

      {/* error modal (re-uses same CSS as in GetMeasurements) */}
      {error && (
        <div className="error-modal-overlay" onClick={() => setError(null)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Oops!</h3>
            <p>{error}</p>
            <button
              className="error-btn"
              onClick={() => {
                setError(null);
                setStep(0);
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
