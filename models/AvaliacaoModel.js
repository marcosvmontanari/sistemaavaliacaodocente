// models/AvaliacaoModel.js
const db = require('../database/db');

// Cria a avaliação
exports.criarAvaliacao = (titulo, admin_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO avaliacoes (titulo, criado_por) VALUES (?, ?)';
        db.query(sql, [titulo, admin_id], (err, resultado) => {
            if (err) return reject(err);
            resolve(resultado.insertId);
        });
    });
};

// Adiciona uma questão à avaliação
exports.adicionarQuestao = (avaliacao_id, texto, tipo) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO questoes (avaliacao_id, texto, tipo) VALUES (?, ?, ?)';
        db.query(sql, [avaliacao_id, texto, tipo], (err, resultado) => {
            if (err) return reject(err);
            resolve(resultado.insertId);
        });
    });
};

// Adiciona opções a uma questão objetiva
exports.adicionarOpcoes = (questao_id, opcoes) => {
    return new Promise((resolve, reject) => {
        const valores = opcoes.map(opcao => [questao_id, opcao]);
        const sql = 'INSERT INTO opcoes_questao (questao_id, texto_opcao) VALUES ?';
        db.query(sql, [valores], (err, resultado) => {
            if (err) return reject(err);
            resolve(true);
        });
    });
};

// Listar avaliações
exports.listarAvaliacoes = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, titulo FROM avaliacoes ORDER BY data_criacao DESC';
        db.query(sql, (err, resultados) => {
            if (err) return reject(err);
            resolve(resultados);
        });
    });
};

// Alocar avaliação para múltiplas turmas
exports.alocarParaTurmas = (avaliacao_id, turmas) => {
    return new Promise((resolve, reject) => {
        const valores = turmas.map(turma => [avaliacao_id, turma]);
        const sql = 'INSERT INTO alocacoes (avaliacao_id, turma) VALUES ?';
        db.query(sql, [valores], (err, resultado) => {
            if (err) return reject(err);
            resolve(true);
        });
    });
};

// Buscar avaliações em que o docente foi avaliado e suas respostas
exports.buscarAvaliacoesRespondidas = (docente_id) => {
    return new Promise((resolve, reject) => {
        const sqlAvaliacoes = `
        SELECT id, titulo FROM avaliacoes WHERE criado_por = ?
      `;

        db.query(sqlAvaliacoes, [docente_id], async (err, avaliacoes) => {
            if (err) return reject(err);

            try {
                const resultadoFinal = [];

                for (const av of avaliacoes) {
                    const sqlQuestoes = `SELECT id, texto, tipo FROM questoes WHERE avaliacao_id = ?`;
                    const questoes = await new Promise((res, rej) => {
                        db.query(sqlQuestoes, [av.id], (e, q) => e ? rej(e) : res(q));
                    });

                    for (const q of questoes) {
                        const sqlRespostas = `
                SELECT texto_resposta, opcao_id FROM respostas WHERE questao_id = ?
              `;
                        const respostas = await new Promise((res, rej) => {
                            db.query(sqlRespostas, [q.id], (e, r) => e ? rej(e) : res(r));
                        });

                        const opcoes = (q.tipo === 'MULTIPLA_ESCOLHA' || q.tipo === 'CAIXAS_SELECAO')
                            ? await new Promise((res, rej) => {
                                db.query('SELECT id, texto_opcao FROM opcoes_questao WHERE questao_id = ?', [q.id], (e, r) => e ? rej(e) : res(r));
                            })
                            : [];

                        q.respostas = respostas;
                        q.opcoes = opcoes;
                    }

                    resultadoFinal.push({
                        id: av.id,
                        titulo: av.titulo,
                        questoes
                    });
                }

                resolve(resultadoFinal);

            } catch (erroInterno) {
                reject(erroInterno);
            }
        });
    });
};
  
  