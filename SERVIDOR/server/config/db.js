const { Pool } = require('pg');
const { Web3 } = require('web3');
const { parse } = require('url');

// Parsear la URL de la base de datos
const databaseUrl = process.env.DATABASE_URL;
let pool;

if (databaseUrl) {
    const { hostname, port, pathname, auth } = parse(databaseUrl);
    const [user, password] = auth ? auth.split(':') : [];

    // Mostrar los datos parseados (asegúrate de no loggear esto en producción)
    /*
    console.log('Datos parseados de DATABASE_URL:');
    console.log('Hostname:', hostname);
    console.log('Port:', port);
    console.log('Database:', pathname ? pathname.slice(1) : '');
    console.log('User:', user);
    console.log('Password:', password ? '********' : 'No definida');
    */

    // Configurar el pool de conexiones
    pool = new Pool({
        user,
        password,
        host: hostname,
        port: port || 5432,
        database: pathname ? pathname.slice(1) : '', // Elimina la barra inicial
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
} else {
    console.error('ERROR: DATABASE_URL no está definido en las variables de entorno.');
    process.exit(1); // Termina el proceso con un código de error
}

// Función para verificar la conexión a la base de datos
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        console.log('Conexión exitosa a la base de datos');
        const res = await client.query('SELECT NOW()');
        console.log('Resultado de la consulta de prueba:', res.rows[0]);
        client.release();
        return true;
    } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
        return false;
    }
}

// Configurar Web3
const web3 = new Web3(process.env.ETHEREUM_NODE_URL);

module.exports = { pool, web3, testDatabaseConnection };
