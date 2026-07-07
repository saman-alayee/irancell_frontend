const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const html = await (await fetch('https://shop.irancell.ir/fa/sim-search', {
  headers: { 'User-Agent': UA },
})).text();

const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
if (!m) {
  console.log('NO_NEXT_DATA');
  process.exit(0);
}

const data = JSON.parse(m[1]);
const pageProps = data.props?.pageProps || {};
const s = JSON.stringify(pageProps);
console.log('LEN', s.length);

const apis = s.match(/https?:\/\/[^"\\]+/g) || [];
[...new Set(apis)].filter((u) => /api|search|sim|gateway|catalog|shop/i.test(u)).slice(0, 50)
  .forEach((u) => console.log('API', u));

function walk(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (/api|baseurl|base_url|search|sim|msisdn|gateway/i.test(k)) {
      console.log('FIELD', p, typeof v === 'string' ? v.slice(0, 200) : JSON.stringify(v).slice(0, 200));
    }
    if (v && typeof v === 'object') walk(v, p);
  }
}
walk(pageProps);

const chunks = [...new Set(html.match(/\/_next\/static\/chunks\/[^"]+\.js/g) || [])];
for (const ch of chunks) {
  const js = await (await fetch('https://shop.irancell.ir' + ch, { headers: { 'User-Agent': UA } })).text();
  if (!/msisdn|simSearch|sim-search|searchSim|mobileNumber|phoneNumber/i.test(js)) continue;
  console.log('\nCHUNK', ch, 'size', js.length);
  const paths = [...new Set((js.match(/["'](\/[^"']{3,120})["']/g) || []).map((x) => x.slice(1, -1)))];
  paths.filter((u) => /api|search|sim|msisdn|number|catalog|product/i.test(u)).slice(0, 40)
    .forEach((u) => console.log(' PATH', u));
  const abs = [...new Set((js.match(/https?:\/\/[^"'\\]+/g) || []))];
  abs.filter((u) => /api|search|sim|gateway|catalog/i.test(u)).slice(0, 25)
    .forEach((u) => console.log(' ABS', u));
  const idx = js.search(/msisdn|simSearch|searchSim/i);
  if (idx >= 0) {
    console.log(' CTX', js.slice(Math.max(0, idx - 120), idx + 280).replace(/\s+/g, ' '));
  }
}

// try candidate endpoints
const testNumber = '09001071252';
const candidates = [
  `https://shop.irancell.ir/api/sim/search?msisdn=${testNumber}`,
  `https://shop.irancell.ir/api/sim-search?number=${testNumber}`,
  `https://shop.irancell.ir/fa/api/sim/search?msisdn=${testNumber}`,
];
for (const url of candidates) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    const t = await r.text();
    console.log('\nTRY', url, r.status, t.slice(0, 300));
  } catch (e) {
    console.log('\nTRY ERR', url, e.message);
  }
}
