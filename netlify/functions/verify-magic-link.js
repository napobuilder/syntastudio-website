const sgMail = require('@sendgrid/mail');
const { Blob } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const { token } = JSON.parse(event.body);

    if (!token) {
      return { statusCode: 400, body: 'Missing token' };
    }

    const blob = new Blob('magic-links');
    const tokenDataString = await blob.get(token);

    if (!tokenDataString) {
      return { statusCode: 401, body: 'Invalid or expired token.' };
    }

    const tokenData = JSON.parse(tokenDataString);

    // Eliminar el token inmediatamente después de leerlo para asegurar un solo uso
    await blob.delete(token);

    if (Date.now() > tokenData.expiry) {
      return { statusCode: 401, body: 'Token expired.' };
    }

    // Si el token es válido, añadir el usuario a la lista de SendGrid y enviar correo de bienvenida
    const listId = 'ef324b81-f43a-4e41-8a3e-3d18fb36886b'; // ID de tu lista de SendGrid para Synta Lab!
    const contactEmail = tokenData.email;
    const contactName = tokenData.name;

    const addContactRequest = {
      url: `/v3/marketing/contacts`,
      method: 'PUT',
      body: {
        list_ids: [listId],
        contacts: [
          {
            email: contactEmail,
            first_name: contactName,
          },
        ],
      },
    };

    try {
      await sgMail.client.request(addContactRequest);
      console.log('Contacto añadido a la lista de Synta Lab con éxito.');

      // Enviar correo de bienvenida al usuario
      const welcomeMsg = {
        to: contactEmail,
        from: { email: 'ceo@syntastudio.com', name: 'Napoleon Baca' }, // Tu dirección de correo autenticada
        subject: '¡Bienvenido a Synta Lab! Tu Baúl de Prompts te espera.',
        html: `
          <h1>¡Hola ${contactName}!</h1>
          <p>¡Bienvenido a Synta Lab! Tu acceso al Baúl de Prompts ha sido confirmado.</p>
          <p>Aquí encontrarás un arsenal de prompts para potenciar tu pensamiento estratégico y creativo.</p>
          <p>Puedes acceder a tu Baúl de Prompts en cualquier momento desde: <a href="https://syntastudio.com/synta-lab.html">https://syntastudio.com/synta-lab.html</a></p>
          <p>¡Esperamos que lo disfrutes y le saques el máximo provecho!</p>
          <p>Saludos,<br>Napoleon Baca<br>Synta Studio</p>
        `,
      };
      await sgMail.send(welcomeMsg);
      console.log('Correo de bienvenida a Synta Lab enviado con éxito.');

    } catch (error) {
      console.error('Error en la automatización de Synta Lab (añadir contacto o enviar bienvenida):', error.response ? error.response.body : error.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true, email: contactEmail, name: contactName, message: 'Access granted.' }),
    };
  } catch (error) {
    console.error('Error in verify-magic-link function:', error.response ? error.response.body : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ valid: false, message: 'Failed to verify magic link', details: error.message }),
    };
  }
};