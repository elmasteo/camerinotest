import { Octokit } from "@octokit/rest";

export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    if (data.type !== 'SALE_APPROVED') {
      return {
        statusCode: 200,
        body: 'Evento ignorado (no es SALE_APPROVED).',
      };
    }

    const pedido = {
      payment_id: data.data.payment_id,
      reference: data.data.metadata.reference,
      payer_email: data.data.payer_email,
      payment_method: data.data.payment_method,
      total: data.data.amount.total,
      created_at: data.data.created_at,
    };

    const content = JSON.stringify(pedido, null, 2);
    const now = new Date();
    const fileName = `pedidos/${now.toISOString().replace(/[:.]/g, "-")}.json`;

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const response = await octokit.repos.createOrUpdateFileContents({
      owner: "elmasteo", // reemplaza con tu usuario
      repo: "camerinotest",     // reemplaza con el nombre del repo
      path: fileName,
      message: `Nuevo pedido: ${pedido.reference}`,
      content: Buffer.from(content).toString('base64'),
      committer: {
        name: "Netlify Bot",
        email: "bot@netlify.com"
      },
      author: {
        name: "Netlify Bot",
        email: "bot@netlify.com"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Pedido guardado", github: response.data }),
    };

  } catch (error) {
    console.error("❌ Error al procesar webhook:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
