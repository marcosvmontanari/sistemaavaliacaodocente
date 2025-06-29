const bcrypt = require("bcrypt");
const UsuarioModel = require("../models/UsuarioModel");
const db = require("../database/db");

// Listar todos os usuários
exports.listar = (req, res) => {
    const sql = "SELECT id, nome, email, tipo, matricula, siape, curso, turma FROM usuarios ORDER BY nome";


    db.query(sql, (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: "Erro ao buscar usuários" });
        return res.json(resultados);
    });
};

// Cadastrar novo usuário (individual)
exports.cadastrar = async (req, res) => {
    let { nome, email, tipo, matricula, curso, turma, siape } = req.body;

    // Normalização de e-mail
    email = (email || "").trim().toLowerCase();
    const identificador = tipo === "ALUNO" ? matricula : siape;

    if (!nome || !email || !tipo || !identificador) {
        return res.status(400).json({ erro: "Preencha todos os campos obrigatórios" });
    }

    try {
        // LOG: verificando duplicidade
        console.log("[DEBUG] Verificando duplicidade de e-mail:", email);

        const existente = await UsuarioModel.buscarPorEmail(email);
        console.log("[DEBUG] Resultado da busca por e-mail:", existente);

        if (existente) {
            return res.status(400).json({ erro: "E-mail já cadastrado no sistema." });
        }

        const senhaHash = await bcrypt.hash(identificador, 10);

        const novoUsuario = {
            nome,
            email,
            senha: senhaHash,
            tipo,
            matricula: tipo === "ALUNO" ? matricula : null,
            curso: tipo === "ALUNO" ? curso : null,
            turma: tipo === "ALUNO" ? turma : null,
            siape: tipo === "DOCENTE" ? siape : null,
        };

        await UsuarioModel.inserirUsuario(novoUsuario);

        console.log("[INFO] Usuário cadastrado com sucesso:", email);
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso" });

    } catch (erro) {
        console.error("[ERRO] Falha ao cadastrar usuário:", erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ erro: "E-mail duplicado. Já existe um usuário com esse e-mail." });
        }

        return res.status(500).json({ erro: "Erro ao cadastrar usuário" });
    }
};

// Editar dados do usuário
exports.editar = (req, res) => {
    const id = req.params.id;
    const { nome, email, tipo } = req.body;

    const sql = "UPDATE usuarios SET nome = ?, email = ?, tipo = ? WHERE id = ?";
    db.query(sql, [nome, email.trim().toLowerCase(), tipo, id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: "Erro ao editar usuário" });
        res.json({ mensagem: "Usuário atualizado com sucesso" });
    });
};

// Excluir usuário
exports.excluir = (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM usuarios WHERE id = ?";
    db.query(sql, [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: "Erro ao excluir usuário" });
        res.json({ mensagem: "Usuário excluído com sucesso" });
    });
};

// Redefinir senha para identificador (matrícula ou SIAPE)
exports.redefinirSenha = async (req, res) => {
    const id = req.params.id;

    const sqlBusca = "SELECT tipo, matricula, siape FROM usuarios WHERE id = ?";
    db.query(sqlBusca, [id], async (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: "Erro ao buscar usuário" });

        if (resultado.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const usuario = resultado[0];
        const identificador = usuario.tipo === "ALUNO" ? usuario.matricula : usuario.siape;

        try {
            const novaSenha = await bcrypt.hash(identificador, 10);

            const sqlUpdate = `
                UPDATE usuarios SET senha = ?, precisa_trocar_senha = 1 WHERE id = ?
            `;
            db.query(sqlUpdate, [novaSenha, id], (erro2) => {
                if (erro2) return res.status(500).json({ erro: "Erro ao redefinir senha" });
                res.json({ mensagem: "Senha redefinida com sucesso" });
            });
        } catch {
            res.status(500).json({ erro: "Erro ao criptografar senha" });
        }
    });
};

// Importação em lote (via CSV)
exports.importarLote = async (req, res) => {
    const lista = req.body.usuarios;
    if (!Array.isArray(lista)) {
        return res.status(400).json({ erro: "Lista de usuários inválida" });
    }

    let sucesso = 0;
    let erros = 0;
    let duplicados = 0;

    for (const usuario of lista) {
        try {
            usuario.email = (usuario.email || "").trim().toLowerCase();
            const identificador = usuario.tipo === "ALUNO" ? usuario.matricula : usuario.siape;

            if (!usuario.nome || !usuario.email || !usuario.tipo || !identificador) {
                erros++;
                continue;
            }

            const jaExiste = await UsuarioModel.buscarPorEmail(usuario.email);
            if (jaExiste) {
                duplicados++;
                continue;
            }

            const hash = await bcrypt.hash(identificador, 10);

            const novo = {
                nome: usuario.nome,
                email: usuario.email,
                senha: hash,
                tipo: usuario.tipo,
                matricula: usuario.tipo === "ALUNO" ? usuario.matricula : null,
                curso: usuario.tipo === "ALUNO" ? usuario.curso || "-" : null,
                turma: usuario.tipo === "ALUNO" ? usuario.turma || "-" : null,
                siape: usuario.tipo === "DOCENTE" ? usuario.siape : null,
            };

            await UsuarioModel.inserirUsuario(novo);
            sucesso++;
        } catch (erro) {
            console.error("Erro ao importar usuário:", erro);
            erros++;
        }
    }

    res.json({ mensagem: "Importação finalizada", sucesso, erros, duplicados });
};
