const { ingredientesPrincipales } = require('../models/init-models')(require('../config/sequelize'));
const sequelize = require('sequelize');

// Crear un nuevo ingrediente principal
exports.createIngrediente = async (req, res) => {
  try {
    const { Nombre, Descripcion, Categoria, Estado } = req.body;
    const nuevoIngrediente = await ingredientesPrincipales.create({
      Nombre,
      Descripcion,
      Categoria,
      Estado
    });
    res.status(201).json(nuevoIngrediente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el ingrediente principal', details: error.message });
  }
};

// Editar un ingrediente principal existente
exports.updateIngrediente = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Descripcion, Categoria, Estado } = req.body;
    const ingrediente = await ingredientesPrincipales.findByPk(id);

    if (!ingrediente) {
      return res.status(404).json({ error: 'Ingrediente principal no encontrado' });
    }

    await ingrediente.update({ Nombre, Descripcion, Categoria, Estado });
    res.status(200).json(ingrediente);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el ingrediente principal', details: error.message });
  }
};

// Eliminar un ingrediente principal
exports.deleteIngrediente = async (req, res) => {
  try {
    const { id } = req.params;
    const ingrediente = await ingredientesPrincipales.findByPk(id);

    if (!ingrediente) {
      return res.status(404).json({ error: 'Ingrediente principal no encontrado' });
    }

    await ingrediente.destroy();
    res.status(200).json({ message: 'Ingrediente principal eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el ingrediente principal', details: error.message });
  }
};

// Listar todos los ingredientes principales con paginación, búsqueda y filtrado
exports.listIngredientes = async (req, res) => {
  try {
    console.log("Listando ingredientes principales...");
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await ingredientesPrincipales.findAndCountAll({
      where: {
        Nombre: {
          [sequelize.Op.like]: `%${search}%`
        }
      },
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      datos: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      mensaje: "Datos de ingredientes recuperados"
    });
  } catch (error) {
    res.status(500).json({ mensaje: `Error al listar los ingredientes: ${error.message}` });
  }
};

// Listar todos los ingredientes principales disponibles (público)
exports.listPublicIngredientes = async (req, res) => {
  try {
    console.log("Listando todos los ingredientes principales activos...");

    // Solo ingredientes activos
    const ingredientes = await ingredientesPrincipales.findAll({
      where: {
        Estado: {
          [sequelize.Op.or]: [1, true]
        }
      }
    });

    console.log("Ingredientes activos recuperados:", ingredientes);

    res.status(200).json({
      datos: ingredientes,
      mensaje: "Lista de ingredientes activos recuperada correctamente",
    });
  } catch (error) {
    console.error("Error al listar los ingredientes principales:", error);
    res.status(500).json({ mensaje: `Error al listar los ingredientes principales: ${error.message}` });
  }
};

// Listar todos los ingredientes principales (activos e inactivos) para administración
exports.listAllIngredientesAdmin = async (req, res) => {
  try {
    const ingredientes = await ingredientesPrincipales.findAll();
    res.status(200).json({
      datos: ingredientes,
      mensaje: "Lista de todos los ingredientes (admin) recuperada correctamente",
    });
  } catch (error) {
    res.status(500).json({ mensaje: `Error al listar los ingredientes para administración: ${error.message}` });
  }
};