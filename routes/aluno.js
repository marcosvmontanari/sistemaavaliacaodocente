// routes/aluno.js
const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

// Listar avaliações disponíveis por turma
router.get('/avaliacoes/:turma', alunoController.listarAvaliacoesPorTurma);

// Carregar avaliação com questões e opções
router.get('/avaliacao/:id', alunoController.carregarAvaliacao);

// Enviar respostas do aluno
router.post('/enviar-respostas', alunoController.enviarRespostas);

module.exports = router;
