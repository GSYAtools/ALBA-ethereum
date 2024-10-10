-- Crear el Schema authenticator
CREATE SCHEMA IF NOT EXISTS authenticator AUTHORIZATION alarcos;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ethereum_address VARCHAR(42) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    propietario_id INTEGER REFERENCES users(id),
    hash_blockchain VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_sharing (
    document_id INTEGER REFERENCES documents(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (document_id, user_id)
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_documentos_hash ON documentos(hash_ethereum);
CREATE INDEX idx_permisos_documento ON permisos(id_documento);
CREATE INDEX idx_permisos_usuario ON permisos(id_usuario);
