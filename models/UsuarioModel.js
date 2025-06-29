const db = require('../database/db');

// Buscar usuário pelo e-mail (com normalização)
exports.buscarPorEmail = (email) => {
    return new Promise((resolve, reject) => {
        const emailNormalizado = email.trim().toLowerCase();

        const sql = 'SELECT * FROM usuarios WHERE email = ? LIMIT 1';
        db.query(sql, [emailNormalizado], (erro, resultados) => {
            if (erro) return reject(erro);
            if (resultados.length === 0) return resolve(null);
            return resolve(resultados[0]);
        });
    });
};

// Atualizar a senha do usuário e marcar como "senha trocada"
exports.atualizarSenha = (id, novaHash) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE usuarios 
            SET senha = ?, precisa_trocar_senha = false 
            WHERE id = ?
        `;
        db.query(sql, [novaHash, id], (erro, resultado) => {
            if (erro) return reject(erro);
            return resolve(resultado.affectedRows > 0);
        });
    });
};

// Inserir novo usuário (aluno, docente ou admin)
exports.inserirUsuario = (usuario) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO usuarios (nome, email, senha, tipo, matricula, curso, turma, siape)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const valores = [
            usuario.nome,
            usuario.email.trim().toLowerCase(), // normalização aplicada no momento da inserção
            usuario.senha,
            usuario.tipo,
            usuario.matricula,
            usuario.curso,
            usuario.turma,
            usuario.siape
        ];

        db.query(sql, valores, (erro, resultado) => {
            if (erro) return reject(erro);
            return resolve(resultado.insertId);
        });
    });
};
