require('dotenv').config();

const express = require('express');
const documentRoutes = require('./routes/documentRoutes');
const { initContract } = require('./controllers/documentController');

const app = express();
app.use(express.json());

app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initContract();
  app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
}

startServer();
