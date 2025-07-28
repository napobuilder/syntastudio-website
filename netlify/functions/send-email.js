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
      from: { email: 'ceo@syntastudio.com', name: 'Napoleon Baca' },
      subject: `Nueva solicitud de ${data.name} desde tu web`,
      html: `
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
      `,
    };

    const msgToUser = {
      to: data.email, // El email del usuario que rellenó el formulario
      from: { email: 'ceo@syntastudio.com', name: 'Napoleon Baca' },
      subject: 'Aquí tienes tu guía (y la verdad sobre por qué la necesitas).',
      html: `
        <h1>¡Hola, ${data.name}!</h1>
        <p>Aquí tienes lo que viniste a buscar: tu guía gratuita sobre los "5 Agujeros que Hacen Invisible a tu Negocio Online".</p>
        <p><a href="https://syntastudio.com/gracias.html"> >> Descarga tu Guía Gratuita Aquí << </a></p>
        <p>Ahora que tienes el diagnóstico, quiero hablarte de la verdadera enfermedad. Porque, fuera de joda, esos 5 agujeros son solo los síntomas.</p>
        <p>He visto cientos de webs de profesionales brillantes. La mayoría son como los maniquíes de las tiendas de ropa de lujo: están divinos, tienen un diseño impecable, pero no tienen nada en la cabeza.</p>
        <p>Son una fachada bonita sin un mensaje claro, sin una voz, sin una estrategia que guíe al visitante. Y una web sin un mensaje persuasivo es solo un adorno caro.</p>
        <p>El copywriting y la voz de tu marca no son el "último paso". Son el primer paso. Son los cimientos sobre los que se construye todo lo demás. Antes de pensar en el diseño, en los colores o en los botones, tienes que saber qué carajo vas a decir.</p>
        <p>En el próximo correo, te voy a proponer un atajo para que dejes de tener un maniquí y empieces a construir un vendedor que trabaje para ti 24/7.</p>
        <p>Seguimos,<br>Napoleón Baca<br>Synta Studio</p>
      `,
    };

    await sgMail.send(msgToMe);
    await sgMail.send(msgToUser);

    // Añadir el contacto a la lista de SendGrid para la automatización
    const request = {
      url: `/v3/marketing/contacts`,
      method: 'PUT',
      body: {
        list_ids: ['b4db8be7-9267-4058-98e5-00c0d878448e'], // ID de tu lista de SendGrid
        contacts: [
          {
            email: data.email,
            first_name: data.name, // Asumiendo que 'name' es el nombre completo
          },
        ],
      },
    };

    try {
      await sgMail.client.request(request);
      console.log('Contacto añadido a la lista de SendGrid con éxito.');
    } catch (error) {
      console.error('Error al añadir contacto a la lista de SendGrid:', error.response ? error.response.body : error.message);
    }

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