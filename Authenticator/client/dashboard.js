document.addEventListener('DOMContentLoaded', async function() {
    const userAddress = sessionStorage.getItem('userAddress');
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (!userAddress) {
        console.log('Información de usuario no encontrada, redirigiendo...');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userAddress').textContent = userAddress;

    if (isAdmin) {
        document.getElementById('adminPanel').style.display = 'block';
    } else {
        document.getElementById('userPanel').style.display = 'block';
    }
});

async function getAllUsers() {
    try {
        const tokens = await authenticatorContract.methods.getAllTokens().call();
        const userList = document.getElementById('userList');
        userList.innerHTML = '';
        tokens.forEach(token => {
            const li = document.createElement('li');
            li.textContent = `${token.user.name} (${token.user.id})`;
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error);
    }
}

async function getAllTokens() {
    try {
        const allTokens = await authenticatorContract.methods.getAllTokens().call();
        return allTokens;
    } catch (error) {
        console.error('Error al obtener todos los tokens:', error);
        return [];
    }
}

async function getUserInfo() {
    try {
        const user = { id: userAccount, name: "" };
        const proofOfIdentity = await authenticatorContract.methods.getTokenByUser(user).call();
        document.getElementById('userName').textContent = proofOfIdentity.user.name;
        document.getElementById('userToken').textContent = proofOfIdentity.token;
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
    }
}

