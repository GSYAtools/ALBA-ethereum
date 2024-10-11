const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const { Web3 } = require('web3');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configurar conexión a PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Configurar Web3
const web3 = new Web3(process.env.ETHEREUM_NODE_URL);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Ruta de prueba de conexión a Ethereum
app.get('/api/ethereum-status', async (req, res) => {
    try {
        const blockNumber = await web3.eth.getBlockNumber();
        res.json({ status: 'connected', blockNumber });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

module.exports = { pool, web3 };
