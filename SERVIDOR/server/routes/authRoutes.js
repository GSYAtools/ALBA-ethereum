const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, web3 } = require('../server');

const router = express.Router();

router.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const client = await pool.connect();

        // Verificar si el usuario ya existe
        const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            client.release();
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Crear cuenta Ethereum
        const account = web3.eth.accounts.create();

        const result = await client.query(
            'INSERT INTO users (nombre, email, password, ethereum_address) VALUES ($1, $2, $3, $4) RETURNING id',
            [nombre, email, hashedPassword, account.address]
        );

        client.release();
        res.status(201).json({ message: 'Usuario registrado exitosamente', ethereumAddress: account.address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const client = await pool.connect();

        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, ethereumAddress: user.ethereum_address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;
