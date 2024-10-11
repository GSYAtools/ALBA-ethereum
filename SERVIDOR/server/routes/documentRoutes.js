const express = require('express');
const multer = require('multer');
const { pool, web3 } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para almacenar el archivo en memoria
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, nombre, propietario_id, hash_blockchain, created_at FROM documents WHERE propietario_id = $1', [req.user.userId]);
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.post('/', upload.single('archivo'), async (req, res) => {
    try {
        const { nombre } = req.body;
        const archivo = req.file;

        if (!archivo) {
            return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
        }

        const contenido = archivo.buffer;
        const mimeType = archivo.mimetype;
        const hash = web3.utils.sha3(contenido);
        
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO documents (nombre, contenido, propietario_id, hash_blockchain, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, propietario_id, hash_blockchain, created_at',
            [nombre, contenido, req.user.userId, hash, mimeType]
        );
        client.release();

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor al crear el documento', error: error.message });
    }
});

router.get('/shared', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT d.id, d.nombre, d.propietario_id, d.hash_blockchain, d.created_at FROM documents d JOIN document_sharing ds ON d.id = ds.document_id WHERE ds.user_id = $1',
            [req.user.userId]
        );
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta para descargar un documento
router.get('/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.connect();
        const result = await client.query('SELECT nombre, contenido, mime_type FROM documents WHERE id = $1 AND propietario_id = $2', [id, req.user.userId]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        const documento = result.rows[0];
        res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre}"`);
        res.setHeader('Content-Type', documento.mime_type || 'application/octet-stream');
        res.send(documento.contenido);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor al descargar el documento' });
    }
});

module.exports = router;