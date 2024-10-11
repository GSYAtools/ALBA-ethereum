// Importamos la configuración
import config from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    const agregarDocumentoBtn = document.getElementById('agregarDocumento');
    const listaDocumentos = document.getElementById('listaDocumentos');
    const listaDocumentosCompartidos = document.getElementById('listaDocumentosCompartidos');
    const modal = document.getElementById('agregarDocumentoModal');
    const span = document.getElementsByClassName('close')[0];
    const agregarDocumentoForm = document.getElementById('agregarDocumentoForm');

    function cargarDocumentos() {
        const token = localStorage.getItem('authToken');
        fetch(`${config.apiUrl}/documents`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data); // Para depuración
            listaDocumentos.innerHTML = '';
            if (Array.isArray(data)) {
                data.forEach(doc => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.textContent = doc.nombre;
                    a.href = '#';
                    a.onclick = (e) => {
                        e.preventDefault();
                        descargarDocumento(doc.id, doc.nombre);
                    };
                    li.appendChild(a);
                    listaDocumentos.appendChild(li);
                });
            } else {
                console.error('Formato de respuesta inesperado:', data);
                listaDocumentos.innerHTML = '<li>Error al cargar documentos</li>';
            }
        })
        .catch(error => {
            console.error('Error al cargar documentos:', error);
            listaDocumentos.innerHTML = '<li>Error al cargar documentos</li>';
        });
    }

    function descargarDocumento(id, nombre) {
        const token = localStorage.getItem('authToken');
        fetch(`${config.apiUrl}/documents/${id}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            return response.blob().then(blob => ({ blob, contentType }));
        })
        .then(({ blob, contentType }) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = nombre;
    
            // Asignar la extensión correcta basada en el tipo MIME
            const extension = contentType.split('/')[1];
            if (extension && !nombre.endsWith(`.${extension}`)) {
                a.download += `.${extension}`;
            }
    
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error al descargar el documento:', error);
            alert('Error al descargar el documento');
        });
    }       

    function cargarDocumentosCompartidos() {
        const token = localStorage.getItem('authToken');
        fetch(`${config.apiUrl}/documents/shared`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de documentos compartidos recibidos:', data); // Para depuración
            listaDocumentosCompartidos.innerHTML = '';
            if (Array.isArray(data)) {
                data.forEach(doc => {
                    const li = document.createElement('li');
                    li.textContent = doc.nombre || doc.title || 'Documento sin nombre';
                    listaDocumentosCompartidos.appendChild(li);
                });
            } else if (data && Array.isArray(data.documentos)) {
                data.documentos.forEach(doc => {
                    const li = document.createElement('li');
                    li.textContent = doc.nombre || doc.title || 'Documento sin nombre';
                    listaDocumentosCompartidos.appendChild(li);
                });
            } else {
                console.error('Formato de respuesta inesperado para documentos compartidos:', data);
                listaDocumentosCompartidos.innerHTML = '<li>Error al cargar documentos compartidos</li>';
            }
        })
        .catch(error => {
            console.error('Error al cargar documentos compartidos:', error);
            listaDocumentosCompartidos.innerHTML = '<li>Error al cargar documentos compartidos</li>';
        });
    }

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });

    agregarDocumentoBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    span.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    agregarDocumentoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(agregarDocumentoForm);
        const token = localStorage.getItem('authToken');
        
        fetch(`${config.apiUrl}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Documento agregado:', data);
            modal.style.display = 'none';
            agregarDocumentoForm.reset();
            cargarDocumentos(); // Recargar la lista de documentos
        })
        .catch(error => {
            console.error('Error al agregar documento:', error);
            alert('Error al agregar el documento. Por favor, intente de nuevo.');
        });
    });

    cargarDocumentos();
    cargarDocumentosCompartidos();
});
