const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    contenido: { type: String, required: true },
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    compartidoCon: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hashBlockchain: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
