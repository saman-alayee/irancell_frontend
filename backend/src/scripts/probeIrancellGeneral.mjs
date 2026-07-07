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
  await new Promise(r => setTimeout(r, 1500));
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const t = await r.text();
  return t;
}

const js = await (await fetch('https://shop.irancell.ir/_next/static/chunks/2472-6bfb8ac0fa7fe3f7.js', { headers: { 'User-Agent': UA } })).text();
const idx = js.indexOf('search_msisdn_general');
console.log('CTX', js.slice(idx - 150, idx + 350).replace(/\s+/g, ' '));

const tests = [
  { msisdn: '09001071252' },
  { pattern: '09001071252' },
  { number: '09001071252' },
  { msisdn: '9001071252' },
  { pattern: '0933' },
  { msisdn: '09336688952' },
  { productId: 127, msisdn: '09001071252' },
  { productId: 127, pattern: '09001071252' },
];

for (const body of tests) {
  const res = await post('/shop/api/v2/search_msisdn_general', body);
  console.log('\nBODY', JSON.stringify(body));
  console.log(res.slice(0, 1000));
}
