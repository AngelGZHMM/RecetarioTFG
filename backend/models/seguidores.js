// models/seguidores.js
module.exports = function(sequelize, DataTypes) {
  const Seguidores = sequelize.define('Seguidores', {
    usuario_seguidor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'usuario_id'
      }
    },
    usuario_seguido_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'usuario_id'
      }
    },
    fecha_seguimiento: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Seguidores',
    timestamps: false
  });

  Seguidores.associate = function(models) {
    // Relaciones con la tabla usuarios
    Seguidores.belongsTo(models.usuario, {
      foreignKey: 'usuario_seguidor_id',
      as: 'seguidor'
    });
    
    Seguidores.belongsTo(models.usuario, {
      foreignKey: 'usuario_seguido_id',
      as: 'seguido'
    });
  };

  return Seguidores;
};