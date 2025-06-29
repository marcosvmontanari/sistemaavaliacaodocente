// controllers/alunoController.js
const db = require('../database/db');
const RespostaModel = require('../models/RespostaModel');

// Listar avaliações alocadas para a turma
exports.listarAvaliacoesPorTurma = (req, res) => {
    const { turma } = req.params;

    const sql = `
    SELECT DISTINCT a.id, a.titulo 
    FROM avaliacoes a
    JOIN alocacoes al ON al.avaliacao_id = a.id
    WHERE al.turma = ?
  `;

    db.query(sql, [turma], (err, resultados) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar avaliações.' });
        res.status(200).json(resultados);
    });
};

// Carregar as questões e opções de uma avaliação
exports.carregarAvaliacao = (req, res) => {
    const { id } = req.params;

    const sqlQuestoes = `SELECT id, texto, tipo FROM questoes WHERE avaliacao_id = ?`;
    const sqlOpcoes = `SELECT id, questao_id, texto_opcao FROM opcoes_questao WHERE questao_id IN (?)`;

    db.query(sqlQuestoes, [id], (err, questoes) => {
        if (err) return res.status(500).json({ erro: 'Erro ao carregar questões.' });

        const idsQuestoes = questoes.map(q => q.id);
        if (idsQuestoes.length === 0) return res.status(200).json({ questoes: [] });

        db.query(sqlOpcoes, [idsQuestoes], (err2, opcoes) => {
            if (err2) return res.status(500).json({ erro: 'Erro ao carregar opções.' });

            const questoesCompletas = questoes.map(q => ({
                ...q,
                opcoes: opcoes.filter(o => o.questao_id === q.id)
            }));

            res.status(200).json({ questoes: questoesCompletas });
        });
    });
};

// Enviar as respostas do aluno
exports.enviarRespostas = async (req, res) => {
    const { aluno_id, avaliacao_id, respostas } = req.body;

    if (!aluno_id || !avaliacao_id || !Array.isArray(respostas)) {
        return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    try {
        for (const r of respostas) {
            if (r.opcao_ids && r.opcao_ids.length > 0) {
                for (let id of r.opcao_ids) {
                    await RespostaModel.salvarResposta({
                        aluno_id,
                        avaliacao_id,
                        questao_id: r.questao_id,
                        opcao_id: id
                    });
                }
            } else {
                await RespostaModel.salvarResposta({
                    aluno_id,
                    avaliacao_id,
                    questao_id: r.questao_id,
                    texto_resposta: r.texto_resposta
                });
            }
        }

        res.status(201).json({ mensagem: 'Respostas enviadas com sucesso.' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao salvar respostas.' });
    }
};
