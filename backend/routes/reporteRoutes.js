// routes/reporteRoutes.js
const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.post('/reportes', reportesController.crearReporte);
// router.get('/reportes', reportesController.obtenerReportes); // Obtener todos los reportes
// router.get('/reportes/:id', reportesController.obtenerReportePorId); // Obtener un reporte por ID
// router.delete('/reportes/:id', reportesController.eliminarReporte); // Eliminar un reporte por ID
// router.put('/reportes/:id', reportesController.actualizarReporte); // Actualizar un reporte por ID


module.exports = router;