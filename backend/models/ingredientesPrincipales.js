const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ingredientesPrincipales', {
    ingrediente_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Categoria: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Fecha_de_creacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'IngredientesPrincipales',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ingrediente_id" },
        ]
      },
    ]
  });
};