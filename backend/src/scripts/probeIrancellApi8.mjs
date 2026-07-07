import { writeFileSync } from 'fs';

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
  await new Promise(r => setTimeout(r, 1200));
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return r.json();
}

for (const id of [127, 128, 565, 560, 561, 562, 637, 820]) {
  const p = await post('/shop/api/v2/get_product_by_id', { id });
  const name = p.name?.fa || p.name?.en || p.product?.name?.fa || 'unknown';
  console.log('product', id, 'code', p.result_code, 'name', name, 'is_sim?', p.is_sim, 'price', p.price || p.base_price);
}

const patterns = ['0933', '0900', '8888', '1234', '09001071252'];
const productIds = [127, 128, 565, 560, 820];

for (const productId of productIds) {
  for (const pattern of patterns) {
    const s = await post('/shop/api/v2/search_msisdns', { productId, pattern, offset: 0 });
    const n = s.numbers?.length || 0;
    if (n > 0) {
      console.log('\nHIT productId', productId, 'pattern', pattern, 'count', n);
      console.log(JSON.stringify(s.numbers[0], null, 2));
      writeFileSync('/tmp/irancell_number_sample.json', JSON.stringify(s.numbers[0], null, 2));
    } else {
      console.log('miss', productId, pattern, s.result_code);
    }
  }
}
