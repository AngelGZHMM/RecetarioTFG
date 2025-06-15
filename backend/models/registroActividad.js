module.exports = (sequelize, DataTypes) => {
  return sequelize.define('registro_actividad', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    fecha_evento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    tipo_evento: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    dispositivo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    navegador: {
      type: DataTypes.TEXT, // Permite strings muy largos
      allowNull: true
    },
    duracion_sesion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    receta_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detalle_extra: {
      type: DataTypes.JSON,
      allowNull: true
    },
    exito: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'registro_actividad',
    timestamps: false
  });
};