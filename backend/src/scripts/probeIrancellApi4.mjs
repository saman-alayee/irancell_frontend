const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const js = await (await fetch('https://shop.irancell.ir/_next/static/chunks/2472-6bfb8ac0fa7fe3f7.js', { headers: { 'User-Agent': UA } })).text();

for (const kw of ['numbers', 'msisdn', 'price', 'amount', 'productId', 'search_msisdns', '127', '128', '129', '130', '131', '132']) {
  const re = new RegExp(kw, 'gi');
  let idx = 0, n = 0;
  while ((idx = js.indexOf(kw, idx)) !== -1 && n < 2) {
    console.log('\n[' + kw + ']', js.slice(Math.max(0, idx - 100), idx + 200).replace(/\s+/g, ' '));
    idx += kw.length;
    n++;
  }
}

// find all exported product id constants
const ids = [...js.matchAll(/productId:(\d{1,4})/g)].map(m => m[1]);
console.log('\nproductId: literals', [...new Set(ids)].slice(0, 50));

// search for rond
const rond = js.indexOf('rond');
if (rond >= 0) console.log('\nROND', js.slice(rond, rond + 400));
