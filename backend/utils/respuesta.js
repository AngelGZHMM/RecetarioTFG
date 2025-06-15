// mensaje tiene valores por defecto
module.exports = {
    success: (res, status = 200, mensaje = 'Operación realizada correctamente', datos = null) => {
      return res.status(status).json({
        success: true,
        data: datos,
        message: mensaje,
      });
    },
    error: (res, status = 500, mensaje = 'Error en la operación', datos = null) => {
      return res.status(status).json({
        success: false,
        data: datos,
        message: mensaje,
      });
    },
    // Funciones que devuelven objetos (para usar con res.json())
    exito: (datos = null, mensaje = 'Operación realizada correctamente') => {
      return {
        success: true,
        data: datos,
        message: mensaje,
      };
    },
    errorObj: (datos = null, mensaje = 'Error en la operación') => {
      return {
        success: false,
        data: datos,
        message: mensaje,
      };
    }
  };

  // Entender que son dos funciones que se exportan.
  // function exito(datos, mensaje)
  // function error(datos, mensaje)
