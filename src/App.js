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
  
  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    // Listen for JobAdded events
    contract.on("JobAdded", (jobId, client, payee, module, inputs, event) => {
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
    });

    // Cleanup listener on unmount
    return () => {
      contract.removeAllListeners("JobAdded");
    };
  }, []);

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return new ethers.providers.Web3Provider(window.ethereum);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    }
  };

  const runJobOnContract = async () => {
    try {
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      
      const module = "speech_to_text";
      const inputs = ["input1", "input2"]; // Replace with actual inputs
      const payee = await signer.getAddress();
      
      const tx = await contract.runJob(module, inputs, payee);
      await tx.wait();
      console.log("Job started successfully");
    } catch (error) {
      console.error("Error running job:", error);
    }
  };

  const handleCardClick = async () => {
    console.log("Card clicked");
    await runJobOnContract();
  };

  const handleAccountClick = () => {
    console.log("Account clicked");
  };

  return (
    <div className="App">
      <nav className="top-bar">
        <div className="logo">LP</div>
        <button className="account-btn" onClick={handleAccountClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
                  fill="#e0e0e0"/>
          </svg>
        </button>
      </nav>
      <header className="App-header">
        <div 
          className="card" 
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          <img src="gradio.svg" className="card-img" alt="Speech to Text" />
          <div className="card-body">
            <h2 className="card-title">Speech to Text</h2>
            <p className="card-description">Convert speech to text</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
