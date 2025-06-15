var DataTypes = require("sequelize").DataTypes;
var _pasos = require("./pasos");
var _receta = require("./receta");
var _usuario = require("./user"); // Nombre del archivo debe coincidir
var _seguidores = require("./seguidores"); // Importar explícitamente el modelo de seguidores
var _favoritos = require("./favoritos"); // Importar el modelo de favoritos
var _ingredientesPrincipales = require("./ingredientesPrincipales");
var _recetasIngredientes = require("./recetasIngredientes");

function initModels(sequelize) {
  const usuario = _usuario(sequelize, DataTypes);
  var pasos = _pasos(sequelize, DataTypes);
  var receta = _receta(sequelize, DataTypes);
  var seguidores = _seguidores(sequelize, DataTypes); // Inicializar el modelo de seguidores
  var favoritos = _favoritos(sequelize, DataTypes); // Inicializar el modelo de favoritos
  var ingredientesPrincipales = _ingredientesPrincipales(sequelize, DataTypes);
  var Recetas_Ingredientes = _recetasIngredientes(sequelize, DataTypes);

  // Establecer las relaciones para el modelo de favoritos
  favoritos.belongsTo(usuario, { 
    foreignKey: 'usuario_id', 
    as: 'usuario' 
  });
  
  favoritos.belongsTo(receta, { 
    foreignKey: 'receta_id', 
    as: 'receta' 
  });
  
  usuario.hasMany(favoritos, { 
    foreignKey: 'usuario_id', 
    as: 'favoritos' 
  });
  
  receta.hasMany(favoritos, { 
    foreignKey: 'receta_id', 
    as: 'favoritos' 
  });

  // Establecer las relaciones para el modelo de seguidores
  seguidores.belongsTo(usuario, { 
    foreignKey: 'usuario_seguidor_id', 
    as: 'seguidor' 
  });
  
  seguidores.belongsTo(usuario, { 
    foreignKey: 'usuario_seguido_id', 
    as: 'seguido' 
  });
  
  usuario.hasMany(seguidores, { 
    foreignKey: 'usuario_seguidor_id', 
    as: 'siguiendo' 
  });
  
  usuario.hasMany(seguidores, { 
    foreignKey: 'usuario_seguido_id', 
    as: 'seguidores' 
  });

  // Relaciones existentes
  pasos.belongsTo(receta, { as: "receta_RECETum", foreignKey: "receta_id"});
  receta.hasMany(pasos, { as: "PASOs", foreignKey: "receta_id"});
  
  // Relación Usuario-Receta
  receta.belongsTo(usuario, { 
    foreignKey: 'usuario_id', 
    as: 'usuario' 
  });
  usuario.hasMany(receta, { 
    foreignKey: 'usuario_id', 
    as: 'recetas' 
  });
  
  // Definir las relaciones para la tabla intermedia
  Recetas_Ingredientes.belongsTo(receta, { foreignKey: "receta_id" });
  Recetas_Ingredientes.belongsTo(ingredientesPrincipales, { foreignKey: "ingrediente_id", as: 'ingrediente' });
  receta.hasMany(Recetas_Ingredientes, { foreignKey: "receta_id" });
  ingredientesPrincipales.hasMany(Recetas_Ingredientes, { foreignKey: "ingrediente_id" });

  return {
    usuario,
    pasos,
    receta,
    seguidores, // Incluir seguidores en el objeto retornado
    favoritos, // Incluir favoritos en el objeto retornado
    ingredientesPrincipales,
    Recetas_Ingredientes
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
