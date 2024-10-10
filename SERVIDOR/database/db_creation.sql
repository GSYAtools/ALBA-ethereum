CREATE DATABASE alba_ethereum;

CREATE USER alarcos WITH PASSWORD 'alarcos';
GRANT ALL PRIVILEGES ON DATABASE alba_ethereum TO alarcos;
GRANT USAGE, CREATE ON SCHEMA public TO alarcos;
