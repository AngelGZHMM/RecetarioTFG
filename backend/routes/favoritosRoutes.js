// routes/favoritosRoutes.js
const express = require('express');
const router = express.Router();
const favoritosController = require('../controllers/favoritosController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener favoritos del usuario autenticado
router.get('/', favoritosController.obtenerFavoritos);

// Verificar si una receta específica es favorita del usuario
router.get('/verificar/:receta_id', favoritosController.verificarFavorito);

// Obtener estadísticas de favoritos de una receta específica
router.get('/estadisticas/:receta_id', favoritosController.obtenerEstadisticasFavoritos);

// Agregar receta a favoritos
router.post('/:receta_id', favoritosController.agregarFavorito);

// Quitar receta de favoritos
router.delete('/:receta_id', favoritosController.quitarFavorito);

// Alternar estado de favorito (agregar/quitar en una sola operación)
router.patch('/alternar/:receta_id', favoritosController.alternarFavorito);

module.exports = router;
