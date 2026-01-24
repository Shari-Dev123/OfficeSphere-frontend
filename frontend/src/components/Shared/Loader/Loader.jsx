import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', fullScreen = false, text = '' }) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-container">
          <div className={`loader loader-${size}`}></div>
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loader-wrapper">
      <div className={`loader loader-${size}`}></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;