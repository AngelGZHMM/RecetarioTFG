const express = require('express');
const router = express.Router();
const ingredientesPrincipalesController = require('../controllers/ingredientesPrincipalesController');
const authMiddleware = require('../middleware/auth');
const { authorization } = require('../middleware/authorization');

// Ruta para listar todos los ingredientes principales
router.get('/', authMiddleware, authorization, ingredientesPrincipalesController.listIngredientes);

// Ruta pública para listar todos los ingredientes principales disponibles
router.get('/public', ingredientesPrincipalesController.listPublicIngredientes);

// Ruta para crear un nuevo ingrediente principal
router.post('/', authMiddleware, authorization, ingredientesPrincipalesController.createIngrediente);

// Ruta para editar un ingrediente principal existente
router.put('/:id', authMiddleware, authorization, ingredientesPrincipalesController.updateIngrediente);

// Ruta para eliminar un ingrediente principal
router.delete('/:id', authMiddleware, authorization, ingredientesPrincipalesController.deleteIngrediente);

// Ruta para listar todos los ingredientes principales (activos e inactivos) para administración
router.get('/admin', authMiddleware, authorization, ingredientesPrincipalesController.listAllIngredientesAdmin);

module.exports = router;