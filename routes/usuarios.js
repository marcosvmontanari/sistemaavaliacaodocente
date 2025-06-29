const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");

// Listar todos os usuários
router.get("/", UsuarioController.listar);

// Cadastrar novo usuário
router.post("/", UsuarioController.cadastrar);

// Atualizar (editar) usuário
router.put("/:id", UsuarioController.editar);

// Excluir usuário
router.delete("/:id", UsuarioController.excluir);

// Redefinir senha (volta para matrícula ou SIAPE)
router.put("/:id/redefinir-senha", UsuarioController.redefinirSenha);
// Cadastro em lote via CSV
router.post("/lote", UsuarioController.importarLote);


module.exports = router;
