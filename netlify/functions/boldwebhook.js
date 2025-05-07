const fs = require('fs');
const path = require('path');

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

    const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

    const filePath = path.join('/tmp', filename);
    fs.writeFileSync(filePath, JSON.stringify(pedido, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Pedido recibido', pedido }),
    };

  } catch (error) {
    console.error('Error procesando webhook:', error);
    return {
      statusCode: 500,
      body: 'Error interno',
    };
  }
};
