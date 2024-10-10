document.addEventListener('DOMContentLoaded', function() {
    console.log('Página principal cargada');
    // Aquí puedes añadir cualquier lógica necesaria para la página principal
    // Por ejemplo, comprobar si el usuario está autenticado y redirigir al dashboard si es así
    
    function checkAuthentication() {
        const token = localStorage.getItem('authToken');
        if (token) {
            window.location.href = 'dashboard.html';
        }
    }

    checkAuthentication();
});
