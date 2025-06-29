// server.js
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const alunoRoutes = require('./routes/aluno');
const docenteRoutes = require('./routes/docente');
const usuarioRoutes = require('./routes/usuarios');


// Carregar variáveis do .env
dotenv.config();

// Criar instância do express
const app = express();

// Middleware para JSON e CORS
app.use(cors());
app.use(express.json());
app.use('/aluno', alunoRoutes);
app.use('/docente', docenteRoutes);
app.use('/usuarios', usuarioRoutes);



// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Importar e usar rotas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Conexão com o banco (testar ao iniciar)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados MySQL');
    }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
