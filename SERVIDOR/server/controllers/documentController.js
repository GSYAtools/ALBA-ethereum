const pool = require('../config/database');
const { Web3 } = require('web3');
const DocumentManagement = require('../../build/contracts/DocumentManagement.json');

// Inicializa Web3 con la URL de Ganache
const web3 = new Web3(process.env.ETHEREUM_NODE_URL);
let contract;

/**
 * Inicializa el contrato inteligente.
 * Esta función debe ser llamada al iniciar el servidor.
 */
async function initContract() {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = DocumentManagement.networks[networkId];
  contract = new web3.eth.Contract(
    DocumentManagement.abi,
    deployedNetwork && deployedNetwork.address,
  );
}

/**
 * Crea un nuevo documento en la base de datos y en la blockchain.
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.createDocument = async (req, res) => {
  const { titulo, contenido, idUsuario } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // Genera un hash del contenido del documento
    const hash = web3.utils.sha3(contenido);
    
    // Inserta el documento en la base de datos
    const result = await client.query(
      'INSERT INTO documentos (titulo, contenido, hash_ethereum, id_usuario) VALUES ($1, $2, $3, $4) RETURNING id',
      [titulo, contenido, hash, idUsuario]
    );

    // Prepara el ID del documento para la blockchain
    const documentId = web3.utils.asciiToHex(result.rows[0].id.toString());
    const accounts = await web3.eth.getAccounts();
    // Añade el documento a la blockchain
    await contract.methods.addDocument(documentId, hash).send({ from: accounts[0], gas: 1000000 });

    await client.query('COMMIT');
    res.status(201).json({ id: result.rows[0].id, hash });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Error al crear el documento' });
  } finally {
    client.release();
  }
};

/**
 * Obtiene un documento de la base de datos por su ID.
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM documentos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener el documento' });
  }
};

/**
 * Verifica la integridad de un documento comparando su hash en la base de datos y en la blockchain.
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT hash_ethereum FROM documentos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const storedHash = result.rows[0].hash_ethereum;
    const documentId = web3.utils.asciiToHex(id.toString());
    // Verifica el documento en la blockchain
    const isValid = await contract.methods.verifyDocument(documentId, storedHash).call();

    res.json({ isValid });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al verificar el documento' });
  }
};

/**
 * Actualiza un documento en la base de datos y en la blockchain.
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.updateDocument = async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const hash = web3.utils.sha3(contenido);
    
    // Actualiza el documento en la base de datos
    const result = await client.query(
      'UPDATE documentos SET titulo = $1, contenido = $2, hash_ethereum = $3 WHERE id = $4 RETURNING *',
      [titulo, contenido, hash, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const documentId = web3.utils.asciiToHex(id.toString());
    const accounts = await web3.eth.getAccounts();
    // Actualiza el documento en la blockchain
    await contract.methods.updateDocument(documentId, hash).send({ from: accounts[0], gas: 1000000 });

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Error al actualizar el documento' });
  } finally {
    client.release();
  }
};

/**
 * Elimina un documento de la base de datos.
 * Nota: No elimina el documento de la blockchain debido a su inmutabilidad.
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.deleteDocument = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Elimina el documento de la base de datos
    const result = await client.query('DELETE FROM documentos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Nota: No se elimina el documento de la blockchain

    await client.query('COMMIT');
    res.json({ message: 'Documento eliminado con éxito' });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Error al eliminar el documento' });
  } finally {
    client.release();
  }
};

module.exports = {
  initContract,
  createDocument: exports.createDocument,
  getDocument: exports.getDocument,
  verifyDocument: exports.verifyDocument,
  updateDocument: exports.updateDocument,
  deleteDocument: exports.deleteDocument
};
