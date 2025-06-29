// database/db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Carrega variáveis do .env
dotenv.config();

// Cria e exporta a conexão com o banco
const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = conexao;
