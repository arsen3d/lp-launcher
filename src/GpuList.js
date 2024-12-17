import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const GpuList = (update) => {
  const [gpus, setGpus] = useState([]);

  useEffect(() => {
    const fetchGpus = async () => {
      let solver_api = localStorage.getItem("SERVICES_SOLVER_API");
      try {
        const response = await fetch(solver_api + "/api/v1/resource_offers");
        const data = await response.json();
        const gpuData = data
          .filter(offer => offer.state === 0)
          .map(offer => offer.job_offer.spec.gpus[0].name)
          .sort((a, b) => a.localeCompare(b));
        setGpus(gpuData);
      } catch (error) {
        // console.error('Error fetching GPU data:', error);
        return;
      }
    };

    fetchGpus();
    const intervalId = setInterval(fetchGpus, 5000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <span className="gpu-list">
      &nbsp;
      {gpus.length === 0 ? 
        (<span>No GPUs available</span>) 
        :      
        (<span>
          {gpus.map((gpu, index) => (<span key={index}>{gpu}</span>))}
        </span>)
      }
    </span>
  )
};

export default GpuList;


