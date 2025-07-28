const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  // Solo permitimos solicitudes POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Asegúrate de que la clave API de SendGrid esté configurada en las variables de entorno de Netlify
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const data = JSON.parse(event.body);

    // Aquí puedes añadir validaciones para los datos recibidos
    if (!data.name || !data.email) {
      return { statusCode: 400, body: 'Missing required fields (name, email)' };
    }

    const msgToMe = {
      to: 'napbak@gmail.com', // Tu dirección de correo donde quieres recibir los mensajes
      from: 'ceo@syntastudio.com', // ¡CAMBIA ESTO a tu dirección de correo autenticada en SendGrid!
      subject: `Nueva solicitud de ${data.name} desde tu web`,
      html: `
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
      `,
    };

    const msgToUser = {
      to: data.email, // El email del usuario que rellenó el formulario
      from: 'ceo@syntastudio.com', // ¡CAMBIA ESTO a tu dirección de correo autenticada en SendGrid!
      subject: '¡Gracias por tu interés en Synta Studio! Aquí tienes tu Auditoría Estratégica.',
      html: `
        <h1>¡Hola ${data.name}!</h1>
        <p>Gracias por tu interés en Synta Studio. Aquí tienes el enlace a tu Auditoría Estratégica gratuita:</p>
        <p><a href="https://syntastudio.com/gracias.html">Descarga tu Auditoría Estratégica aquí</a></p>
        <p>Esperamos que te sea de gran utilidad. Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>Saludos cordiales,<br>El equipo de Synta Studio</p>
      `,
    };

    await sgMail.send(msgToMe);
    await sgMail.send(msgToUser);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email', details: error.message }),
    };
  }
};