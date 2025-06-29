// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login
router.post('/login', authController.login);

// Rota de troca de senha
router.post('/trocar-senha', authController.trocarSenha);

module.exports = router;
