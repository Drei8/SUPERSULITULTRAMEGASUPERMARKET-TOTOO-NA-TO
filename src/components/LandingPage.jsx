

// App.js
import React, { useState } from 'react';
import './LandingPage.css'


const LandingPage = ({currImageIndex, setCurrImageIndex}) => {
  const tutorialImages = [
    './src/assets/tutorial-img/1.png',
    './src/assets/tutorial-img/2.png',
    './src/assets/tutorial-img/3.png',
    './src/assets/tutorial-img/4.png',
    './src/assets/tutorial-img/5.png',
    './src/assets/tutorial-img/6.png',
    './src/assets/tutorial-img/7.png',
    './src/assets/tutorial-img/8.png',
    './src/assets/tutorial-img/9.png',
    './src/assets/tutorial-img/10.png'
  ]

  const navigationClick = (direction) => {
    // Option 1: full reload
    if (direction == 'forward'){
        
        setCurrImageIndex(currImageIndex+1);
    }
    if (direction == 'backward'){
        setCurrImageIndex(currImageIndex-1)
    }
    console.log(currImageIndex)
    return
  };

  return (
    <div className='tutorial-block'>
        <header className="main-header">
            <h1>PixelFit Guide</h1>
        </header>
        <img src={tutorialImages[currImageIndex]} alt='tutorial.png' className='tutorial-images'></img> 
        <div className='navigation-buttons'>
            <img 
                src='./src/assets/tutorial-img/prev-button.png' 
                alt='prev-button' 
                className={(currImageIndex == 0) ? 'disabled-nav' : 'nav-images'}
                onClick={() => {
                    if (currImageIndex == 0) return;
                    navigationClick('backward')
                  }}
            />
            <img 
                src='./src/assets/tutorial-img/next-button.png' 
                alt='next-button' 
                className={(currImageIndex == 9) ? 'disabled-nav' : 'nav-images'}
                onClick={() => {
                    if (currImageIndex==9) return;
                    navigationClick('forward')
                  }}
                
            />
        </div> 
    </div>
    
  );
}

export default LandingPage;


