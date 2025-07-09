export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
  
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing apiKey' }), { status: 400 });
    }
  
    try {
      const response = await fetch('https://api.bitrefill.com/v2/accounts/balance', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });
  
      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Bitrefill balance fetch failed' }), {
          status: response.status,
        });
      }
  
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  