const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email } = JSON.parse(event.body);

    if (!email) {
        return { statusCode: 400, body: 'Email is required.' };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Generar un token simple (puedes hacerlo más complejo si lo necesitas)
    const token = crypto.randomBytes(16).toString('hex');
    const loginUrl = `${process.env.URL}/synta-lab.html?token=${token}`; // Asegúrate de que process.env.URL esté configurado en Netlify

    // Almacenar el token temporalmente (en una base de datos real, no en memoria)
    // Para este ejemplo simple, usaremos un enfoque que no persiste,
    // pero en un entorno de producción, necesitarías una base de datos.
    // Netlify Functions son sin estado, así que esto es solo para demostración.
    // En un caso real, el token se guardaría en una DB con una fecha de expiración.

    const msg = {
        to: email,
        from: { email: 'ceo@syntastudio.com', name: 'Napoleon Baca' },
        subject: 'Tu Contraseña de Acceso a Synta Lab',
        html: `
            <p>Hola,</p>
            <p>Haz clic en el siguiente enlace para acceder a Synta Lab:</p>
            <p><a href="${loginUrl}">Acceder a Synta Lab</a></p>
            <p>Este enlace es válido por un tiempo limitado.</p>
            <p>Gracias,</p>
            <p>El equipo de Synta Lab</p>
        `,
    };

    try {
        // Enviar el correo con el token
        await sgMail.send(msg);

        // Añadir el usuario a la lista de SendGrid (usando la API de Marketing)
        // Necesitarás el ID de tu lista de contactos de SendGrid
        const listId = 'ef324b81-f43a-4e41-8a3e-3d18fb36886b';
        const addContactUrl = 'https://api.sendgrid.com/v3/marketing/contacts';

        await fetch(addContactUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                list_ids: [listId],
                contacts: [{ email: email }]
            })
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Contraseña enviada y usuario agregado a la lista.' }),
        };
    } catch (error) {
        console.error('Error al enviar correo o agregar contacto:', error.response ? error.response.body : error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error interno del servidor.' }),
        };
    }
};
