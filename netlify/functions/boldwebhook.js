exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    if (data.type !== 'SALE_APPROVED') {
      return { statusCode: 200, body: 'Evento ignorado: no es SALE_APPROVED' };
    }

    const referencia = data.data.metadata?.reference;
    if (!referencia) {
      return { statusCode: 400, body: 'Referencia no encontrada en metadata' };
    }

    // Ruta al archivo del pedido guardado previamente
    const repoOwner = 'elmasteo';
    const repoName = 'camerinotest';
    const filePath = `pedidosform/${referencia}.json`;

    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3.raw',
    };

    // Obtener el archivo con los datos del pedido (incluye teléfono)
    const pedidoRes = await fetch(githubApiUrl, { headers });
    if (!pedidoRes.ok) {
      return { statusCode: 404, body: 'No se encontró el archivo del pedido original' };
    }

    const pedido = await pedidoRes.json();
    const telefono = pedido.telefono?.replace(/\D/g, ''); // limpiar

    if (!telefono) {
      return { statusCode: 400, body: 'Número de teléfono no encontrado en el pedido' };
    }

    // Preparar mensaje y enviar por Evolution API
    const mensaje = `Hola ${pedido.nombre}, tu pago ha sido aprobado. Muy pronto te estaremos contactando para coordinar el envío de tu pedido. ¡Gracias por comprar en CamerinoJip!`;



    const evoRes = await fetch('https://ubuntu.taile4b68d.ts.net/message/sendText/CamerinoJIP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: `${process.env.EVOLUTION_API_TOKEN}`,
      },
      body: JSON.stringify({
        phone: `57${telefono}`, // Colombia
        message: mensaje,
      }),
    });

    if (!evoRes.ok) {
      const errText = await evoRes.text();
      throw new Error(`Error en Evolution API: ${errText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Mensaje de WhatsApp enviado correctamente' }),
    };
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return {
      statusCode: 500,
      body: 'Error interno',
    };
  }
};
