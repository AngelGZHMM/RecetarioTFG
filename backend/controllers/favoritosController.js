// controllers/favoritosController.js
const sequelize = require('../config/sequelize');
const { Op } = require('sequelize');
const initModels = require('../models/init-models');
const models = initModels(sequelize);
const Usuario = models.usuario;
const Receta = models.receta;
const Favoritos = models.favoritos;
const Respuesta = require('../utils/respuesta');

class FavoritosController {
  // Agregar receta a favoritos
  async agregarFavorito(req, res) {
    try {
      const { receta_id } = req.params;
      const usuario_id = req.usuario.usuario_id;

      // Verificar si la receta existe
      const receta = await Receta.findByPk(receta_id);
      if (!receta) {
        return res.status(404).json(
          Respuesta.errorObj('Receta no encontrada')
        );
      }

      // Verificar si ya existe el favorito
      const favoritoExistente = await Favoritos.findOne({
        where: {
          receta_id: receta_id,
          usuario_id: usuario_id
        }
      });

      if (favoritoExistente) {
        return res.status(409).json(
          Respuesta.errorObj('La receta ya está en favoritos')
        );
      }

      // Crear el nuevo favorito
      const nuevoFavorito = await Favoritos.create({
        receta_id: receta_id,
        usuario_id: usuario_id,
        fecha_favorito: new Date()
      });

      res.status(201).json(
        Respuesta.exito(nuevoFavorito, 'Receta agregada a favoritos')
      );

    } catch (error) {
      console.error('Error al agregar favorito:', error);
      res.status(500).json(
        Respuesta.errorObj('Error interno del servidor')
      );
    }
  }

