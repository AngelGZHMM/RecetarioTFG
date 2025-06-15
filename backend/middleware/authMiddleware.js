require('dotenv').config(); // Cargar variables de entorno

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Obtener la clave secreta desde el archivo .env

module.exports.authMiddleware = (req, res, next) => {
    // Leer el token desde las cookies o los encabezados
    console.log('Token recibido en cookies:', req.cookies.jwt);
    console.log('Token recibido en encabezado Authorization:', req.headers.authorization);
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    try {
        // Validar el token usando la clave secreta del archivo .env
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;

        next(); // Si el token es válido, continuar con la solicitud
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        console.log('Error al validar el token:', error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
};