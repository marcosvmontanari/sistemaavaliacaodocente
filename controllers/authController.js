// controllers/authController.js
const bcrypt = require('bcryptjs');
const db = require('../database/db'); // Conexão com o banco
const UsuarioModel = require('../models/UsuarioModel');

// Login do usuário
exports.login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // Buscar o usuário pelo e-mail
        const usuario = await UsuarioModel.buscarPorEmail(email);
        if (!usuario) {
            return res.status(401).json({ erro: 'E-mail não encontrado.' });
        }

        // Verificar senha com bcrypt
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Senha incorreta.' });
        }

        // Remover a senha do retorno
        delete usuario.senha;

        return res.status(200).json({ usuario });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro interno no login.' });
    }
};

// Troca de senha
exports.trocarSenha = async (req, res) => {
    const { id, novaSenha } = req.body;

    if (!id || !novaSenha) {
        return res.status(400).json({ erro: 'Dados incompletos para trocar a senha.' });
    }

    try {
        const hash = await bcrypt.hash(novaSenha, 10);
        const atualizado = await UsuarioModel.atualizarSenha(id, hash);

        if (atualizado) {
            return res.status(200).json({ mensagem: 'Senha atualizada com sucesso.' });
        } else {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao trocar a senha.' });
    }
};
