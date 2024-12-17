import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import tokenContractABI from './abi/token.json'
import onChainJobControllerabi from './abi/job_creator.json'
import Card from './Card';
import markdownToJson from 'md-2-json'
import toml from 'toml'; 
import GpuList from './GpuList'; 

import CountdownTimer from './CountdownTimer';
import TopBar from './TopBar'; 
import LilypadUsersAbi from './abi/LilypadUsers.json'
let ws;
function App() {
  const [jobEvents, setJobEvents] = useState([]);
  const [showIframe, setShowIframe] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [showOverlay, setShowOverlay] = useState(false);
  const [coinBalance, setCoinBalance] = useState('0');
  const [walletAddress, setWalletAddress] = useState('0');
  const [update, setUpdate] = useState(0);
  const [timer, setTimer] = useState(300);
  const [data, setData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(0);

  async function fetchModuleDef(moduleName) {
    return new Promise((resolve, reject) => {
      const dbRequest = indexedDB.open('ModulesDatabase', 1);
  
      dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('modules', 'readonly');
        const store = transaction.objectStore('modules');
        const getRequest = store.get(moduleName); // Adjust the key as necessary
  
        getRequest.onsuccess = function(event) {
          const moduleData = event.target.result;
          resolve(moduleData);
          // if (moduleData && moduleData.data && moduleData.data.timeout) {
          //   resolve(moduleData.data.timeout);
          // } else {
          //   resolve(null); // or reject with an error if preferred
          // }
        };
  
        getRequest.onerror = function(event) {
          reject('Error fetching timeout: ' + event.target.errorCode);
        };
      };
  
      dbRequest.onerror = function(event) {
        reject('Error opening IndexedDB: ' + event.target.errorCode);
      };
    });
  }
  async function fetchAndStoreModules() {
    return new Promise(async (resolve, reject) => {
    const transactionPromises = [];
  
    const dbRequest = indexedDB.open('ModulesDatabase', 1);
  
    dbRequest.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('modules')) {
        db.createObjectStore('modules', { keyPath: 'module' });
      }
    };

  
    dbRequest.onsuccess = async function(event) {
  
      const db = event.target.result;
      const transaction = db.transaction('modules', 'readwrite');
      const store = transaction.objectStore('modules');
      store.clear()
      const offerModules = localStorage.getItem("OFFER_MODULES").split(","); 
      for (let module of offerModules) {
       
        try {
          module = module.trim();
          const moduleUrl = `https://${module.replace("github.com","raw.githubusercontent.com").replace(":main","/refs/heads/main/lilypad_module.json.tmpl")}`;
          let response = null;
          try {
            response = await fetch(moduleUrl);
          } catch (error) {
            continue;
          }
          const moduleData = (await response.text()).replace(/EnvironmentVariables": \[.*?\]/gs, 'EnvironmentVariables": []').replace(/Entrypoint": \[.*?\]/gs, 'Entrypoint": []');
          const tmpdata = JSON.parse(moduleData);
          const readme = `https://${module.replace("github.com","raw.githubusercontent.com").replace(":main","/refs/heads/main/README.md")}`;
          const readmeData = await(await fetch(readme)).text();
          const jsonContent = markdownToJson.parse(readmeData);
          tmpdata.name = Object.keys(jsonContent)[0]
          tmpdata.description = Object.keys(jsonContent[Object.keys(jsonContent)[0]])[0]
          
          const db = event.target.result;
          const transaction = db.transaction('modules', 'readwrite');
          const store = transaction.objectStore('modules');
          store.put({ module: module, data: tmpdata });

          const transactionPromise = new Promise((resolve2, reject) => {
            transaction.oncomplete = function() {
              console.log('Module DEF stored successfully');
              resolve2();
            };
          });
          transactionPromises.push(transactionPromise);
        } catch (error) {
          console.error(`Error storing module ${module}:`, error);
          
        }
      }
      let allModules
      const transactionPromise = new Promise((resolve2, reject) => {
        const t = db.transaction('modules', 'readonly');
        const s = t.objectStore('modules');
        const getAllRequest = s.getAll();
        getAllRequest.onsuccess = function(event) {
          allModules = event.target.result;
          console.log("setdata allModules",allModules)
          resolve2();
        };
  
        getAllRequest.onerror = function(event) {
          console.error('Error fetching stored modules:', event.target.errorCode);
        };
  
     
      });
      transactionPromises.push(transactionPromise);
      const executeSequentially = async (promises) => {
        for (const promise of promises) {
          await promise;
        }
      };
      await executeSequentially(transactionPromises);
      resolve(allModules);
    };
  
    dbRequest.onerror = function(event) {
          reject(error);
        }
      ;
    });
    
  }

  async function fetchDealsDataAndStore() {
    const url = localStorage.getItem("SERVICES_SOLVER_API")+'/api/v1/deals'; 
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Open IndexedDB
        const request = indexedDB.open('DealsDatabase', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('deals')) {
                db.createObjectStore('deals', { keyPath: 'url' });
            }
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction('deals', 'readwrite');
            const store = transaction.objectStore('deals');

            // Upsert fetched data using URL as the key
            store.put({ url: url, data: data });

            transaction.oncomplete = function() {
                console.log('Data stored successfully');
            };

            transaction.onerror = function() {
                console.error('Transaction failed');
            };
        };

        request.onerror = function() {
            console.error('IndexedDB request failed');
        };
    } catch (error) {
        console.error('Fetch error:', error);
    }
}
  useEffect(() => {
  const start = async () => {
    const WSS_ENDPOINT = localStorage.getItem("WEB3_RPC_URL")
    const Job_Creator_CONTRACT_ADDRESS = localStorage.getItem("WEB3_JOBCREATOR_ADDRESS");
    const erc20Address = localStorage.getItem("WEB3_TOKEN_ADDRESS")
    await downloadAndSaveToml(localStorage.getItem("NETWORK")?localStorage.getItem("NETWORK"):"https://raw.githubusercontent.com/arsenum/demonet/refs/heads/main/config.toml");
    let modules =await fetchAndStoreModules();
    setData(modules);

   
    const dbRequest = indexedDB.open('ModulesDatabase', 1);
  
    dbRequest.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('modules')) {
        db.createObjectStore('modules', { keyPath: 'module' });
      }
    };
    dbRequest.onsuccess = async function(event) {

    };
    fetchDealsDataAndStore();
    const fetchIt = async () => {
      let modules = await fetchAndStoreModules();
      // setUpdate(Math.random());
      setData(modules);
      console.log("Modules downloaded")
    }
    fetchIt();
    if (typeof window.ethereum === 'undefined') {
      console.error("MetaMask not found");
      return;
    }
    console.log("switch provider")
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(Job_Creator_CONTRACT_ADDRESS, onChainJobControllerabi, provider);
    
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

      let wsProvider;
      let wsContract;
      
      const setupWebSocket = () => {
        try {
          wsProvider = new ethers.providers.WebSocketProvider(WSS_ENDPOINT);
          wsContract = new ethers.Contract(Job_Creator_CONTRACT_ADDRESS, onChainJobControllerabi, wsProvider);
  
          wsProvider._websocket.on('close', () => {
            console.log('WebSocket disconnected, reconnecting...');
          });
  
          wsContract.on("JobAdded", handleJobEvent);
        } catch (error) {
          console.error("WebSocket connection failed:", error);
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
  
  
      return () => {
        
        if (wsContract) {
          wsContract.removeAllListeners("JobAdded");
        }
      };

      
    });
    SetupSockets()
    // Cleanup listener on unmount
    return () => {
      contract.removeAllListeners("JobAdded");
    };
  }
  start();
  }, []);

  const downloadAndSaveToml = async (path) => {
    return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(path);
      const tomlText = await response.text();
      const parsedToml = toml.parse(tomlText);

      function flattenObject(obj, parentKey = '', result = {}) {
        for (const [key, value] of Object.entries(obj)) {
          const newKey = parentKey ? `${parentKey}_${key}` : key;
          if (typeof value === 'object' && !Array.isArray(value)) {
            flattenObject(value, newKey, result);
          } else {
            result[newKey] = value;
          }
        }
        return result;
      }

      const flattenedToml = flattenObject(parsedToml);

      for (const [key, value] of Object.entries(flattenedToml)) {
        localStorage.setItem(key.toUpperCase(), value);
      }

      console.log('TOML keys and values saved to local storage');
      switchNetwork();
      resolve();
    } catch (error) {
      console.error('Error fetching or parsing TOML file:', error);
    }
  })
}


  function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }
    
  const SetupSockets = () => {
    fetchTokenBalance();
    ws = new WebSocket('wss://socket.arsenum.com');
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`{"sessionId":"${session}"}`);
      }
    }, 30000);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };


    ws.onmessage = async (event) => {
      console.log('messaage:', event.data);
      const data = JSON.parse(event.data);
      if(data.message && data.message.indexOf('URL') > -1){

        const module = await fetchModuleDef(localStorage.getItem('ACTIVE_MODULE'));
        setTimer(parseInt(module.data.job.Spec.Timeout))
        setShowIframe(true);
        setShowOverlay(false);
      }
      if(JSON.parse(event.data)["type"] === 'welcome'){
        console.log('set storage:', event.data);
         sessionStorage.setItem('sessionId', JSON.parse(event.data)["id"]);
      }
        // setMessages(prev => [...prev, event.data]);
    };
    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };
    return () => {
      // Cleanup logic here
    };
    // return () => ws.close();
  } 
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
  const runJobOnContract = async (card) => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(localStorage.getItem("WEB3_JOBCREATOR_ADDRESS"), onChainJobControllerabi, signer);

      const module = card.module;

      const inputs = ['ENV=CALL_BACK='+sessionStorage.getItem('sessionId')];
      const payee = await signer.getAddress();
      
      // Check the current allowance
      const tokenContract = new ethers.Contract(localStorage.getItem("WEB3_TOKEN_ADDRESS"), tokenContractABI, signer);
      const allowance = await tokenContract.allowance(payee, localStorage.getItem("WEB3_JOBCREATOR_ADDRESS"));
      const requiredAllowance = ethers.utils.parseUnits("2", "ether"); // Replace with actual amount and decimals
      
      // Request approval for the required amount
      const approveTx = await tokenContract.approve(localStorage.getItem("SERVICES_SOLVER"), requiredAllowance);
      await approveTx.wait();


      const tx = await contract.runJob(module, inputs, payee,);
      const receipt = await tx.wait();
      console.log("Job started successfully",receipt);
      await fetchTokenBalance(); // Add balance refresh after transaction
      setShowOverlay(true);
  };

  const fetchTokenBalance = async () => {
    if (typeof window.ethereum === 'undefined') {
      return
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20Abi = ["function balanceOf(address) view returns (uint256)"];
      const tokenContract = new ethers.Contract(localStorage.getItem("WEB3_TOKEN_ADDRESS"), erc20Abi, provider);
      const address = await provider.getSigner().getAddress();
      const balance = await tokenContract.balanceOf(address);
      setTokenBalance(ethers.utils.formatEther(balance));
      setWalletAddress(await provider.getSigner().getAddress()); 
    } catch (error) {
      console.error("Error fetching balance:", error);
      setTokenBalance('0');
    }
    fetchCoinBalance();
     
  };


  const fetchCoinBalance = async () => {
    if (typeof window.ethereum === 'undefined') {
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const address = await provider.getSigner().getAddress();
      const balance = await provider.getBalance(address);
      console.log("ETH Balance:", ethers.utils.formatEther(balance));
      setCoinBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
      setCoinBalance('0');

    }
  };

  const handleCardClick = async (card) => {
    localStorage.setItem('ACTIVE_MODULE',card.module)
    await connectWallet();
    try {
      await runJobOnContract(card);
    } catch (error) {
      if (error.code === 'ACTION_REJECTED') {
        console.log('Transaction rejected by user');
      } else {
        console.error('Transaction failed:', error);
      }
    }
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
  };

  async function sendToken() {
    const recipientAddress = '0x6cc33C42020Fe876C7C46d74295bdF4716a5f71f';
    const amount = ethers.utils.parseUnits('1', 'ether'); // Assuming 1 token is equivalent to 1 ether unit

    // Check if Ethers has been injected by the browser (MetaMask)
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        // Request account access if needed
        await provider.send('eth_requestAccounts', []);

        // Get the user's accounts
        const signer = provider.getSigner();
        const senderAddress = await signer.getAddress();

        // Define the contract ABI and address
           
        const contractAddress = '0x2B0722b2C623b19aDA2ec56D50487203a7475C38';

        // Create a contract instance
        const contract = new ethers.Contract(contractAddress, tokenContractABI, signer);

        // Call the transfer function
        const tx = await contract.transfer(recipientAddress, amount);
        await tx.wait();

        console.log('Token sent successfully');
      } catch (error) {
        console.error('Error sending token:', error);
      }
    } else {
      console.error('Ethers provider not found. Please install MetaMask.');
    }
  }
  const getCurrentChainId = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Current chain ID:', chainId);
        return chainId;
      } catch (error) {
        console.error('Error getting chain ID:', error);
      }
    } else {
      console.error('MetaMask not found');
    }
  };
  const switchNetwork = async () => {
    getCurrentChainId()
  
    const chainIdDecimal = parseInt(localStorage.getItem('WEB3_CHAIN_ID'));
    const WEB3_HTTP_RPC_URL = localStorage.getItem('WEB3_HTTP_RPC_URL');
    const chainIdHex = '0x' + (chainIdDecimal.toString(16));
    console.log("adding chain",chainIdDecimal, WEB3_HTTP_RPC_URL);
    console.log(chainIdHex); // Output: 0xfeefee004
  //  RPC Error: Invalid merged permissions for subject "http://localhost:3001":
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          "method": "wallet_switchEthereumChain",
          "params": [
           {
             chainId: chainIdHex,//"0xfe607c6cc"
             rpcUrls: [WEB3_HTTP_RPC_URL],

           }
         ],
         });
      } catch (switchError) {
        //console.log('Error switching network. will try to add first:', switchError);

        
        // This error code indicates that the chain has not been added to MetaMask
        if (true) {//switchError.code === 4902
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainIdHex,
                  chainName: 'LP '+ chainIdDecimal, // Change to the desired chain name
                  nativeCurrency: {
                    name: 'Ether', // Change to the desired currency name
                    symbol: 'ETH', // Change to the desired currency symbol
                    decimals: 18,
                  },
                  rpcUrls: [WEB3_HTTP_RPC_URL], // Change to the desired RPC URL
                  blockExplorerUrls: ['https://blockscout.arsenum.com'], // Change to the desired block explorer URL
                },
              ],
            });
            // After adding the network, try switching again
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chainIdHex }],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
          }
        } else {
          console.error('Error switching network:', switchError);
        }
      }
    } else {
      console.error('MetaMask not found');
    }


    let provider;
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
    } else if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') { // For testing or development, you can use a local node
        provider = new ethers.providers.JsonRpcProvider(localStorage.getItem("SERVICES_API_HOST"));
    }
    
    const contractFactory = new ethers.Contract(localStorage.getItem("WEB3_USERS_ADDRESS"), LilypadUsersAbi, provider);
    async function getAvailableResouces() {
      
      const result = await contractFactory.getUser(localStorage.getItem("SERVICES_SOLVER"));
      
      // Decode the output here. Assuming 'result' is a struct.
      try {
        let decodedResult;
        
        if (typeof result === "object") { 
          // If it's an object directly returned from abi.decode, you might need to do nothing else
          decodedResult = result; 
        } else {
          const contractInterface = new ethers.utils.Interface(abi);  
          const typeStringForMyFunctionOutput = ABI_TYPES[contractFactory.myFunction().type];  // Assuming 'ABI_TYPES' is a map of your struct types
          
          if (typeof result === "string") {   // If it's hexadecimal, decode
            decodedResult = contractInterface.decode(typeStringForMyFunctionOutput, ethers.utils.hexlify(result));
          } else {
              decodedResult = contractInterface.decode(typeStringForMyFunctionOutput, result);
           }
        }
    
        console.log(decodedResult);  // Now 'decodedResult' contains the output of your function call
        localStorage.setItem("SERVICES_SOLVER_API", decodedResult[2]);
        return decodedResult[2];
      } catch (error) { 
         console.error('Error decoding data:', error.message)
       }
    }
    getAvailableResouces();
    setUpdate(update + 1);
  };


  return (
    <div className="App">
      {showOverlay && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}
       <div>
    </div>
    <TopBar
        fetchTokenBalance={fetchTokenBalance}
        downloadAndSaveToml={downloadAndSaveToml}
        walletAddress={walletAddress}
        coinBalance={coinBalance}
        tokenBalance={tokenBalance}
        session={session}
        handleLogoClick={handleLogoClick}
        handleAccountClick={handleAccountClick}
        switchNetwork={switchNetwork}
        setUpdate={setUpdate}
        setData={setData}
        fetchAndStoreModules={fetchAndStoreModules}
      />
      <div className="main-content">
     
        {!showIframe ? (
          <div  className="card-container">
        {data.map((card, index) => (  
          <Card key={index} data={card.data} handleCardClick={()=>handleCardClick(card)} 
          handleGpuSelect={handleGpuSelect} />
        ))
      }
       
        </div>
        ) : (
          <div className="iframe-container">
             <CountdownTimer initialTime={timer} onCountdownEnd={() => setShowIframe(false)} />
            <iframe 
              className="iframe"
              src={`https://${sessionStorage.getItem('sessionId')}.arsenum.com/`}
              title="Content"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

      </div>
      <footer>
        {showIframe?
        <span className='app-link'>{`https://${sessionStorage.getItem('sessionId')}.arsenum.com`}</span>:
        <GpuList update={update} />
    }
      </footer>
    </div>
  );
}

export default App;
