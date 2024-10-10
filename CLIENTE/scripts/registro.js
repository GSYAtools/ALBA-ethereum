document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');

    registroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Aquí realizarías la llamada al servidor para registrar
        console.log('Intento de registro con:', nombre, email);

        fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password }),
        })
        .then(response => response.json())
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
            alert('Error en la conexión');
        });
    });
});
