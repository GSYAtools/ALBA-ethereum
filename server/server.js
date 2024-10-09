const express = require('express');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
app.use(express.json());

app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
