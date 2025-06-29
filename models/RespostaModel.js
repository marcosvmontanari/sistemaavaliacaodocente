// models/RespostaModel.js
const db = require('../database/db');

// Salvar resposta (texto ou opção)
exports.salvarResposta = ({ aluno_id, avaliacao_id, questao_id, texto_resposta = null, opcao_id = null }) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO respostas (aluno_id, avaliacao_id, questao_id, texto_resposta, opcao_id)
      VALUES (?, ?, ?, ?, ?)
    `;
        db.query(sql, [aluno_id, avaliacao_id, questao_id, texto_resposta, opcao_id], (err, resultado) => {
            if (err) return reject(err);
            resolve(true);
        });
    });
};
