const express = require('express');
const router = express.Router();
const registroActividadController = require('../controllers/registroActividadController');

// Obtener todos los registros de actividad
router.get('/', registroActividadController.obtenerRegistros);

// Obtener estadísticas de login
router.get('/estadisticas-login', registroActividadController.estadisticasLogin);

module.exports = router;
