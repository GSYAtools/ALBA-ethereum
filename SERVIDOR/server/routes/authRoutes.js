const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, web3 } = require('../config/db');

const router = express.Router();

router.post('/registro', async (req, res) => {
    let client;
    try {
        const { nombre, email, password } = req.body;

        // Validación básica de presencia de datos
        if (!nombre || !email || !password) {
            return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
        }

        client = await pool.connect();

        // Verificar si el usuario ya existe
        const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear cuenta Ethereum (con manejo de errores)
        let ethereumAddress = 'No disponible';
        try {
            if (web3 && web3.eth && web3.eth.accounts) {
                const account = await web3.eth.accounts.create();
                ethereumAddress = account.address;
            } else {
                console.warn('Web3 no está disponible. Usando dirección Ethereum por defecto.');
            }
        } catch (ethError) {
            console.error('Error al crear cuenta Ethereum:', ethError);
        }

        // Insertar nuevo usuario
        const result = await client.query(
            'INSERT INTO users (nombre, email, password, ethereum_address) VALUES ($1, $2, $3, $4) RETURNING id',
            [nombre, email, hashedPassword, ethereumAddress]
        );

        // Crear token JWT
        const token = jwt.sign(
            { userId: result.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            userId: result.rows[0].id,
            ethereumAddress: ethereumAddress,
            token: token
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al registrar el usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});

router.post('/login', async (req, res) => {
    console.log('Solicitud de login recibida:', req.body);
    let client;
    try {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña son requeridos' 
            });
        }

        client = await pool.connect();

        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }

        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ 
            success: true,
            message: 'Login exitoso',
            token, 
            userId: user.id,
            ethereumAddress: user.ethereum_address 
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});

module.exports = router;
