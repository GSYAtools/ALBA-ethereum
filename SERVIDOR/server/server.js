const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const { pool, web3, testDatabaseConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

// Configurar logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
// Para el archivo (logs detallados)
app.use(morgan('combined', { stream: accessLogStream }));
// Para la consola (logs más concisos)
app.use(morgan('dev', {
    skip: function (req, res) { return res.statusCode < 400 }
}));

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', authRoutes);
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

// Ruta de prueba para la conexión a la base de datos
app.get('/api/database-status', async (req, res) => {
    const isConnected = await testDatabaseConnection();
    if (isConnected) {
        res.json({ status: 'connected' });
    } else {
        res.status(500).json({ status: 'error', message: 'No se pudo conectar a la base de datos' });
    }
});

const PORT = process.env.PORT || 3000;

// Verificar la conexión a la base de datos antes de iniciar el servidor
testDatabaseConnection().then((isConnected) => {
    if (isConnected) {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto ${PORT}`);
            console.log(`Los logs se están escribiendo en ${path.join(__dirname, 'server.log')}`);
        });
    } else {
        console.error('No se pudo iniciar el servidor debido a problemas de conexión con la base de datos');
        process.exit(1);
    }
});

module.exports = app;
