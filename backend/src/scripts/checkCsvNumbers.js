#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const CSV = process.argv[2] || 'c:\\Users\\User\\Desktop\\sample num.csv';
const DELAY_MS = Number(process.env.IRANCELL_LOOKUP_DELAY_MS || 500);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const BASE = 'https://apishop.irancell.ir';

function normalize(raw) {
  const d = String(raw).trim().replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('09')) return d;
  if (d.length === 10 && d.startsWith('9')) return '0' + d;
  return d;
}

function toPattern(n11) {
  return n11.startsWith('09') ? n11.slice(1) : n11;
}

function extractPrice(item, products) {
  const product = products[item?.pool] || {};
  const net = Number(product.netPrice ?? 0);
  if (net > 0) return net;
  return Number(product.finalPrice ?? product.netPrice ?? product.price ?? item?.price ?? 0);
}

async function getSession() {
  const r = await fetch('https://shop.irancell.ir/fa/sim-search', {
    headers: { 'User-Agent': UA },
  });
  const cookies = (r.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
  return cookies;
}

async function lookup(pattern, cookie) {
  const r = await fetch(`${BASE}/shop/api/v2/search_msisdn_general`, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'https://shop.irancell.ir',
      Referer: 'https://shop.irancell.ir/fa/sim-search',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ channel: 'eShop', pattern }),
  });
  return r.json();
}

function sameMsisdn(a, b) {
  const da = a.replace(/\D/g, '');
  const db = b.replace(/\D/g, '');
  const na = da.length === 10 ? '0' + da : da;
  const nb = db.length === 10 ? '0' + db : db;
  return na === nb || na.slice(-10) === nb.slice(-10);
}

(async () => {
  const text = fs.readFileSync(CSV, 'utf8');
  const lines = text.split(/\r?\n/).slice(1).filter((l) => l.trim());
  const numbers = lines.map((l) => normalize(l.split(',')[0] || l));

  console.log(`Checking ${numbers.length} numbers from ${CSV}\n`);
  let cookie = '';
  try {
    cookie = await getSession();
  } catch (e) {
    console.warn('Session fetch failed:', e.message);
  }

  const results = [];
  let available = 0;

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    const pattern = toPattern(num);
    if (i > 0) await new Promise((r) => setTimeout(r, DELAY_MS));
    if (i > 0 && i % 25 === 0) {
      try {
        cookie = await getSession();
      } catch { /* ignore */ }
    }

    const row = { number: num, pattern, available: false, price: 0, pool: '', display: '', error: '' };
    try {
      const data = await lookup(pattern, cookie);
      if (data.result_code !== 0) {
        row.error = data.info?.fa?.message || data.result_message || `code ${data.result_code}`;
      } else {
        const items = data.result?.numbers || [];
        const products = data.result?.products || {};
        let match = items.find((it) => sameMsisdn(it.msisdn, num));
        if (!match && items.length === 1) match = items[0];
        if (match) {
          row.available = true;
          row.price = extractPrice(match, products);
          row.pool = match.pool || '';
          row.display = match.msisdn || '';
          available++;
        }
      }
    } catch (e) {
      row.error = e.message;
    }
    results.push(row);
    const status = row.available ? `OK ${row.price}` : 'NO';
    process.stdout.write(`\r[${i + 1}/${numbers.length}] ${num} ${status}    `);
  }

  console.log('\n\n========== SUMMARY ==========');
  console.log(`Total: ${numbers.length} | Available: ${available} | Unavailable: ${numbers.length - available}`);

  const availList = results.filter((r) => r.available);
  if (availList.length) {
    console.log('\n--- AVAILABLE ---');
    for (const r of availList) {
      console.log(`${r.number}\t${r.display}\tpool:${r.pool}\t${r.price} Rial`);
    }
  }

  const unavail = results.filter((r) => !r.available);
  if (unavail.length) {
    console.log('\n--- UNAVAILABLE (first 20) ---');
    for (const r of unavail.slice(0, 20)) {
      console.log(`${r.number}${r.error ? ' — ' + r.error : ''}`);
    }
    if (unavail.length > 20) console.log(`... and ${unavail.length - 20} more`);
  }

  const outPath = path.join(path.dirname(CSV), 'sample_num_results.csv');
  const csvOut = ['number,available,price_rial,pool,display,error']
    .concat(results.map((r) =>
      `${r.number},${r.available},${r.price},${r.pool},"${r.display}",${r.error || ''}`
    ))
    .join('\n');
  fs.writeFileSync(outPath, csvOut, 'utf8');
  console.log(`\nFull results: ${outPath}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
