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

    const msg = {
      to: 'tu_email_de_destino@example.com', // ¡CAMBIA ESTO a tu dirección de correo donde quieres recibir los mensajes!
      from: 'ceo@syntastudio.com', // ¡CAMBIA ESTO a tu dirección de correo autenticada en SendGrid!
      subject: `Nueva solicitud de ${data.name} desde tu web`,
      html: `
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
      `,
    };

    await sgMail.send(msg);

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