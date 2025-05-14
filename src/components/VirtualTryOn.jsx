import React, { useState } from "react";
import "./VirtualTryOn.css";

const TRYON_API     = "https://182e-104-198-254-6.ngrok-free.app/tryon";
const WARDROBE_API  = "http://127.0.0.1:5001/api/saveWardrobeItem";

export default function VirtualTryOn({
  setActiveIndex, setSelectedMenu,
  tryOnClothImage, activeUser, closetCategory
}) {
  const [processing, setProcessing] = useState(false);
  const [resultB64,  setResultB64]  = useState(null);
  const [errorMsg,   setErrorMsg]   = useState(null);

  /* tab helper */
  const setMenu = setActiveIndex || setSelectedMenu;
  const goToCloset   = () => setMenu?.(2);
  const goToProfiles = () => setMenu?.(1);

  /* util */
  const urlToDataURL = url => fetch(url).then(r=>r.blob()).then(b=>new Promise(res=>{
    const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(b);
  }));
  const raw = d => d.split(',')[1];
  const clothType = () => {
    const c=(closetCategory||'').toLowerCase();
    if(c==='dress') return 'overall';
    if(c==='pants') return 'lower';
    return 'upper';
  };

  /* generate */
  const handleTryOn = async () => {
    if(!activeUser?.photo || !tryOnClothImage)
      return alert("Please select both a profile and an apparel first.");

    setProcessing(true); setErrorMsg(null); setResultB64(null);
    try{
      const avatar = raw(await urlToDataURL(activeUser.photo));
      const cloth  = raw(await urlToDataURL(tryOnClothImage));

      const { result_image } = await fetch(TRYON_API,{
        method:"POST",headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ person_image:avatar, cloth_image:cloth, cloth_type:clothType() })
      }).then(async r=>{const j=await r.json(); if(!r.ok||j.status!=='success') throw new Error(j.message); return j;});

      setResultB64(result_image);
    }catch(e){ setErrorMsg(e.message); }
    finally{ setProcessing(false); }
  };

  /* save to wardrobe */
  const saveOutfit = async () => {
    try{
      await fetch(WARDROBE_API,{
        method:"POST",headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          userName : activeUser?.userName || "Guest",
          userPhoto: activeUser?.photo    || null,
          outfitB64: resultB64
        })
      }).then(async r=>{
        const j=await r.json();
        if(!r.ok) throw new Error(j.error||r.statusText);
      });
      alert("Saved to Wardrobe History!");
      setResultB64(null);
      setMenu?.(4);                  // jump to tab 4
    }catch(e){ alert(`Save failed: ${e.message}`); }
  };

  /* JSX */
  return (
    <div className="vto">
      {/* preview panels (unchanged) */}
      <div className="vto-panels">
        {/* apparel */}
        <div className="vto-panel">
          <div className="vto-title-box-wrapper"><h3 className="vto-title">Chosen Apparel</h3>
            <div className="vto-box">
              {!tryOnClothImage ? (
                <>
                  <p className="vto-text">Please choose an apparel inside the closet</p>
                  <button className="vto-action-btn" onClick={goToCloset}>Go to Closet</button>
                </>
              ):<img src={tryOnClothImage} alt="cloth" className="vto-thumb"/>}
            </div>
          </div>
        </div>
        {/* profile */}
        <div className="vto-panel">
          <div className="vto-title-box-wrapper"><h3 className="vto-title">Current Active Profile</h3>
            <div className="vto-box">
              {!activeUser ? (
                <>
                  <p className="vto-text">Please choose a saved user profile inside Profiles</p>
                  <button className="vto-action-btn" onClick={goToProfiles}>Go to Profiles</button>
                </>
              ):<>
                  {activeUser.photo && <img src={activeUser.photo} alt="avatar" className="vto-thumb avatar"/>}
                  <p className="vto-text">Active: <strong>{activeUser.userName||"Guest"}</strong></p>
              </>}
            </div>
          </div>
        </div>
      </div>

      {/* main button */}
      <div className="vto-button-row"><button className="vto-try-btn" onClick={handleTryOn}>Try On</button></div>

      {/* overlays */}
      {processing && <div className="vto-modal-overlay"><div className="vto-modal"><h3 className="vto-modal-title">Generating…</h3></div></div>}
      {errorMsg   && <div className="vto-modal-overlay" onClick={()=>setErrorMsg(null)}>
        <div className="vto-modal" onClick={e=>e.stopPropagation()}><h3 className="vto-modal-title">Oops!</h3><p>{errorMsg}</p>
          <button className="vto-action-btn" onClick={()=>setErrorMsg(null)}>Close</button></div></div>}
      {resultB64 && <div className="vto-modal-overlay"><div className="vto-modal">
        <h3 className="vto-modal-title">Virtual Try-On</h3>
        <div className="vto-box vto-result-box">
          <img src={`data:image/png;base64,${resultB64}`} alt="outfit" style={{maxWidth:"100%",borderRadius:"0.6rem"}}/>
        </div>
        <div style={{display:"flex",gap:"1rem"}}>
          <button className="vto-action-btn" onClick={saveOutfit}>Save</button>
          <button className="vto-action-btn" onClick={()=>setResultB64(null)}>Close</button>
        </div>
      </div></div>}
    </div>
  );
}
