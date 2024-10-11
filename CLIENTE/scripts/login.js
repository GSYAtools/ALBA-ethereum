import config from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Aquí realizarías la llamada al servidor para autenticar
        console.log('Intento de login con:', email);

        fetch(`${config.apiUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Login exitoso');
                localStorage.setItem('authToken', data.token);
                window.location.href = 'dashboard.html';
            } else {
                console.error('Error en el login:', data.message);
                alert('Error en el login: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en la conexión');
        });
    });
});
