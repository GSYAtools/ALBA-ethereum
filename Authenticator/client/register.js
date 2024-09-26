let web3;
let authenticatorContract;
let userAccount;

const AUTHENTICATOR_ADDRESS = '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7'; // Asegúrate de que esta sea la dirección correcta
const AUTHENTICATOR_ABI =[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"tokens","outputs":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"},{"internalType":"string","name":"token","type":"string"},{"internalType":"uint256","name":"expireDate","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"},{"internalType":"string","name":"token","type":"string"},{"internalType":"uint256","name":"expireDate","type":"uint256"}],"name":"addToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllTokens","outputs":[{"components":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"},{"internalType":"string","name":"token","type":"string"},{"internalType":"uint256","name":"expireDate","type":"uint256"}],"internalType":"struct Authenticator.ProofOfIdentity[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"}],"name":"getTokenByUser","outputs":[{"components":[{"components":[{"internalType":"address","name":"id","type":"address"},{"internalType":"string","name":"name","type":"string"}],"internalType":"struct sharedStructs.User","name":"user","type":"tuple"},{"internalType":"string","name":"token","type":"string"},{"internalType":"uint256","name":"expireDate","type":"uint256"}],"internalType":"struct Authenticator.ProofOfIdentity","name":"","type":"tuple"}],"stateMutability":"view","type":"function","constant":true}];

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', handleRegister);

    initWeb3();
});

async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            authenticatorContract = new web3.eth.Contract(AUTHENTICATOR_ABI, AUTHENTICATOR_ADDRESS);
        } catch (error) {
            console.error('Error al inicializar Web3:', error);
            showMessage('Error al conectar con MetaMask. Por favor, inténtalo de nuevo.');
        }
    } else {
        showMessage('MetaMask no está instalado');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const userName = document.getElementById('userName').value;

    if (!userName) {
        showMessage('Por favor, ingresa un nombre.');
        return;
    }

    try {
        const user = {
            id: userAccount, // Asegúrate de que userAccount sea la dirección del usuario actual
            name: userName
        };

        const token = "TOKEN_" + Math.random().toString(36).substr(2, 9); // Genera un token simple
        const expireDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 días desde ahora

        await authenticatorContract.methods.addToken(user, token, expireDate).send({ from: userAccount });
        
        showMessage('Registro exitoso. Redirigiendo...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        showMessage(`Error al registrar: ${error.message}`);
    }
}

function showMessage(message) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
    }
}
