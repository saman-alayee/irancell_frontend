const numberRepository = require('../repositories/NumberRepository');
const irancellShopService = require('./IrancellShopService');
const { toAsciiDigits } = require('./IrancellShopService');
const numberPricingService = require('./NumberPricingService');
const AppError = require('../utils/AppError');
const { normalizeNumber } = require('../utils/helpers');

class NumberService {
  async lookupForShop(number) {
    const settings = await numberPricingService.getSettings();
    if (!settings.irancellFetchEnabled) {
      throw new AppError('استعلام ایرانسل غیرفعال است', 503);
    }
    const normalized = normalizeNumber(number);
    const lookup = await irancellShopService.lookupNumber(normalized);
    return numberPricingService.buildPricing(lookup, settings);
  }

  async getByNumber(number) {
    const normalized = normalizeNumber(number);
    if (!/^09\d{9}$/.test(normalized)) {
      throw new AppError('Number not found', 404);
    }
    const priced = await this.lookupForShop(normalized);
    return {
      number: priced.number,
      price: priced.price,
      basePrice: priced.basePrice,
      status: priced.available ? 'available' : 'unavailable',
      available: priced.available,
      msisdnDisplay: priced.msisdnDisplay,
      pool: priced.pool || '',
      source: priced.source || 'irancell',
    };
  }

  async lookupFromIrancell(number) {
    return this.lookupForShop(number);
  }

  async checkAndSync(number) {
    return this.lookupForShop(number);
  }

  async search(query, options) {
    return numberRepository.search(query, options);
  }

  async simSearch(params = {}, limit = 20) {
    const {
      q = '',
      mode = 'advanced',
      prefix = '0930',
      middle = '',
      end = '',
      rest = '',
      offset = 0,
    } = params;

    const settings = await numberPricingService.getSettings();
    if (!settings.irancellFetchEnabled) {
      throw new AppError('جستجوی ایرانسل غیرفعال است', 503);
    }

    const searchMode = mode === 'simple' ? 'simple' : 'advanced';

    let pattern;
    let fullNumber = null;

    if (searchMode === 'simple') {
      const clean = toAsciiDigits(q).replace(/\D/g, '');
      if (/^09\d{9}$/.test(normalizeNumber(clean))) {
        fullNumber = normalizeNumber(clean);
      } else if (/^9\d{9}$/.test(clean)) {
        fullNumber = normalizeNumber(`0${clean}`);
      }
      pattern = irancellShopService.buildPartialPattern(clean);
    } else {
      pattern = irancellShopService.buildAdvancedPattern(prefix, middle, end);
      fullNumber = irancellShopService.advancedToFullNumber(prefix, middle, end);
    }

    const digitCount = searchMode === 'simple'
      ? toAsciiDigits(q).replace(/\D/g, '').length
      : toAsciiDigits(`${prefix}${middle}${end}`).replace(/\D/g, '').length;

    if (digitCount < 3) {
      throw new AppError('حداقل ۳ رقم برای جستجو وارد کنید', 400);
    }

    const response = {
      query: q,
      mode: searchMode,
      pattern,
      exact: null,
      similar: [],
      unavailable: false,
      similarNumbers: false,
      hasMore: false,
      offset,
    };

    const isFullNumber = fullNumber && /^09\d{9}$/.test(fullNumber);
    const isFullSimple = searchMode === 'simple' && isFullNumber && offset === 0;
    const isFullSegment = searchMode === 'advanced' && isFullNumber && offset === 0;

    if (isFullSimple || isFullSegment) {
      const lookup = await irancellShopService.lookupNumber(fullNumber);
      const priced = numberPricingService.buildPricing(lookup, settings);
      if (priced.available) {
        response.exact = priced;
        return response;
      }
      response.unavailable = true;
    }

    try {
      let searchResult;

      if ((isFullSimple || isFullSegment) && fullNumber) {
        searchResult = await irancellShopService.searchSimilarForNumber(fullNumber, limit, offset);
        response.searchPattern = searchResult.pattern;
        response.similarNumbers = true;
      } else {
        searchResult = await irancellShopService.searchWithPattern(pattern, limit, offset);
        response.searchPattern = searchResult.pattern;
        response.similarNumbers = searchResult.similarNumbers;
      }

      let similar = searchResult.items.map((item) => numberPricingService.buildPricing(item, settings));

      if (fullNumber) {
        similar = similar.filter((item) => item.number !== fullNumber);
      }

      if ((isFullSimple || isFullSegment) && fullNumber) {
        similar = irancellShopService.filterSimilarByLeadingDigits(fullNumber, similar, limit);
        response.similarNumbers = similar.length > 0;
      }

      response.similar = similar;
      response.hasMore = searchResult.hasMore;

      if (response.similar.length) {
        response.similarNumbers = true;
      }

      if (!response.exact && !response.similar.length) {
        response.unavailable = true;
      }
    } catch (err) {
      if (!response.exact && !response.similar.length) {
        response.unavailable = true;
        response.error = err.message;
      }
    }

    return response;
  }

  async create(data) {
    data.number = normalizeNumber(data.number);
    const existing = await numberRepository.findByNumber(data.number);
    if (existing) throw new AppError('Number already exists', 409);
    return numberRepository.create(data);
  }

  async update(id, data) {
    if (data.number) {
      data.number = normalizeNumber(data.number);
    }
    return numberRepository.updateById(id, data);
  }

  async delete(id) {
    return numberRepository.deleteById(id);
  }

  async getStats() {
    return numberRepository.getStats();
  }

  async reserve(id) {
    return numberRepository.updateById(id, { status: 'reserved' });
  }

  async markSold(id) {
    return numberRepository.updateById(id, { status: 'sold' });
  }
}

module.exports = new NumberService();
