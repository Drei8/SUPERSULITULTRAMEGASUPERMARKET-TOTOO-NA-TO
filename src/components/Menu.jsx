// Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css';

const Sidebar = ({ activeIndex, setActiveIndex, hoveredIndex, setHoveredIndex }) => {
  const menuItems = [
    { name: 'Get Measurement', path: '/', image: './src/assets/menu-icons/Get Measurement.png', enabled: true },
    { name: 'Profiles', path: '/about', image: './src/assets/menu-icons/Profiles.png', enabled: false },
    { name: 'Closet', path: '/services', image: './src/assets/menu-icons/Closet.png', enabled: true },
    { name: 'Virtual Try On', path: '/contact', image: './src/assets/menu-icons/Virtual Try-On.png', enabled: true },
    { name: 'Wardrobe History', path: '/contact', image: './src/assets/menu-icons/Wardrobe History.png', enabled: true }
  ];

  const handleLogoClick = () => {
    // Option 1: full reload
    window.location.reload();

    // Option 2: navigate home without reload (uncomment if you'd rather just go to "/")
    // window.location.href = '/';
  };

  return (
    <>
      {/* clickable logo */}
      <img
        src="./src/assets/menu-icons/pixel-fit-logo.png"
        alt="Pixel Fit Logo"
        className="sidebar-title"
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={activeIndex === index | hoveredIndex === index ? 'current' : 'enabled'}
              onClick={() => {
                setActiveIndex(index)
              }}
            >
              <img src={item.image} alt={item.name} className="sidebar-icon" />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;

