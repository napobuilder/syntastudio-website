exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { token } = JSON.parse(event.body);

    if (!token) {
        return { statusCode: 400, body: 'Token is required.' };
    }

    // ADVERTENCIA DE SEGURIDAD: Esta es una verificación de token MUY básica y NO segura para producción.
    // En un entorno real, deberías: 
    // 1. Almacenar los tokens generados en una base de datos con una fecha de expiración.
    // 2. Verificar que el token recibido coincida con uno almacenado y que no haya expirado.
    // 3. Asociar el token a un usuario específico (ej. por email) para validar su identidad.
    // Para este ejemplo sencillo, cualquier token presente se considera válido.

    // Simplemente verificamos que el token no esté vacío.
    // En un caso real, aquí iría la lógica de base de datos.
    const isValid = token.length > 0; 

    if (isValid) {
        // En un caso real, aquí recuperarías el email asociado al token desde la DB.
        // Para este ejemplo, devolvemos un email de ejemplo.
        return {
            statusCode: 200,
            body: JSON.stringify({ valid: true }),
        };
    } else {
        return {
            statusCode: 401,
            body: JSON.stringify({ valid: false, message: 'Token inválido o caducado.' }),
        };
    }
};
