import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const CONTRACT_ADDRESS = "0xDBA89e33EFE2eD227c04CB31356EFdE618d4953F";
//  const abi = '[{"inputs":[{"internalType":"string","name":"module","type":"string"},{"internalType":"string[]","name":"inputs","type":"string[]"},{"internalType":"address","name":"payee","type":"address"}],"name":"runJob","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"dealId","type":"string"},{"internalType":"string","name":"dataId","type":"string"}],"name":"submitResults","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
  const abi =`[
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "calling_contract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "payee",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "module",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string[]",
          "name": "inputs",
          "type": "string[]"
        }
      ],
      "name": "JobAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "disableChangeControllerAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getControllerAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRequiredDeposit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTokenAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextJobID",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requiredDeposit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "module",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "inputs",
          "type": "string[]"
        },
        {
          "internalType": "address",
          "name": "payee",
          "type": "address"
        }
      ],
      "name": "runJob",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_controllerAddress",
          "type": "address"
        }
      ],
      "name": "setControllerAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cost",
          "type": "uint256"
        }
      ],
      "name": "setRequiredDeposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenAddress",
          "type": "address"
        }
      ],
      "name": "setTokenAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "dealId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dataId",
          "type": "string"
        }
      ],
      "name": "submitResults",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]`;
  const [jobEvents, setJobEvents] = useState([]);
  const [showIframe, setShowIframe] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const WSS_ENDPOINT = "wss://rpc.ankr.com/arbitrum_sepolia";

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    // Listen for JobAdded events
    contract.on("JobAdded", (jobId, client, payee, module, inputs, event) => {

      console.log("New job created!:", {
        jobId: jobId.toString(),
        client,
        payee,
        module,
        inputs,
        transactionHash: event.transactionHash
      });
      
      setJobEvents(prev => [...prev, {
        jobId: jobId.toString(),
        client,
        payee,
        module,
        inputs,
        transactionHash: event.transactionHash
      }]);

      // Show iframe after job creation
      

      let wsProvider;
      let wsContract;
      
      const setupWebSocket = () => {
        try {
          wsProvider = new ethers.providers.WebSocketProvider(WSS_ENDPOINT);
          wsContract = new ethers.Contract(CONTRACT_ADDRESS, abi, wsProvider);
  
          wsProvider._websocket.on('close', () => {
            console.log('WebSocket disconnected, reconnecting...');
            // setTimeout(setupWebSocket, 3000);
          });
  
          wsContract.on("JobAdded", handleJobEvent);
        } catch (error) {
          console.error("WebSocket connection failed:", error);
          // setTimeout(setupWebSocket, 3000);
        }
      };
  
      const handleJobEvent = (jobId, client, payee, module, inputs, event) => {
        console.log("New job created:", {
          jobId: jobId.toString(),
          client,
          payee,
          module,
          inputs,
          transactionHash: event.transactionHash
        });
        setJobEvents(prev => [...prev, {
          jobId: jobId.toString(),
          client,
          payee,
          module,
          inputs,
          transactionHash: event.transactionHash
        }]);
      };
  
      // setupWebSocket();
  
      return () => {
        if (wsContract) {
          wsContract.removeAllListeners("JobAdded");
        }
        if (wsProvider) {
          wsProvider.destroy();
        }
      };


    });

    // Cleanup listener on unmount
    return () => {
      contract.removeAllListeners("JobAdded");
    };
  }, []);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchTokenBalance();
    const ws = new WebSocket('ws://localhost:3009/test');
    
    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log('messaage');
      setMessages(prev => [...prev, event.data]);
    };

    return () => ws.close();
  }, []);
  const sendMessage = (msg) => {
    if (socket) {
      socket.send(msg);
    }
  };
  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return new ethers.providers.Web3Provider(window.ethereum);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    }
  };
  const handleMetaMaskConnect = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      window.open('https://metamask.io', '_blank');
    }
  };
  const runJobOnContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      
      const module = "speech_to_text";
      const inputs = ["target=", "input2"];
      const payee = await signer.getAddress();
      
      const tx = await contract.runJob(module, inputs, payee);
      await tx.wait();
      console.log("Job started successfully");
      setShowIframe(true);
      await fetchTokenBalance(); // Add balance refresh after transaction
    } catch (error) {
      console.error("Error running job:", error);
    }
  };

  const fetchTokenBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20Address = "0x0352485f8a3cB6d305875FaC0C40ef01e0C06535";
      const erc20Abi = ["function balanceOf(address) view returns (uint256)"];
      const tokenContract = new ethers.Contract(erc20Address, erc20Abi, provider);
      const address = await provider.getSigner().getAddress();
      const balance = await tokenContract.balanceOf(address);
      setTokenBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setTokenBalance('0');
    }
  };

  const handleCardClick = async () => {
    await connectWallet();
    console.log("Card clicked");
    await runJobOnContract();
    await fetchTokenBalance(); // Add balance refresh
  };

  const handleAccountClick = () => {
    connectWallet();
    console.log("Account clicked");
  };

  const handleLogoClick = () => {
    setShowIframe(false);
  };

  const handleGpuSelect = (e, gpu) => {
    e.stopPropagation(); // Prevent card click event
    console.log(`Selected GPU: ${gpu}`);
    // Add your GPU selection logic here
  };

  return (
    <div className="App">
      <nav className="top-bar">
        <div className="logo" onClick={handleLogoClick}>
          LP <span className="balance">{Number(tokenBalance).toFixed(2)}</span>
        </div>
        <button className="account-btn" onClick={handleAccountClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
                  fill="#e0e0e0"/>
          </svg>
        </button>
      </nav>
      <div className="main-content">
     
        {!showIframe ? (
          <div  className="card-container">
           <div 
           className="card" 
           onClick={handleCardClick}
           style={{ cursor: 'pointer' }}
         >
            <div className="card-content">
            <img src="speech-to-text.svg" className="card-img" alt="Speech to Text" />
            <span className="count-badge">5.1k runs</span>
            </div>
          <div className="verified-badge">
            <img src="verified-check.svg" alt="Verified" />
          </div>
          <div className="tech-tag">lilypad-tech\sts</div>
          <div className="gpu-options">
            <span onClick={(e) => handleGpuSelect(e, 'RTX 4090')} className="gpu-badge">
              RTX 4090 (5LP)
            </span>
            <span onClick={(e) => handleGpuSelect(e, 'RTX 3080')} className="gpu-badge">
              RTX 3080 (3LP)
            </span>
          </div>
          <div className="card-body">
            <h2 className="card-title">Speech to Text</h2>
            <p className="card-description">Convert speech to text</p>
          </div>
        </div>
        <div 
           className="card" 
           onClick={handleCardClick}
           style={{ cursor: 'pointer' }}
         >
          {/* <div className="card"> */}
          <div className="card-content">
            <img src="logo-gen.svg" className="card-img" alt="Speech to Text" />
            <span className="count-badge">987 runs</span>
          </div>
            <div className="verified-badge">
            <img src="community-badge.svg" alt="Verified" />
          </div>
            <div className="tech-tag">arsenum\logo-gen</div>
            <div className="gpu-options">
            <span onClick={(e) => handleGpuSelect(e, 'RTX 4090')} className="gpu-badge">
              RTX 4090 (5LP)
            </span>
            <span onClick={(e) => handleGpuSelect(e, 'RTX 3080')} className="gpu-badge">
              RTX 3080 (3LP)
            </span>
          </div>
            <div className="card-body">
              <h2 className="card-title">Logo Generator</h2>
              <p className="card-description">Generate Logos</p>
            </div>
          {/* </div> */}
        </div>
        </div>
        ) : (
          <div className="iframe-container">
            <iframe 
              className="iframe"
              src="https://d5f85f33474a27a110.gradio.live/"
              title="Content"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        <div className="message-container">
        {messages.map((msg, index) => (
          <div key={index} className="message">{msg}</div>
        ))}
      </div>
      <button onClick={() => sendMessage('Hello!')}>Send Message</button>
    
      </div>
    </div>
  );
}

export default App;
