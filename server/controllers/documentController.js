const pool = require('../config/database');
const Web3 = require('web3');
const DocumentManagement = require('../../build/contracts/DocumentManagement.json');

const web3 = new Web3(process.env.ETHEREUM_NODE_URL);
const contract = new web3.eth.Contract(DocumentManagement.abi, process.env.CONTRACT_ADDRESS);

exports.createDocument = async (req, res) => {
  const { titulo, contenido, idUsuario } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const hash = web3.utils.sha3(contenido);
    
    const result = await client.query(
      'INSERT INTO documentos (titulo, contenido, hash_ethereum, id_usuario) VALUES ($1, $2, $3, $4) RETURNING id',
      [titulo, contenido, hash, idUsuario]
    );

    // Interactuar con el smart contract
    const accounts = await web3.eth.getAccounts();
    await contract.methods.addDocument(web3.utils.asciiToHex(result.rows[0].id.toString()), hash)
      .send({ from: accounts[0] });

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

exports.updateDocument = async (req, res) => {
  // Implementar lógica de actualización
};

exports.deleteDocument = async (req, res) => {
  // Implementar lógica de eliminación
};
