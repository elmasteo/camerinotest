// boldWebhook.js

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    if (data.type !== 'SALE_APPROVED') {
      return { statusCode: 200, body: 'Not a SALE_APPROVED event.' };
    }

    const pedido = {
      payment_id: data.data.payment_id,
      reference: data.data.metadata.reference,
      payer_email: data.data.payer_email,
      payment_method: data.data.payment_method,
      total: data.data.amount.total,
      created_at: data.data.created_at,
    };

    // Información del repositorio y el archivo donde se guardará el pedido
    const repoOwner = 'elmasteo'; // Cambia esto con tu nombre de usuario de GitHub
    const repoName = 'camerinotest'; // Nombre de tu repositorio
    const filePath = 'pedidos/' + `${new Date().toISOString().replace(/[:.]/g, '-')}.json`; // El archivo JSON a guardar

    // Aquí hacemos la solicitud para crear/actualizar el archivo en GitHub
    const commitMessage = 'Nuevo pedido creado';

    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const headers = {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    };

    // Primero obtenemos el archivo si ya existe para obtener su SHA (si ya existía antes)
    let sha = '';
    try {
      const response = await fetch(githubApiUrl, { headers });
      if (response.ok) {
        const fileData = await response.json();
        sha = fileData.sha;
      }
    } catch (error) {
      console.log('Archivo no encontrado, se creará uno nuevo');
    }

    // Crear o actualizar el archivo en GitHub
    const body = JSON.stringify({
      message: commitMessage,
      content: Buffer.from(JSON.stringify(pedido, null, 2)).toString('base64'),
      sha: sha, // Si el archivo existe, se actualiza
    });

    const githubResponse = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: headers,
      body: body,
    });

    if (!githubResponse.ok) {
      throw new Error('Error al crear/actualizar archivo en GitHub');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Pedido recibido y commit realizado', pedido }),
    };
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return {
      statusCode: 500,
      body: 'Error interno',
    };
  }
};
