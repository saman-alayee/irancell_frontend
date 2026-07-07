import { writeFileSync } from 'fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE = 'https://apishop.irancell.ir';
const js = await (await fetch('https://shop.irancell.ir/_next/static/chunks/2472-6bfb8ac0fa7fe3f7.js', { headers: { 'User-Agent': UA } })).text();
const endpoints = [...new Set((js.match(/["'](\/(?:shop|cart|user|charge|bill_payment|simswap|ngpg|update_profile|increase_cl)[^"']+)["']/g) || []).map(x => x.slice(1,-1)))];
writeFileSync('/tmp/irancell_endpoints.txt', endpoints.join('\n'));
console.log('endpoints', endpoints.length);
endpoints.filter(e => /sim|msisdn|number|search|rond/i.test(e)).forEach(e => console.log(e));

const page = await fetch('https://shop.irancell.ir/fa/sim-search', { headers: { 'User-Agent': UA } });
const cookies = (page.headers.getSetCookie?.() || []).map(c => c.split(';')[0]).join('; ');
const headers = { 'User-Agent': UA, 'Content-Type': 'application/json', Accept: 'application/json', Origin: 'https://shop.irancell.ir', Referer: 'https://shop.irancell.ir/fa/sim-search', Cookie: cookies };

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return r.json();
}

// patterns from UI - often last digits
for (const pattern of ['*888*', '888', '***888', '0933888', '933888', '8888888', '01252', '71252']) {
  await new Promise(r => setTimeout(r, 2000));
  const s = await post('/shop/api/v2/search_msisdns', { productId: 127, pattern, offset: 0 });
  console.log('pat', JSON.stringify(pattern), 'n', s.numbers?.length, 'keys', Object.keys(s).join(','));
  if (s.numbers?.length) console.log(JSON.stringify(s.numbers[0]));
  else if (s.result_code !== 0) console.log(JSON.stringify(s.info));
}
