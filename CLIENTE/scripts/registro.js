// Importamos la configuración
import config from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');

    registroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validación básica
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Usar la URL de la API desde la configuración importada
        fetch(`${config.apiUrl}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Registro exitoso');
                alert('Registro exitoso. Por favor, inicia sesión.');
                window.location.href = 'login.html';
            } else {
                console.error('Error en el registro:', data.message);
                alert('Error en el registro: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en la conexión: ' + error.message);
        });
    });

    // Función para validar el formato del email
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Validación en tiempo real del email
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        if (!validateEmail(this.value)) {
            this.setCustomValidity('Por favor, introduce un email válido');
        } else {
            this.setCustomValidity('');
        }
    });

    // Validación en tiempo real de la contraseña
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', function() {
        if (this.value.length < 8) {
            this.setCustomValidity('La contraseña debe tener al menos 8 caracteres');
        } else {
            this.setCustomValidity('');
        }
    });

    // Validación en tiempo real de la confirmación de contraseña
    const confirmPasswordInput = document.getElementById('confirmPassword');
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value !== passwordInput.value) {
            this.setCustomValidity('Las contraseñas no coinciden');
        } else {
            this.setCustomValidity('');
        }
    });
});
