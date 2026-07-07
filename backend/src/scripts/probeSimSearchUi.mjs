import { writeFileSync } from 'fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const page = await fetch('https://shop.irancell.ir/fa/sim-search', { headers: { 'User-Agent': UA } });
const html = await page.text();

// Extract visible text snippets from HTML
const title = html.match(/<title>([^<]+)/)?.[1];
console.log('TITLE:', title);

const h1s = [...html.matchAll(/<h[1-3][^>]*>([^<]{3,80})/g)].map(m => m[1].trim());
console.log('HEADINGS:', JSON.stringify(h1s.slice(0, 10)));

// Find sim-search chunk
const chunkMatch = html.match(/sim-search-[a-f0-9]+\.js/);
console.log('CHUNK:', chunkMatch?.[0] || 'none');

// Extract button/label text from HTML directly
const btnTexts = [...html.matchAll(/>([\u0600-\u06FF\s\d\-]{3,40})</g)]
  .map(m => m[1].trim())
  .filter(t => /جست|شمار|بخش|سریع|پیشرف|موجود|ناموجود|091|090|093|رقم|وارد|سیم/.test(t));
console.log('HTML_TEXT:', JSON.stringify([...new Set(btnTexts)].slice(0, 30)));

if (chunkMatch) {
  const jsUrl = `https://shop.irancell.ir/_next/static/chunks/pages/%5Blang%5D/${chunkMatch[0]}`;
  const js = await (await fetch(jsUrl, { headers: { 'User-Agent': UA } })).text();
  writeFileSync('/tmp/sim-search-chunk.js', js);
  console.log('CHUNK_SIZE:', js.length);

  const strings = [...js.matchAll(/"([\u0600-\u06FF\s\d\-،\.]{3,50})"/g)]
    .map(m => m[1].trim())
    .filter(t => /جست|شمار|بخش|سریع|پیشرف|موجود|ناموجود|091|090|093|رقم|وارد|سیم|نتیجه|یافت|مشابه/.test(t));
  console.log('JS_STRINGS:', JSON.stringify([...new Set(strings)].slice(0, 50)));

  for (const kw of ['normalSearch', 'advancedSearch', 'segment', 'pattern', 'searchType', 'quickSearch', 'multiPart']) {
    const i = js.indexOf(kw);
    if (i >= 0) console.log('KW', kw, js.slice(i, i + 120).replace(/\s+/g, ' '));
  }

  const idx = js.indexOf('search_msisdn');
  if (idx >= 0) console.log('API_SNIP:', js.slice(Math.max(0, idx - 300), idx + 500).replace(/\s+/g, ' ').slice(0, 800));
}
