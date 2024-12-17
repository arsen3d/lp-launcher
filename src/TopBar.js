import React, { useEffect, useState } from 'react';
import toml from 'toml'; // You need to install toml parser library

const TopBar = ({ walletAddress, coinBalance, tokenBalance, session, handleLogoClick, handleAccountClick, switchNetwork,setUpdate,setData, fetchAndStoreModules, downloadAndSaveToml,fetchTokenBalance }) => {
  const [network, setNetwork] = useState(localStorage.getItem("NETWORK")?localStorage.getItem("NETWORK"):"https://raw.githubusercontent.com/arsenum/demonet/refs/heads/main/config.toml");


  useEffect( () => { 
   
  }
  , [0]);

  const handleNetworkChange = async (event) => {
    localStorage.setItem('NETWORK', event.target.value);
    setNetwork(event.target.value);
    await downloadAndSaveToml(event.target.value);
    let modules =await fetchAndStoreModules();
   
    setData(modules);
    fetchTokenBalance(); 
    console.log("modules downloaded",modules);
  };


  return (
    <nav className="top-bar">
      <div className="logo" onClick={handleLogoClick}>
        ETH <span className="balance">{Number(coinBalance).toFixed(2)}</span>
        &nbsp;&nbsp;| 
        LP <span className="balance">{Number(tokenBalance).toFixed(2)}</span>
        &nbsp;|&nbsp; {walletAddress}
        {/* {session} */}
       
      </div>
     
      <div className="network-dropdown">
        <label htmlFor="network-select"></label>
        <select id="network-select" value={network} onChange={handleNetworkChange}>
          <option value="https://raw.githubusercontent.com/arsenum/demonet/refs/heads/main/config.toml">Demonet</option>
          <option value="https://raw.githubusercontent.com/arsen3d/orbit/refs/heads/main/config.toml">Orbit</option>
          <option value="https://raw.githubusercontent.com/RareCompute/dashboard/refs/heads/main/config.toml">Rare Compute</option>
        </select>
      </div>
      <button className="account-btn" onClick={handleAccountClick}>
        {/* {sessionStorage.getItem('sessionId') ? sessionStorage.getItem('sessionId') : "no session"} */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
                fill="#e0e0e0"/>
        </svg>
      </button>
    </nav>
  );
};

export default TopBar;