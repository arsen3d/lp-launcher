import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ initialTime, onCountdownEnd }) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    if (time > 0) {
      const timerId = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timerId);
    } else {
      onCountdownEnd();
    }
  }, [time, onCountdownEnd]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="countdown-timer">
      {formatTime(time)}
    </div>
  );
};

export default CountdownTimer;