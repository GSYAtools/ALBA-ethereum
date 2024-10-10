document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    const agregarDocumentoBtn = document.getElementById('agregarDocumento');
    const listaDocumentos = document.getElementById('listaDocumentos');
    const listaDocumentosCompartidos = document.getElementById('listaDocumentosCompartidos');

    function cargarDocumentos() {
        const token = localStorage.getItem('authToken');
        fetch('/api/documentos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            listaDocumentos.innerHTML = '';
            data.documentos.forEach(doc => {
                const li = document.createElement('li');
                li.textContent = doc.nombre;
                listaDocumentos.appendChild(li);
            });
        })
        .catch(error => console.error('Error al cargar documentos:', error));
    }

    function cargarDocumentosCompartidos() {
        const token = localStorage.getItem('authToken');
        fetch('/api/documentos-compartidos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            listaDocumentosCompartidos.innerHTML = '';
            data.documentos.forEach(doc => {
                const li = document.createElement('li');
                li.textContent = doc.nombre;
                listaDocumentosCompartidos.appendChild(li);
            });
        })
        .catch(error => console.error('Error al cargar documentos compartidos:', error));
    }

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });

    agregarDocumentoBtn.addEventListener('click', function() {
        // Aquí implementarías la lógica para agregar un nuevo documento
        console.log('Agregar nuevo documento');
        // Por ejemplo, podrías abrir un modal o redirigir a una página de carga de documentos
    });

    cargarDocumentos();
    cargarDocumentosCompartidos();
});
