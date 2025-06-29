// controllers/docenteController.js
const AvaliacaoModel = require('../models/AvaliacaoModel');

exports.verResultados = async (req, res) => {
    const docente_id = req.params.id;

    try {
        const avaliacoes = await AvaliacaoModel.buscarAvaliacoesRespondidas(docente_id);
        res.status(200).json(avaliacoes);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar resultados.' });
    }
};
