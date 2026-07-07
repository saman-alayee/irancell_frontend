const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE = 'https://apishop.irancell.ir';

const js = await (await fetch('https://shop.irancell.ir/_next/static/chunks/2472-6bfb8ac0fa7fe3f7.js', {
  headers: { 'User-Agent': UA },
})).text();

// find search_msisdns context
let idx = 0;
while ((idx = js.indexOf('search_msisdns', idx)) !== -1) {
  console.log('CTX', js.slice(Math.max(0, idx - 250), idx + 400).replace(/\s+/g, ' '));
  idx += 1;
}

// find productId near sim-search
const simIdx = js.indexOf('sim-search');
console.log('\nSIM-SEARCH CTX', js.slice(Math.max(0, simIdx - 200), simIdx + 500).replace(/\s+/g, ' '));

// extract productId literals
const productIds = [...js.matchAll(/productId[:=](\d+)/g)].map(m => m[1]);
console.log('\nproductIds', [...new Set(productIds)].slice(0, 30));

// try search with various payloads
const tests = [
  { productId: 126, pattern: '09001071252', offset: 0 },
  { productId: 126, pattern: '9001071252', offset: 0 },
  { productId: 126, pattern: '09001071252', offset: 0 },
  { productId: 1, pattern: '09001071252', offset: 0 },
  { productId: 100, pattern: '09001071252', offset: 0 },
  { productId: 126, pattern: '1071252', offset: 0 },
];

for (const body of tests) {
  try {
    const r = await fetch(`${BASE}/shop/api/v2/search_msisdns`, {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'https://shop.irancell.ir',
        Referer: 'https://shop.irancell.ir/fa/sim-search',
      },
      body: JSON.stringify(body),
    });
    const t = await r.text();
    console.log('\nPOST', JSON.stringify(body), '=>', r.status);
    console.log(t.slice(0, 800));
  } catch (e) {
    console.log('ERR', e.message);
  }
}

// get product by category sim
for (const url of [
  `${BASE}/shop/api/v2/get_products_by_category?category=sim-prepaid`,
  `${BASE}/shop/api/v2/get_products_by_category?category=sims`,
]) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    console.log('\nGET', url, r.status, (await r.text()).slice(0, 600));
  } catch (e) {
    console.log('ERR', e.message);
  }
}
