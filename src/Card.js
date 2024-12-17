import React, { useEffect, useState } from 'react';
// import './Card.css';

const Card = ({ data, handleCardClick, handleGpuSelect }) => {

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    let formattedTime = '';
    if (hrs > 0) {
      formattedTime += `${hrs}h `;
    }
    if (mins > 0) {
      formattedTime += `${mins}m `;
    }
    if (secs > 0 || formattedTime === '') {
      formattedTime += `${secs}s`;
    }
    return formattedTime.trim();
  };

    const card = data;
    return (
        <div 
           className="card" 
           onClick={handleCardClick}
           style={{ cursor: 'pointer' }}
         >
          {/* <div className="card"> */}
          <div className="card-content">
            <img src="logo-gen.svg" className="card-img" alt={card.description} />
            <div className="badge-container">
              <span className="count-badge">{card.runs} runs</span>
              <span className="time-badge">{formatTime(card.job.Spec.Timeout)}</span>
            </div>
          </div>
            <div className="verified-badge">
            <img src="community-badge.svg" alt="Verified" />
          </div>
            <div className="tech-tag">{data.module}</div>
            <div className="gpu-options">
            <span onClick={(e) => handleGpuSelect(e, 'RTX 4090')} className="gpu-badge">
              RTX 4090 (2LP)
            </span>
            {/* <span onClick={(e) => handleGpuSelect(e, 'RTX 3080')} className="gpu-badge">
              RTX 3080 (3LP)
            </span> */}
          </div>
            <div className="card-body">
              <h2 className="card-title">{card.name}</h2>
              <p className="card-description">{card.description}</p>
            </div>
          {/* </div> */}
        </div>
    );
};

export default Card;