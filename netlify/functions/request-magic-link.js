const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');
const { Blob } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const { email, name } = JSON.parse(event.body);

    if (!email || !name) {
      return { statusCode: 400, body: 'Missing required fields (email, name)' };
    }

    const token = uuidv4();
    const expiry = Date.now() + (15 * 60 * 1000); // Token válido por 15 minutos

    // Guardar el token y los datos del usuario en Netlify Blobs
    const blob = new Blob('magic-links'); // Nombre del store de Blobs
    await blob.set(token, JSON.stringify({ email, name, expiry }));

    const magicLink = `https://syntastudio.com/synta-lab.html?token=${token}`; // ¡CAMBIA ESTO a la URL real de tu Synta Lab!

    const msg = {
      to: email,
      from: { email: 'ceo@syntastudio.com', name: 'Napoleon Baca' }, // Tu dirección de correo autenticada
      subject: 'Tu Enlace de Acceso Mágico a Synta Lab',
      html: `
        <h1>¡Hola ${name}!</h1>
        <p>Gracias por solicitar acceso a Synta Lab. Haz clic en el siguiente enlace para acceder a tu Baúl de Prompts:</p>
        <p><a href="${magicLink}">Acceder a Synta Lab</a></p>
        <p>Este enlace es válido por 15 minutos y solo puede usarse una vez.</p>
        <p>Si no solicitaste este enlace, por favor ignora este correo.</p>
        <p>Saludos,<br>Napoleon Baca<br>Synta Studio</p>
      `,
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Magic link sent!' }),
    };
  } catch (error) {
    console.error('Error in request-magic-link function:', error.response ? error.response.body : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send magic link', details: error.message }),
    };
  }
};