// models/favoritos.js
module.exports = function(sequelize, DataTypes) {
  const Favoritos = sequelize.define('Favoritos', {
    receta_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'RECETA',
        key: 'receta_id'
      }
    },
    usuario_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'usuario_id'
      }
    },
    fecha_favorito: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true
    }
  }, {
    tableName: 'favoritos',
    timestamps: false
  });

  Favoritos.associate = function(models) {
    // Relación con la tabla RECETA
    Favoritos.belongsTo(models.receta, {
      foreignKey: 'receta_id',
      as: 'receta'
    });
    
    // Relación con la tabla usuarios
    Favoritos.belongsTo(models.usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  };

  return Favoritos;
};
