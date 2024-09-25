const AUTHENTICATOR_ADDRESS = '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7';
const AUTHENTICATOR_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"},{"internalType":"string","name":"token","type":"string"},{"internalType":"uint256","name":"expireDate","type":"uint256"}],"name":"addToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllTokens","outputs":[{"components":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"},{"internalType":"string","name":"token","type":"string"},{"internalType":"uint256","name":"expireDate","type":"uint256"}],"internalType":"struct Authenticator.ProofOfIdentity[]","name":"tokens","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"}],"name":"getTokenByUser","outputs":[{"components":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"},{"internalType":"string","name":"token","type":"string"},{"internalType":"uint256","name":"expireDate","type":"uint256"}],"internalType":"struct Authenticator.ProofOfIdentity","name":"","type":"tuple"}],"stateMutability":"view","type":"function","constant":true}];

let web3;
let authenticatorContract;
let userAccount;

document.addEventListener('DOMContentLoaded', function() {
    const connectButton = document.getElementById('connectButton');
    connectButton.addEventListener('click', initWeb3AndContract);
});

async function initWeb3AndContract() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            web3 = new Web3(window.ethereum);
            const chainId = await web3.eth.getChainId();
            
            let networkName = getNetworkName(chainId);
            
            if (chainId !== 1337) {
                showMessage(`Por favor, conecta MetaMask a la red local (localhost:8545, ID: 1337). Actualmente conectado a: ${networkName} (ID: ${chainId})`);
                return false;
            }
            
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            
            authenticatorContract = new web3.eth.Contract(AUTHENTICATOR_ABI, AUTHENTICATOR_ADDRESS);
            
            showMessage(`Conectado a la red local. Cuenta: ${userAccount}`);
            await getTokenForUser();

            setupEventListeners();

            return true;
        } catch (error) {
            console.error('Error al inicializar Web3 o el contrato:', error);
            showMessage(`Error: ${error.message}`);
            return false;
        }
    } else {
        showMessage('MetaMask no está instalado');
        return false;
    }
}

function setupEventListeners() {
    if (window.ethereum) {
        window.ethereum.on('disconnect', (error) => {
            console.log('Desconectado de MetaMask:', error);
            showMessage('Desconectado de MetaMask. Intentando reconectar...');
            setTimeout(() => initWeb3AndContract(), 1000);
        });

        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('Cuenta de MetaMask cambiada');
            userAccount = accounts[0];
            showMessage(`Cuenta cambiada. Nueva cuenta: ${userAccount}`);
            getTokenForUser();
        });

        window.ethereum.on('chainChanged', (chainId) => {
            console.log('Red de MetaMask cambiada');
            showMessage('Red cambiada. Actualizando conexión...');
            window.location.reload();
        });
    }
}

function getNetworkName(chainId) {
    const networks = {
        1: 'Ethereum Mainnet',
        3: 'Ropsten Testnet',
        4: 'Rinkeby Testnet',
        5: 'Goerli Testnet',
        42: 'Kovan Testnet',
        1337: 'Ganache Local'
    };
    return networks[chainId] || 'Red Desconocida';
}

function showMessage(message) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
    }
}

async function getTokenForUser() {
    if (!authenticatorContract) {
        console.error('El contrato no está inicializado');
        return null;
    }

    try {
        const user = { id: userAccount, name: "" };
        const proofOfIdentity = await authenticatorContract.methods.getTokenByUser(user).call();
        return proofOfIdentity;
    } catch (error) {
        console.error('Error al obtener el token del usuario:', error);
        showMessage(`Error al obtener el token: ${error.message}`);
        return null;
    }
}
