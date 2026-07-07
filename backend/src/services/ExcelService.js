const XLSX = require('xlsx');
const crypto = require('crypto');
const AppError = require('../utils/AppError');
const config = require('../config');
const { normalizeNumber } = require('../utils/helpers');
const { NUMBER_STATUSES } = require('../models/Number');
const numberRepository = require('../repositories/NumberRepository');
const irancellShopService = require('./IrancellShopService');
const numberPricingService = require('./NumberPricingService');

class ExcelService {
  constructor() {
    this.preparedCache = null;
  }

  cacheKey(buffer, source) {
    return crypto.createHash('md5').update(buffer).digest('hex') + ':' + source;
  }

  parseBuffer(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellText: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // raw:false → مقدار نمایشی سلول (مثلاً 0900...) نه عدد خام Excel
    return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  }

  extractRowNumber(row) {
    const raw =
      row.number ??
      row.Number ??
      row['شماره'] ??
      row['شماره تلفن'] ??
      row['موبایل'] ??
      Object.values(row)[0] ??
      '';

    let str = raw;
    if (typeof raw === 'number') {
      // Excel ممکن است 9001022053 یا 9.0001022053E9 بدهد
      if (!Number.isSafeInteger(raw) && raw > 1e10) {
        str = String(Math.round(raw));
      } else {
        str = String(Math.trunc(raw));
      }
    }
    const { toAsciiDigits } = require('./IrancellShopService');
    return normalizeNumber(toAsciiDigits(String(str).trim()));
  }

  validateRow(row, index, { priceRequired = true } = {}) {
    const errors = [];
    const rowNum = index + 2;

    const number = this.extractRowNumber(row);
    const rawPrice = row.price ?? row.Price ?? row['قیمت'] ?? '';
    const hasPrice = rawPrice !== '' && rawPrice !== null && rawPrice !== undefined;
    const price = hasPrice ? Number(rawPrice) : NaN;
    const status = String(row.status || row.Status || row['وضعیت'] || 'available')
      .toLowerCase()
      .trim();

    if (!/^09\d{9}$/.test(number)) {
      errors.push({ row: rowNum, field: 'number', message: 'Invalid number format' });
    }
    if (priceRequired && (isNaN(price) || price < 0)) {
      errors.push({ row: rowNum, field: 'price', message: 'Invalid price' });
    }
    if (status && !NUMBER_STATUSES.includes(status)) {
      errors.push({ row: rowNum, field: 'status', message: 'Invalid status' });
    }

    return {
      valid: errors.length === 0,
      errors,
      rowNum,
      data: errors.length === 0
        ? {
            number,
            price: hasPrice ? price : null,
            status: status || 'available',
          }
        : null,
    };
  }

  async enrichWithIrancell(rows) {
    const settings = await numberPricingService.getSettings();
    const lookups = await irancellShopService.lookupMany(
      rows.map((r) => r.number),
      { delayMs: config.irancellShop.lookupDelayMs }
    );

    return rows.map((row, i) => {
      const lookup = numberPricingService.buildPricing(lookups[i], settings);
      const manualPrice = row.price;
      const finalPrice = manualPrice != null && manualPrice >= 0 ? manualPrice : lookup.price;

      return {
        number: row.number,
        status: lookup.available ? (row.status || 'available') : 'sold',
        availableOnIrancell: lookup.available,
        basePrice: lookup.basePrice,
        netPrice: lookup.netPrice ?? lookup.basePrice,
        finalPriceWithVat: lookup.finalPriceWithVat ?? lookup.basePrice,
        price: finalPrice,
        irancellPool: lookup.pool || '',
        irancellError: lookup.error || null,
        irancellPattern: lookup.pattern || null,
        irancellSource: lookup.source || null,
        skipped: !lookup.available,
      };
    });
  }

