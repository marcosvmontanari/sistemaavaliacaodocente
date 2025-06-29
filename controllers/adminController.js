// controllers/adminController.js
const bcrypt = require('bcryptjs');
const UsuarioModel = require('../models/UsuarioModel');
const AvaliacaoModel = require('../models/AvaliacaoModel');

// Cadastrar novo usuário (aluno ou docente)
exports.cadastrarUsuario = async (req, res) => {
    const {
        tipo,
        nome,
        email,
        matricula,
        curso,
        turma,
        siape
    } = req.body;

    if (!tipo || !nome || !email) {
        return res.status(400).json({ erro: 'Campos obrigatórios não informados.' });
    }

    try {
        // Definir senha inicial
        let senhaInicial;
        if (tipo === 'ALUNO') {
            if (!matricula || !curso || !turma) {
                return res.status(400).json({ erro: 'Dados incompletos para aluno.' });
            }
            senhaInicial = matricula;
        } else if (tipo === 'DOCENTE') {
            if (!siape) {
                return res.status(400).json({ erro: 'SIAPE obrigatório para docente.' });
            }
            senhaInicial = siape;
        } else {
            return res.status(400).json({ erro: 'Tipo de usuário inválido.' });
        }

        // Criptografar a senha inicial
        const hash = await bcrypt.hash(senhaInicial, 10);

        // Montar objeto de usuário
        const novoUsuario = {
            tipo,
            nome,
            email,
            senha: hash,
            matricula: matricula || null,
            curso: curso || null,
            turma: turma || null,
            siape: siape || null
        };

        // Salvar no banco de dados
        const id = await UsuarioModel.inserirUsuario(novoUsuario);
        return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', id });

    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erro: 'E-mail já cadastrado.' });
        }
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }
};

exports.criarAvaliacao = async (req, res) => {
    const { titulo, questoes } = req.body;

    if (!titulo || !Array.isArray(questoes) || questoes.length === 0) {
        return res.status(400).json({ erro: 'Título e pelo menos uma questão são obrigatórios.' });
    }

    try {
        const usuario = req.session?.usuario || JSON.parse(req.headers['usuario'] || '{}'); // compatível com sessionStorage
        const admin_id = usuario?.id;

        if (!admin_id) return res.status(403).json({ erro: 'Usuário não autenticado.' });

        const avaliacao_id = await AvaliacaoModel.criarAvaliacao(titulo, admin_id);

        for (const q of questoes) {
            const questao_id = await AvaliacaoModel.adicionarQuestao(avaliacao_id, q.texto, q.tipo);

            if ((q.tipo === 'MULTIPLA_ESCOLHA' || q.tipo === 'CAIXAS_SELECAO') && q.opcoes.length > 0) {
                await AvaliacaoModel.adicionarOpcoes(questao_id, q.opcoes);
            }
        }

        res.status(201).json({ mensagem: 'Avaliação criada com sucesso.', id: avaliacao_id });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao criar avaliação.' });
    }
};
  
// Listar avaliações criadas
exports.listarAvaliacoes = async (req, res) => {
    try {
        const avaliacoes = await AvaliacaoModel.listarAvaliacoes();
        res.status(200).json(avaliacoes);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao listar avaliações.' });
    }
};

// Alocar uma avaliação para turmas
exports.alocarAvaliacao = async (req, res) => {
    const { avaliacao_id, turmas } = req.body;

    if (!avaliacao_id || !Array.isArray(turmas) || turmas.length === 0) {
        return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    try {
        await AvaliacaoModel.alocarParaTurmas(avaliacao_id, turmas);
        res.status(200).json({ mensagem: 'Alocação realizada com sucesso.' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao alocar avaliação.' });
    }
};
  
