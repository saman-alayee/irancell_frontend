const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE = 'https://apishop.irancell.ir';

const html = await (await fetch('https://shop.irancell.ir/fa/sim-search', { headers: { 'User-Agent': UA } })).text();
const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
const data = JSON.parse(m[1]);
const s = JSON.stringify(data);

// find productId in page data
const pids = [...s.matchAll(/"productId"\s*:\s*(\d+)/g)].map(x => x[1]);
const pids2 = [...s.matchAll(/"product_id"\s*:\s*(\d+)/g)].map(x => x[1]);
const pids3 = [...s.matchAll(/"id"\s*:\s*(\d+)/g)].map(x => x[1]);
console.log('productId in page', [...new Set(pids)]);
console.log('product_id in page', [...new Set(pids2)].slice(0, 20));

function findProductIds(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (obj.productId) out.push(obj.productId);
  if (obj.product_id) out.push(obj.product_id);
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') findProductIds(v, out);
  }
  return out;
}
console.log('walk productIds', [...new Set(findProductIds(data))]);

// sim-search chunk
const simJs = await (await fetch('https://shop.irancell.ir/_next/static/chunks/pages/%5Blang%5D/sim-search-9e50a95c4598c987.js', {
  headers: { 'User-Agent': UA },
})).text();
const simPids = [...simJs.matchAll(/productId[":=]+(\d+)/g)].map(x => x[1]);
console.log('sim-search chunk productIds', [...new Set(simPids)]);

// chunk 2472 - search for numeric product ids near sim
const js = await (await fetch('https://shop.irancell.ir/_next/static/chunks/2472-6bfb8ac0fa7fe3f7.js', { headers: { 'User-Agent': UA } })).text();
const nearSim = [];
let i = js.indexOf('sim-search');
while (i !== -1) {
  nearSim.push(js.slice(i, i + 800));
  i = js.indexOf('sim-search', i + 1);
}
nearSim.slice(0, 3).forEach((x, n) => console.log('nearSim', n, x.replace(/\s+/g, ' ').slice(0, 500)));

// try common sim product ids
const testPatterns = ['09001071252', '9001071252', '1071252', '71252'];
const testProductIds = [...new Set([...pids, ...simPids, '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '127', '128', '129', '130'])];

for (const productId of testProductIds.slice(0, 40)) {
  for (const pattern of ['09001071252']) {
    const r = await fetch(`${BASE}/shop/api/v2/search_msisdns`, {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'https://shop.irancell.ir',
        Referer: 'https://shop.irancell.ir/fa/sim-search',
      },
      body: JSON.stringify({ productId: Number(productId), pattern, offset: 0 }),
    });
    const t = await r.json();
    if (t.result_code === 0 || (t.data && (t.data.msisdns || t.data.items || t.data.list))) {
      console.log('\nSUCCESS productId', productId, JSON.stringify(t).slice(0, 1200));
    } else if (t.result_code !== -3 && t.result_code !== -2) {
      console.log('\nOTHER productId', productId, 'code', t.result_code, JSON.stringify(t.info || t).slice(0, 200));
    }
  }
}

// get_product_by_id for ids from page
for (const id of [...new Set([...pids, ...simPids])].slice(0, 10)) {
  const r = await fetch(`${BASE}/shop/api/v2/get_product_by_id`, {
    method: 'POST',
    headers: { 'User-Agent': UA, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ productId: Number(id) }),
  });
  const t = await r.text();
  console.log('\nget_product_by_id', id, t.slice(0, 400));
}