  async prepareRows(buffer, { source = 'manual', useCache = true } = {}) {
    const key = this.cacheKey(buffer, source);
    if (useCache && this.preparedCache?.key === key && Date.now() - this.preparedCache.at < 10 * 60 * 1000) {
      return this.preparedCache.data;
    }

    const rows = this.parseBuffer(buffer);
    const priceRequired = source !== 'irancell';
    const results = rows.map((row, i) => this.validateRow(row, i, { priceRequired }));
    const validRows = results.filter((r) => r.valid).map((r) => r.data);
    const allErrors = results.flatMap((r) => r.errors);

    let enriched = validRows.map((r) => ({
      number: r.number,
      price: r.price,
      status: r.status,
      availableOnIrancell: true,
      basePrice: r.price ?? 0,
      skipped: false,
    }));

    let irancellNote = null;
    if (source === 'irancell' && validRows.length > 0) {
      const perBatch = config.irancellShop.lookupDelayMs + 1200;
      const batches = Math.ceil(validRows.length / config.irancellShop.lookupConcurrency);
      const etaSec = Math.ceil((batches * perBatch) / 1000);
      if (require('./IrancellShopService').isDevMode()) {
        irancellNote = '⚠️ حالت DEV فعال است — فقط ۴ شماره mock موجودند! IRANCELL_SHOP_DEV_MODE=false در .env';
      } else {
        irancellNote = `استعلام ${validRows.length} شماره از API ایرانسل (حدود ${etaSec} ثانیه، ${config.irancellShop.lookupConcurrency} موازی)`;
      }
      try {
        enriched = await this.enrichWithIrancell(validRows);
      } catch (err) {
        if (err.networkError) {
          throw new AppError(err.message, 503);
        }
        throw err;
      }
    }

    const numbers = enriched.map((r) => r.number);
    const existing = await numberRepository.findExistingNumbers(numbers);
    const existingSet = new Set(existing.map((e) => e.number));

    const duplicates = enriched.filter((r) => existingSet.has(r.number));
    const unavailable = source === 'irancell' ? enriched.filter((r) => r.skipped) : [];
    const availableOnIrancell = source === 'irancell' ? enriched.filter((r) => r.availableOnIrancell) : [];
    const toImport = enriched.filter((r) => !existingSet.has(r.number) && !r.skipped);

    const result = {
      totalRows: rows.length,
      validCount: validRows.length,
      irancellCheckedCount: source === 'irancell' ? enriched.length : 0,
      importCount: toImport.length,
      duplicateCount: duplicates.length,
      unavailableCount: unavailable.length,
      availableOnIrancellCount: availableOnIrancell.length,
      errorCount: allErrors.length,
      errors: allErrors,
      duplicates: duplicates.map((d) => d.number),
      unavailable: unavailable.map((d) => d.number),
      preview: toImport.slice(0, 50),
      checkedPreview:
        source === 'irancell'
          ? enriched.map((r) => ({
              number: r.number,
              available: r.availableOnIrancell,
              basePrice: r.basePrice,
              netPrice: r.netPrice ?? r.basePrice,
              finalPriceWithVat: r.finalPriceWithVat ?? r.basePrice,
              price: r.price,
              pool: r.irancellPool || '',
            }))
          : [],
      unavailablePreview: unavailable.slice(0, 20).map((r) => ({
        number: r.number,
        error: r.irancellError,
        pattern: r.irancellPattern,
        source: r.irancellSource,
      })),
      toImport,
      source,
      irancellNote,
    };

    this.preparedCache = { key, data: result, at: Date.now() };
    return result;
  }

  async preview(buffer, { source = 'manual' } = {}) {
    const prepared = await this.prepareRows(buffer, { source });
    const { toImport, ...rest } = prepared;
    return rest;
  }

  async import(buffer, { source = 'manual' } = {}) {
    const prepared = await this.prepareRows(buffer, { source });
    if (prepared.importCount === 0) {
      throw new AppError('No valid rows to import', 400);
    }

    const toInsert = prepared.toImport.map((r) => ({
      number: r.number,
      price: r.price,
      basePrice: r.basePrice ?? r.price,
      irancellPool: r.irancellPool || '',
      status: r.status,
      lastSyncedAt: source === 'irancell' ? new Date() : undefined,
    }));

    let imported = 0;
    const batchSize = 500;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      try {
        await numberRepository.bulkInsert(batch);
        imported += batch.length;
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }

    return {
      imported,
      skipped: prepared.duplicateCount + prepared.errorCount + prepared.unavailableCount,
      irancellCheckedCount: prepared.irancellCheckedCount,
      availableOnIrancellCount: prepared.availableOnIrancellCount,
      unavailable: prepared.unavailable,
      errors: prepared.errors,
      duplicates: prepared.duplicates,
    };
  }
}

module.exports = new ExcelService();
