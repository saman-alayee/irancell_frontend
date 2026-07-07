import { writeFileSync } from 'fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE = 'https://apishop.irancell.ir';

const html = await (await fetch('https://shop.irancell.ir/fa/sim-search', { headers: { 'User-Agent': UA } })).text();
const data = JSON.parse(html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s)[1]);
writeFileSync('/tmp/next_sim_search.json', JSON.stringify(data.props?.pageProps, null, 2));

async function search(productId, pattern, offset = 0) {
  await new Promise((r) => setTimeout(r, 1500));
  const r = await fetch(`${BASE}/shop/api/v2/search_msisdns`, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: 'https://shop.irancell.ir',
      Referer: 'https://shop.irancell.ir/fa/sim-search',
    },
    body: JSON.stringify({ productId, pattern, offset }),
  });
  return r.json();
}

for (const pid of [87, 88, 89, 90, 91, 92, 127, 128, 129, 130]) {
  const t = await search(pid, '0933');
  const n = t.numbers?.length || 0;
  console.log('pid', pid, 'code', t.result_code, 'n', n, t.info?.fa?.message || '');
  if (n > 0) console.log(' SAMPLE', JSON.stringify(t.numbers[0]));
}

const t2 = await search(127, '0900', 0);
console.log('\n127/0900 n=', t2.numbers?.length);
if (t2.numbers?.length) console.log(JSON.stringify(t2.numbers[0], null, 2));

const t3 = await search(127, '09001071252', 0);
console.log('\n127/exact n=', t3.numbers?.length, JSON.stringify(t3).slice(0, 500));
