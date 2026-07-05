const XLSX = require('xlsx');
const AppError = require('../utils/AppError');
const { normalizeNumber } = require('../utils/helpers');
const { NUMBER_STATUSES } = require('../models/Number');
const numberRepository = require('../repositories/NumberRepository');

class ExcelService {
  parseBuffer(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  }

  validateRow(row, index) {
    const errors = [];
    const rowNum = index + 2;

    const number = normalizeNumber(row.number || row.Number || row['شماره'] || '');
    const price = Number(row.price ?? row.Price ?? row['قیمت'] ?? NaN);
    const status = String(row.status || row.Status || row['وضعیت'] || 'available')
      .toLowerCase()
      .trim();

    if (!/^09\d{9}$/.test(number)) {
      errors.push({ row: rowNum, field: 'number', message: 'Invalid number format' });
    }
    if (isNaN(price) || price < 0) {
      errors.push({ row: rowNum, field: 'price', message: 'Invalid price' });
    }
    if (status && !NUMBER_STATUSES.includes(status)) {
      errors.push({ row: rowNum, field: 'status', message: 'Invalid status' });
    }

    return {
      valid: errors.length === 0,
      errors,
      data: errors.length === 0 ? { number, price, status: status || 'available' } : null,
    };
  }

  async preview(buffer) {
    const rows = this.parseBuffer(buffer);
    const results = rows.map((row, i) => this.validateRow(row, i));
    const validRows = results.filter((r) => r.valid).map((r) => r.data);
    const allErrors = results.flatMap((r) => r.errors);

    const numbers = validRows.map((r) => r.number);
    const existing = await numberRepository.findExistingNumbers(numbers);
    const existingSet = new Set(existing.map((e) => e.number));

    const duplicates = validRows.filter((r) => existingSet.has(r.number));
    const toImport = validRows.filter((r) => !existingSet.has(r.number));

    return {
      totalRows: rows.length,
      validCount: validRows.length,
      importCount: toImport.length,
      duplicateCount: duplicates.length,
      errorCount: allErrors.length,
      errors: allErrors,
      duplicates: duplicates.map((d) => d.number),
      preview: toImport.slice(0, 20),
    };
  }

  async import(buffer) {
    const preview = await this.preview(buffer);
    if (preview.importCount === 0) {
      throw new AppError('No valid rows to import', 400);
    }

    const rows = this.parseBuffer(buffer);
    const validRows = rows
      .map((row, i) => this.validateRow(row, i))
      .filter((r) => r.valid)
      .map((r) => r.data);

    const existing = await numberRepository.findExistingNumbers(validRows.map((r) => r.number));
    const existingSet = new Set(existing.map((e) => e.number));
    const toInsert = validRows.filter((r) => !existingSet.has(r.number));

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
      skipped: preview.duplicateCount + preview.errorCount,
      errors: preview.errors,
      duplicates: preview.duplicates,
    };
  }
}

module.exports = new ExcelService();
