// criarAdmin.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conexão com o banco
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Dados do admin
const nome = 'Administrador';
const email = 'admin@ifnmg.edu.br';
const senhaPlano = 'admin123';
const tipo = 'ADMIN';

async function criarAdmin() {
    try {
        const hash = await bcrypt.hash(senhaPlano, 10);

        const sqlDelete = 'DELETE FROM usuarios WHERE email = ?';
        const sqlInsert = `
      INSERT INTO usuarios (nome, email, senha, tipo, precisa_trocar_senha)
      VALUES (?, ?, ?, ?, true)
    `;

        db.query(sqlDelete, [email], (err) => {
            if (err) throw err;

            db.query(sqlInsert, [nome, email, hash, tipo], (err2, resultado) => {
                if (err2) throw err2;

                console.log('✅ Usuário ADMIN criado com sucesso!');
                console.log(`E-mail: ${email}`);
                console.log(`Senha:  ${senhaPlano}`);
                db.end();
            });
        });
    } catch (erro) {
        console.error('Erro ao criar admin:', erro);
        db.end();
    }
}

criarAdmin();
