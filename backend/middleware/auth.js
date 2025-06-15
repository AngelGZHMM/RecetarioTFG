const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    let token;

    // Log para debug de cookies
    console.log('=== DEBUG MIDDLEWARE AUTH ===');
    console.log('Cookies recibidas:', req.cookies);
    console.log('Headers:', req.headers);
    
    // Intentar obtener token de cookies primero (para same-domain)
    token = req.cookies.jwt;
    console.log('Token desde cookies:', token ? token.substring(0, 20) + '...' : 'No existe');
    
    // Si no hay token en cookies, intentar obtenerlo del header Authorization (para cross-domain)
    if (!token) {
      const authHeader = req.headers.authorization;
      console.log('Authorization header:', authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remover "Bearer " del inicio
        console.log('Token desde Authorization header:', token ? token.substring(0, 20) + '...' : 'No válido');
      }
    }
    
    if (!token) {
      console.error('❌ Token no encontrado en cookies ni en headers');
      console.log('============================');
      return res.status(401).json({
        exito: false,
        error: {
          codigo: 'NO_AUTORIZADO',
          mensaje: 'Acceso no autorizado - token requerido'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    console.log('✅ Token válido para usuario:', decoded.Nombre_de_usuario);
    console.log('============================');
    next();
  } catch (error) {
    console.error('❌ Error en middleware auth:', error.message);
    console.log('============================');
    return res.status(401).json({
      exito: false,
      error: {
        codigo: 'TOKEN_INVALIDO',
        mensaje: 'Token inválido o expirado'
      }
    });
  }
};