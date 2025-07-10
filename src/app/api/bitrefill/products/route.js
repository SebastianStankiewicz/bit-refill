export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');
  const includeTestProducts = searchParams.get('includeTestProducts') === 'true';

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing apiKey' }), { status: 400 });
  }

  try {
    const bitrefillUrl = new URL('https://api.bitrefill.com/v2/products');

    if (includeTestProducts) {
      bitrefillUrl.searchParams.set('include_test_products', 'true');
    }

    const response = await fetch(bitrefillUrl.href, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Bitrefill product fetch failed' }), {
        status: response.status,
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
