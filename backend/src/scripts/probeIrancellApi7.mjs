const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE = 'https://apishop.irancell.ir';
const page = await fetch('https://shop.irancell.ir/fa/sim-search', { headers: { 'User-Agent': UA } });
const cookies = (page.headers.getSetCookie?.() || []).map(c => c.split(';')[0]).join('; ');
const headers = {
  'User-Agent': UA,
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Origin: 'https://shop.irancell.ir',
  Referer: 'https://shop.irancell.ir/fa/sim-search',
  Cookie: cookies,
};

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return r.json();
}

const cats = await post('/shop/api/v2/get_products_by_category', { slug: 'sim-prepaid' });
console.log('products count', cats.products?.length);
(cats.products || []).slice(0, 5).forEach(p => console.log('PROD', p.id, p.name?.fa || p.title, p.is_sim, p.sim_type));

const cats2 = await post('/shop/api/v2/get_products_by_category', { slug: 'sim-postpaid' });
console.log('\npostpaid count', cats2.products?.length);
(cats2.products || []).slice(0, 5).forEach(p => console.log('PROD', p.id, p.name?.fa || p.title));

// use first sim product
const simProduct = (cats.products || []).find(p => p.is_sim) || cats.products?.[0];
if (simProduct) {
  await new Promise(r => setTimeout(r, 1500));
  const s = await post('/shop/api/v2/search_msisdns', { productId: simProduct.id, pattern: '0933', offset: 0 });
  console.log('\nsearch with product', simProduct.id, 'n=', s.numbers?.length);
  if (s.numbers?.length) console.log(JSON.stringify(s.numbers[0], null, 2));
}

// try get_product with product_id key
for (const body of [{ productId: 127 }, { product_id: 127 }, { id: 127 }]) {
  const p = await post('/shop/api/v2/get_product_by_id', body);
  console.log('\nget_product', JSON.stringify(body), p.result_code, JSON.stringify(p.product || p.data || p.info).slice(0, 300));
}
