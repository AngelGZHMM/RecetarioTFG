// models/reportes.js (generado automáticamente por sequelize-auto)
// (El nombre del modelo debe coincidir con la tabla en la BDD)
module.exports = (sequelize, DataTypes) => {
    const Reportes = sequelize.define(
      'REPORTES', 
      {
        report_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        usuario_id: DataTypes.BIGINT.UNSIGNED,
        receta_id: DataTypes.INTEGER,
        motivo: DataTypes.STRING(255),
        descripcion: DataTypes.TEXT,
      },
      {
        timestamps: false,
        tableName: 'REPORTES', // Forzar nombre de tabla en mayúsculas
      }
    );
    return Reportes;
  };