  // Quitar receta de favoritos
  async quitarFavorito(req, res) {
    try {
      const { receta_id } = req.params;
      const usuario_id = req.usuario.usuario_id;

      // Buscar y eliminar el favorito
      const favoritoEliminado = await Favoritos.destroy({
        where: {
          receta_id: receta_id,
          usuario_id: usuario_id
        }
      });

      if (favoritoEliminado === 0) {
        return res.status(404).json(
          Respuesta.errorObj('Favorito no encontrado')
        );
      }

      res.status(200).json(
        Respuesta.exito(null, 'Receta eliminada de favoritos')
      );

    } catch (error) {
      console.error('Error al quitar favorito:', error);
      res.status(500).json(
        Respuesta.errorObj('Error interno del servidor')
      );
    }
  }
  // Obtener favoritos del usuario con filtros avanzados
  async obtenerFavoritos(req, res) {
    try {
      const usuario_id = req.usuario.usuario_id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Filtros
      const filterCriteria = req.query.filterCriteria;
      let searchQuery = req.query.searchQuery;
      const fechaDesde = req.query.fechaDesde;
      const fechaHasta = req.query.fechaHasta;
      const ingredientesParam = req.query.ingredientes;

      // Trim searchQuery if it's a string
      if (typeof searchQuery === 'string') {
        searchQuery = searchQuery.trim();
      }

      // If filterCriteria is set but searchQuery is empty (except for fecha_creacion/fecha_publicacion/ingrediente), return empty result
      if (filterCriteria && (!searchQuery || searchQuery === '') && !['fecha_creacion','fecha_publicacion','ingrediente'].includes(filterCriteria)) {
        return res.status(200).json(
          Respuesta.exito({
            favoritos: [],
            paginacion: {
              currentPage: page,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: limit
            }
          }, 'Favoritos obtenidos correctamente')
        );
      }

      // Construir where dinámico para Receta
      let recetaWhere = {};
      if (filterCriteria && searchQuery) {
        switch (filterCriteria) {
          case 'nombre':
            recetaWhere.nombre = { [Op.like]: `%${searchQuery}%` };
            break;
          case 'categoria':
            recetaWhere.categoria = searchQuery;
            break;
          case 'dificultad':
            recetaWhere.dificultad = searchQuery;
            break;
          case 'origen':
            recetaWhere.origen = { [Op.like]: `%${searchQuery}%` };
            break;
        }
      }
      if (filterCriteria === 'fecha_creacion' && (fechaDesde || fechaHasta)) {
        recetaWhere.fecha_creacion = {};
        if (fechaDesde) recetaWhere.fecha_creacion[Op.gte] = fechaDesde;
        if (fechaHasta) recetaWhere.fecha_creacion[Op.lte] = fechaHasta;
      }
      if (filterCriteria === 'fecha_publicacion' && (fechaDesde || fechaHasta)) {
        recetaWhere.fecha_publicacion = {};
        if (fechaDesde) recetaWhere.fecha_publicacion[Op.gte] = fechaDesde;
        if (fechaHasta) recetaWhere.fecha_publicacion[Op.lte] = fechaHasta;
      }

      // Multi-ingredientes: aceptar lista de IDs
      let ingredientesArray = [];
      if (ingredientesParam) {
        if (typeof ingredientesParam === 'string') {
          ingredientesArray = ingredientesParam.split(',').map(x => x.trim()).filter(x => x);
        } else if (Array.isArray(ingredientesParam)) {
          ingredientesArray = ingredientesParam;
        }
      }

      // Construir include para ingredientes solo si hay filtro
      let recetaInclude = [];
      let useDistinct = false;
      if (ingredientesArray.length > 0) {
        recetaInclude.push({
          model: models.Recetas_Ingredientes,
          as: 'Recetas_Ingredientes',
          required: true,
          where: { ingrediente_id: { [Op.in]: ingredientesArray.map(Number) } }
        });
        useDistinct = true;
      }
      recetaInclude.push({
        model: Usuario,
        as: 'usuario',
        attributes: ['usuario_id', 'Nombre_de_usuario', 'Foto_de_perfil']
      });      // Debug logging
      console.log('=== DEBUG FAVORITOS QUERY ===');
      console.log('FilterCriteria:', filterCriteria);
      console.log('SearchQuery:', searchQuery);
      console.log('RecetaWhere:', recetaWhere);
      console.log('RecetaInclude:', JSON.stringify(recetaInclude, null, 2));
      console.log('UseDistinct:', useDistinct);
      
      // Consulta
      const favoritos = await Favoritos.findAndCountAll({
        where: { usuario_id },
        include: [{
          model: Receta,
          as: 'receta',
          where: Object.keys(recetaWhere).length > 0 ? recetaWhere : undefined,
          required: Object.keys(recetaWhere).length > 0, // Solo incluir favoritos con receta que cumple el filtro
          attributes: [
            'receta_id', 'nombre', 'descripcion', 'tiempo_preparacion',
            'tiempo_coccion', // <-- Añadido
            'tiempo_total',   // <-- Añadido
            'dificultad', 'porciones', 'imagen', 'categoria', 'usuario_id',
            'fecha_creacion', 'fecha_publicacion', 'origen'
          ],
          include: recetaInclude,
          ...(useDistinct ? { required: true } : {})
        }],
        order: [['fecha_favorito', 'DESC']],
        limit,
        offset,
        ...(useDistinct ? { distinct: true } : {}),
        logging: console.log // Añadir logging de Sequelize
      });
      
      console.log('Favoritos encontrados:', favoritos.count);
      console.log('=== END DEBUG ===');

      const totalPages = Math.ceil(favoritos.count / limit);
      const resultado = {
        favoritos: favoritos.rows,
        paginacion: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: favoritos.count,
          itemsPerPage: limit
        }
      };
      res.status(200).json(
        Respuesta.exito(resultado, 'Favoritos obtenidos correctamente')
      );
    } catch (error) {
      res.status(500).json(
        Respuesta.errorObj('Error interno del servidor')
      );
    }
  }

  // Verificar si una receta es favorita del usuario
  async verificarFavorito(req, res) {
    try {
      const { receta_id } = req.params;
      const usuario_id = req.usuario.usuario_id;

      const favorito = await Favoritos.findOne({
        where: {
          receta_id: receta_id,
          usuario_id: usuario_id
        }
      });

      const esFavorito = favorito !== null;

      res.status(200).json(
        Respuesta.exito(
          { esFavorito, fecha_favorito: favorito?.fecha_favorito },
          'Estado de favorito verificado'
        )
      );
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      res.status(500).json(
        Respuesta.errorObj('Error interno del servidor')
      );
    }
  }

  // Obtener estadísticas de favoritos de una receta
  async obtenerEstadisticasFavoritos(req, res) {
    try {
      const { receta_id } = req.params;

      // Verificar si la receta existe
      const receta = await Receta.findByPk(receta_id);
      if (!receta) {
        return res.status(404).json(
          Respuesta.errorObj('Receta no encontrada')
        );
      }

      // Contar total de favoritos para esta receta
      const totalFavoritos = await Favoritos.count({
        where: { receta_id }
      });

      res.status(200).json(
        Respuesta.exito(
          { receta_id, totalFavoritos },
          'Estadísticas de favoritos obtenidas'
        )
      );

    } catch (error) {
      console.error('Error al obtener estadísticas de favoritos:', error);
      res.status(500).json(
        Respuesta.errorObj('Error interno del servidor')
      );
    }
  }

  // Alternar estado de favorito (agregar/quitar)
  async alternarFavorito(req, res) {
    try {
      const { receta_id } = req.params;
      const usuario_id = req.usuario.usuario_id;

      // Verificar si la receta existe
      const receta = await Receta.findByPk(receta_id);
      if (!receta) {
        return res.status(404).json(
          Respuesta.errorObj('Receta no encontrada')
        );
      }

      // Buscar si ya existe el favorito
      const favoritoExistente = await Favoritos.findOne({
        where: {
          receta_id: receta_id,
          usuario_id: usuario_id
        }
      });

      if (favoritoExistente) {
        // Si existe, eliminarlo
        await Favoritos.destroy({
          where: {
            receta_id: receta_id,
            usuario_id: usuario_id
          }
        });

        res.status(200).json(
          Respuesta.exito(
            { accion: 'eliminado', esFavorito: false },
            'Receta eliminada de favoritos'
          )
        );
      } else {
        // Si no existe, crearlo
        const nuevoFavorito = await Favoritos.create({
          receta_id: receta_id,
          usuario_id: usuario_id,
          fecha_favorito: new Date()
        });

        res.status(201).json(
          Respuesta.exito(
            { accion: 'agregado', esFavorito: true, favorito: nuevoFavorito },
            'Receta agregada a favoritos'
          )
        );
      }

    } catch (error) {
      console.error('Error al alternar favorito:', error);
      res.status(500).json(
        Respuesta.errorObj('Error interno del servidor')
      );
    }
  }
}

module.exports = new FavoritosController();
