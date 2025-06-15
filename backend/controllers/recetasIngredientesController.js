//Importar libreria para respuestas
const Respuesta = require("../utils/respuesta");
// Recuperar función de inicialización de modelos
const initModels = require("../models/init-models.js").initModels;
// Crear la instancia de sequelize con la conexión a la base de datos
const sequelize = require("../config/sequelize.js");
// Cargar las definiciones del modelo en sequelize
const models = initModels(sequelize);
// Recuperar los modelos necesarios
const RecetasIngredientes = models.Recetas_Ingredientes;
const IngredientesPrincipales = models.ingredientesPrincipales;
const Receta = models.receta;

// Obtener todos los ingredientes de una receta específica
exports.getIngredientesByReceta = async (req, res) => {
  try {
    const receta_id = req.params.receta_id;
    
    // Verificar que la receta existe
    const recetaExiste = await Receta.findByPk(receta_id);
    if (!recetaExiste) {
      return Respuesta.error(res, 404, `No se encontró la receta con id ${receta_id}`);
    }
    
    // Buscar todos los ingredientes asociados a esta receta
    const ingredientes = await RecetasIngredientes.findAll({
      where: { receta_id },
      include: [{
        model: IngredientesPrincipales,
        as: 'ingrediente'
      }]
    });
    
    return Respuesta.success(res, 200, "Ingredientes de la receta recuperados", ingredientes);
  } catch (err) {
    console.error(`Error al recuperar ingredientes de la receta: ${err.message}`);
    console.error(err);
    return Respuesta.error(res, 500, `Error al recuperar ingredientes de la receta: ${req.originalUrl}`);
  }
};

// Añadir un ingrediente a una receta
exports.addIngredienteToReceta = async (req, res) => {
  try {
    const { receta_id, ingrediente_id, Cantidad, Unidad } = req.body;
      // Verificar permisos para la receta
    const receta = await Receta.findByPk(receta_id);
    if (!receta) {
      return Respuesta.error(res, 404, `No se encontró la receta con id ${receta_id}`);
    }
    
    // Verificar si el usuario actual es el propietario de la receta, admin o creador
    if (receta.usuario_id !== req.usuarioId && req.esAdmin !== true) {
      return Respuesta.error(res, 403, "No tienes permisos para modificar esta receta. Solo el propietario, administradores y creadores pueden modificarla.");
    }
    
    // Verificar que el ingrediente existe
    const ingredienteExiste = await IngredientesPrincipales.findByPk(ingrediente_id);
    if (!ingredienteExiste) {
      return Respuesta.error(res, 404, `No se encontró el ingrediente con id ${ingrediente_id}`);
    }
    
    // Verificar si ya existe este ingrediente en esta receta
    const ingredienteYaExiste = await RecetasIngredientes.findOne({
      where: {
        receta_id,
        ingrediente_id
      }
    });
    
    if (ingredienteYaExiste) {
      return Respuesta.error(res, 400, "Este ingrediente ya está añadido a la receta");
    }
    
    // Crear el nuevo registro
    const nuevoIngredienteReceta = await RecetasIngredientes.create({
      receta_id,
      ingrediente_id,
      Cantidad,
      Unidad
    });
    
    return Respuesta.success(res, 201, "Ingrediente añadido a la receta correctamente", nuevoIngredienteReceta);
  } catch (err) {
    console.error(`Error al añadir ingrediente a la receta: ${err.message}`);
    console.error(err);
    return Respuesta.error(res, 500, `Error al añadir ingrediente a la receta: ${req.originalUrl}`);
  }
};

// Actualizar un ingrediente de una receta
exports.updateIngredienteReceta = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad, Unidad } = req.body;
    
    // Buscar el registro
    const ingredienteReceta = await RecetasIngredientes.findByPk(id);
    
    if (!ingredienteReceta) {
      return Respuesta.error(res, 404, `No se encontró el ingrediente con id ${id} en la receta`);
    }
    
    // Verificar permisos para la receta
    const receta = await Receta.findByPk(ingredienteReceta.receta_id);
    
    // Verificar si el usuario actual es el propietario de la receta, admin o creador
    if (receta.usuario_id !== req.usuarioId && req.esAdmin !== true) {
      return Respuesta.error(res, 403, "No tienes permisos para modificar esta receta. Solo el propietario, administradores y creadores pueden modificarla.");
    }
    
    // Actualizar los datos
    await ingredienteReceta.update({
      Cantidad,
      Unidad
    });
    
    return Respuesta.success(res, 200, "Ingrediente de la receta actualizado correctamente", ingredienteReceta);
  } catch (err) {
    console.error(`Error al actualizar ingrediente de la receta: ${err.message}`);
    console.error(err);
    return Respuesta.error(res, 500, `Error al actualizar ingrediente de la receta: ${req.originalUrl}`);
  }
};

// Eliminar un ingrediente de una receta
exports.removeIngredienteFromReceta = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el registro
    const ingredienteReceta = await RecetasIngredientes.findByPk(id);
    
    if (!ingredienteReceta) {
      return Respuesta.error(res, 404, `No se encontró el ingrediente con id ${id} en la receta`);
    }
    
    // Verificar permisos para la receta
    const receta = await Receta.findByPk(ingredienteReceta.receta_id);
    
    // Verificar si el usuario actual es el propietario de la receta, admin o creador
    if (receta.usuario_id !== req.usuarioId && req.esAdmin !== true) {
      return Respuesta.error(res, 403, "No tienes permisos para modificar esta receta. Solo el propietario, administradores y creadores pueden modificarla.");
    }
    
    // Eliminar el registro
    await ingredienteReceta.destroy();
    
    return Respuesta.success(res, 200, "Ingrediente eliminado de la receta correctamente", null);
  } catch (err) {
    console.error(`Error al eliminar ingrediente de la receta: ${err.message}`);
    console.error(err);
    return Respuesta.error(res, 500, `Error al eliminar ingrediente de la receta: ${req.originalUrl}`);
  }
};