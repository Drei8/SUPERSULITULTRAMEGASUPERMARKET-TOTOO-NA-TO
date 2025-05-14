import React, { useState, useEffect } from 'react';
import './App.css';

import Menu            from './components/Menu';
import LandingPage     from './components/LandingPage';
import GetMeasurements from './components/GetMeasurements';
import Profile         from './components/Profiles';
import Closet          from './components/Closet';
import VirtualTryOn    from './components/VirtualTryOn';
import WardrobeHistory from './components/WardrobeHistory';

/* Tab mapping
   null → Landing
   0    → Get Measurements
   1    → Profiles
   2    → Closet
   3    → Virtual Try-On
*/
export default function App() {
  const [activeIndex,      setActiveIndex]      = useState(null);
  const [currImageIndex,   setCurrImageIndex]   = useState(0);
  const [hoveredIndex,     setHoveredIndex]     = useState(null);

  /* data for VTO */
  const [tryOnClothImage,  setTryOnClothImage]  = useState(null);
  const [closetCategory,   setClosetCategory]   = useState(null); // NEW
  const [activeUser,       setActiveUser]       = useState(null);

  /* landing-page carousel reset */
  useEffect(() => {
    if (activeIndex !== null) setCurrImageIndex(0);
  }, [activeIndex]);

  /* example hover logic */
  useEffect(() => {
    if (activeIndex === null && currImageIndex === 8) setHoveredIndex(0);
    else setHoveredIndex(null);
  }, [currImageIndex, activeIndex]);

  /* get image+category from Closet */
  const handleSelectApparelPath = (path, category) => {
    setTryOnClothImage(path);
    setClosetCategory(category);
  };

  return (
    <div className="app-container">
      {/* sidebar */}
      <aside className="sidebar">
        <Menu
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
        />
      </aside>

      {/* main content */}
      <main className="main-content">
        {activeIndex === null && (
          <LandingPage
            currImageIndex={currImageIndex}
            setCurrImageIndex={setCurrImageIndex}
          />
        )}

        {activeIndex === 0 && <GetMeasurements />}

        {activeIndex === 1 && (
          <Profile
            onSetActiveUser={setActiveUser}
            setSelectedMenu={setActiveIndex}
          />
        )}

        {activeIndex === 2 && (
          <Closet
            onSelectApparel={handleSelectApparelPath}
            setSelectedMenu={setActiveIndex}
          />
        )}

        {activeIndex === 3 && (
          <VirtualTryOn
            setActiveIndex={setActiveIndex}
            tryOnClothImage={tryOnClothImage}
            activeUser={activeUser}
            closetCategory={closetCategory}   
          />
        )}
        {activeIndex === 4 && <WardrobeHistory />}  
      </main>
    </div>
  );
}
