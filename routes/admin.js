// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rota para cadastrar usuários (aluno ou docente)
router.post('/cadastrar-usuario', adminController.cadastrarUsuario);
router.post('/criar-avaliacao', adminController.criarAvaliacao);

module.exports = router;
