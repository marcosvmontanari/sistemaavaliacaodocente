// routes/docente.js
const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');

// Ver resultados de avaliações para um docente
router.get('/resultados/:id', docenteController.verResultados);

module.exports = router;
