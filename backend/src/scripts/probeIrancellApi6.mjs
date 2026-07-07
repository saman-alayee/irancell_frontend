const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE = 'https://apishop.irancell.ir';

// visit shop first for cookies
const page = await fetch('https://shop.irancell.ir/fa/sim-search', { headers: { 'User-Agent': UA } });
const cookies = page.headers.getSetCookie?.() || [];
const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
console.log('cookies', cookieHeader.slice(0, 200));

const headers = {
  'User-Agent': UA,
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Origin: 'https://shop.irancell.ir',
  Referer: 'https://shop.irancell.ir/fa/sim-search',
  ...(cookieHeader ? { Cookie: cookieHeader } : {}),
};

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const t = await r.text();
  return { status: r.status, body: t };
}

// get products by category POST variants
for (const body of [
  { category: 'sim-prepaid' },
  { category_id: 'sim-prepaid' },
  { categoryId: 'sim-prepaid' },
  { slug: 'sim-prepaid' },
  { category: 'sims' },
]) {
  const res = await post('/shop/api/v2/get_products_by_category', body);
  console.log('\nget_products_by_category', JSON.stringify(body), res.status, res.body.slice(0, 400));
}

// search with cookies
for (const [pid, pattern] of [[127, '0933'], [128, '0933'], [127, '09001071252'], [128, '09001071252']]) {
  await new Promise(r => setTimeout(r, 1500));
  const res = await post('/shop/api/v2/search_msisdns', { productId: pid, pattern, offset: 0 });
  console.log('\nsearch', pid, pattern, res.body.slice(0, 600));
}

// get_product_by_id for 127, 128
for (const id of [127, 128]) {
  const res = await post('/shop/api/v2/get_product_by_id', { productId: id });
  console.log('\nget_product', id, res.body.slice(0, 800));
}
