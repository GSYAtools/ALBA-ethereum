const express = require('express');
const { pool, web3 } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM documents WHERE propietario_id = $1', [req.user.userId]);
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nombre, contenido } = req.body;
        const hash = web3.utils.sha3(contenido);
        
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO documents (nombre, contenido, propietario_id, hash_blockchain) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, contenido, req.user.userId, hash]
        );
        client.release();

        // Aquí podrías añadir la lógica para guardar el hash en la blockchain

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.get('/compartidos', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT d.* FROM documents d JOIN document_sharing ds ON d.id = ds.document_id WHERE ds.user_id = $1',
            [req.user.userId]
        );
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;
