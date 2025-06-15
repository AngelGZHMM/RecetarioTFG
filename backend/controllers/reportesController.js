// controllers/reportesController.js
const initModels = require("../models/init-models");
const sequelize = require("../config/sequelize");
const models = initModels(sequelize);
const Reporte = models.REPORTES;

class ReportesController {
  async crearReporte(req, res) {
    try {
      const { usuario_id, receta_id, motivo, descripcion } = req.body;
      
      const nuevoReporte = await Reporte.create({
        usuario_id,
        receta_id,
        motivo,
        descripcion
      });
      
      res.status(201).json({ exito: true, datos: nuevoReporte });
    } catch (error) {
      console.error('[Error en crearReporte]', error);
      res.status(500).json({ exito: false, error: 'Error interno' });
    }
  }

  // ...otros métodos (obtener reportes, eliminar, etc)
}

module.exports = new ReportesController();