const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE = 'https://apishop.irancell.ir';
const PRODUCT_ID = 127;

async function search(pattern) {
  const r = await fetch(`${BASE}/shop/api/v2/search_msisdns`, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: 'https://shop.irancell.ir',
      Referer: 'https://shop.irancell.ir/fa/sim-search',
    },
    body: JSON.stringify({ productId: PRODUCT_ID, pattern, offset: 0 }),
  });
  return r.json();
}

const patterns = ['0900', '09001071252', '9001071252', '1071252', '71252', '8888', '09008888888'];
for (const p of patterns) {
  await new Promise((r) => setTimeout(r, 800));
  const t = await search(p);
  console.log('\npattern', p, 'code', t.result_code, 'count', t.numbers?.length ?? 0);
  if (t.numbers?.length) {
    console.log(JSON.stringify(t.numbers.slice(0, 3), null, 2));
  } else {
    console.log(JSON.stringify(t).slice(0, 300));
  }
}

// search and find exact match in results
await new Promise((r) => setTimeout(r, 1000));
const broad = await search('0900');
if (broad.numbers?.length) {
  console.log('\nFIRST NUMBER FULL:', JSON.stringify(broad.numbers[0], null, 2));
}
