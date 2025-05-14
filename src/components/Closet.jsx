import React, { useState } from 'react';
import './Closet.css';

const apparelData = {
  Dress: [
    'Magenta Slipdress.jpg', 'Pink Layered Dress.jpg', 'Back Tie Midi Dress.jpg',
    'Bow Accent Dress.jpg', 'Gothic Cape Dress.jpg', 'Midnight Bell Dress.jpg',
    'Ruffle Shoulder Dress.jpg', 'Silk Champagne Gown.jpg', 'White Tulle Dress.jpg',
    'Wine Flare Dress.jpg'
  ],
  Polos: [
    'Black Patterned Polo.jpg', 'Brown Patterned Polo.jpg', 'Colorblock Champion Polo.jpg',
    'Cream Polo.jpg', 'Peach Classic Polo.jpg', 'Pink Youth Polo.jpg',
    'Retro Stripe Polo.jpg', 'Soft Beige Polo.png'
  ],
  Pants: [
    'Beige Chino Pants.jpg', 'Black High Waist Pants.jpg', 'Classic Blue Jeans.jpg',
    'Black Lounge Pants.jpg', 'Olive Linen Pants.jpg', 'Navy Tapered Pants.jpg',
    'Brown Cargo Pants.jpg', 'Red Drawstring Pants.jpg', 'Olive Cargo Pants.jpg',
    'Tan Denim Pants.jpg'
  ],
  Sweater: [
    'Blue Pinstripe Knit.jpg', 'Brown Green Stripe Knit.jpg', 'Charcoal Ribbed Sweater.jpg',
    'Cream Striped Knit.jpg', 'Ivory Cable Sweater.jpg', 'Navy Dark Sweater.jpg',
    'Navy Knit Sweater.jpg', 'Nordic Holiday Sweater.jpg', 'Retro Chevron Sweater.jpg',
    'Solid Green Pullover.jpg'
  ],
  TShirt: [
    'Black Dragon Wave Tee.png', 'Bold Red Tee.jpg', 'Cobalt Blue Tee.jpg',
    'Gray Shadow Dragon Tee.jpg', 'Peak Green Graphic Tee.jpg'
  ]
};

export default function Closet({ onSelectApparel, setSelectedMenu }) {
  const [selectedCategory,      setSelectedCategory]   = useState('Dress');
  const [selectedImageFilename, setSelectedImageFilename] = useState(null);
  const [selectedImagePath,     setSelectedImagePath]  = useState(null);
  const [showPreviewModal,      setShowPreviewModal]   = useState(false);

  /* helpers */
  const makePath = (file) =>
    `/src/assets/closet/${selectedCategory.toLowerCase().replace(/\s+/g, '')}/${file}`;

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedImageFilename(null);
    setSelectedImagePath(null);
    setShowPreviewModal(false);
  };

  const handleItemClick = (file) => {
    const path = makePath(file);
    setSelectedImageFilename(file);
    setSelectedImagePath(path);
    setShowPreviewModal(true);
  };

  const handleTryOn = () => {
    /* pass BOTH path and category up to App */
    if (onSelectApparel && selectedImagePath) {
      onSelectApparel(selectedImagePath, selectedCategory);
    }
    setShowPreviewModal(false);
    setSelectedMenu?.(3);          // switch tab to Virtual Try-On
  };

  /* close helpers */
  const handleCloseModal   = () => setShowPreviewModal(false);
  const handleOverlayClick = (e) =>
    e.target === e.currentTarget && handleCloseModal();

  return (
    <div className="closet-container">
      <h2 className="closet-title">Closet</h2>

      {/* category tabs */}
      <div className="category-tabs">
        {Object.keys(apparelData).map((cat) => (
          <button
            key={cat}
            className={`category-button ${cat === selectedCategory ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* item grid */}
      <div className="closet-grid">
        {apparelData[selectedCategory].map((file, i) => {
          const thumb = makePath(file);
          const label = file.replace(/\.(png|jpe?g)$/i, '');
          return (
            <div
              key={i}
              className={`closet-item ${file === selectedImageFilename ? 'selected' : ''}`}
              onClick={() => handleItemClick(file)}
            >
              <div className="closet-image-wrapper">
                <img src={thumb} alt={label} className="closet-thumbnail" />
                <div className="closet-overlay">Select</div>
              </div>
              <div className="closet-label">{label}</div>
            </div>
          );
        })}
      </div>

      {/* preview modal */}
      {showPreviewModal && selectedImagePath && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>

            <img src={selectedImagePath}
                 alt={selectedImageFilename.replace(/\.(png|jpe?g)$/i, '')}
                 className="modal-image" />

            <h3 className="modal-title">
              {selectedImageFilename.replace(/\.(png|jpe?g)$/i, '')}
            </h3>

            <div className="modal-sizes">
              {['XS','S','M','L','XL','XXL'].map((s) =>
                <span key={s} className="size-badge">{s}</span>
              )}
            </div>

            <button className="try-on-button" onClick={handleTryOn}>
              Try-On
            </button>
          </div>
        </div>
      )}
    </div>
  );
}