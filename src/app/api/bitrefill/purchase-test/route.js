export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
  
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing apiKey' }), { status: 400 });
    }
  
    try {
      const response = await fetch('https://api.bitrefill.com/v2/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          products: [
            {
              product_id: 'test-gift-card-code',
              value: 10,
              quantity: 1,
            },
          ],
          auto_pay: true,
          payment_method: 'balance',
        }),
      });
      console.log("MADE IT HERE");
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({ error: 'Bitrefill purchase failed', details: errorText }),
          { status: response.status }
        );
      }
  
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  