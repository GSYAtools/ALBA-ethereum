-- Crear el Schema authenticator
CREATE SCHEMA IF NOT EXISTS authenticator AUTHORIZATION alarcos;

-- Crear tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    direccion_ethereum VARCHAR(42) UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Documentos
CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    hash_ethereum VARCHAR(66) NOT NULL,
    id_usuario INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Permisos
CREATE TABLE permisos (
    id SERIAL PRIMARY KEY,
    id_documento INTEGER REFERENCES documentos(id),
    id_usuario INTEGER REFERENCES usuarios(id),
    tipo_permiso VARCHAR(20) CHECK (tipo_permiso IN ('lectura', 'escritura', 'admin')),
    fecha_concesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_documento, id_usuario)
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_documentos_hash ON documentos(hash_ethereum);
CREATE INDEX idx_permisos_documento ON permisos(id_documento);
CREATE INDEX idx_permisos_usuario ON permisos(id_usuario);
