const PERSIAN = '۰۱۲۳۴۵۶۷۸۹'

export function toAsciiDigits(value: string) {
  return String(value ?? '').replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)))
}

export function digitCount(value: string) {
  return toAsciiDigits(value).replace(/\D/g, '').length
}

export function formatMsisdnDisplay(number: string) {
  const d = toAsciiDigits(number).replace(/\D/g, '')
  const core = d.length === 11 && d.startsWith('09') ? d.slice(1) : d.length === 10 ? d : ''
  if (core.length !== 10) return number
  return `${core.slice(0, 3)} - ${core.slice(3, 6)} - ${core.slice(6)}`
}

export function restDigitsFromSegments(prefix: string, middle: string, end: string) {
  const m = toAsciiDigits(middle).replace(/\D/g, '').slice(0, 3)
  const e = toAsciiDigits(end).replace(/\D/g, '').slice(0, 4)
  return (m + e).split('').concat(Array(7).fill('')).slice(0, 7)
}

export function buildPartialPattern(rawDigits: string) {
  let p = toAsciiDigits(rawDigits).replace(/\D/g, '')
  if (p.startsWith('0')) p = p.slice(1)
  if (p.length > 10) p = p.slice(0, 10)
  if (!p) return ''
  return p + '_'.repeat(10 - p.length)
}

/** جستجوی پیشرفته: 0930 + 998 + 8235 → 9309988235 یا 930998____ */
export function buildAdvancedPattern(prefix: string, middle: string, end: string) {
  return buildPartialPattern(`${prefix || ''}${middle || ''}${end || ''}`)
}

export function advancedToFullNumber(prefix: string, middle: string, end: string) {
  const combined = toAsciiDigits(`${prefix || ''}${middle || ''}${end || ''}`).replace(/\D/g, '')
  if (/^09\d{9}$/.test(combined)) return combined
  if (/^9\d{9}$/.test(combined)) return `0${combined}`
  const p10 = buildPartialPattern(combined)
  if (p10.includes('_')) return null
  return `0${p10}`
}

/** @deprecated use buildAdvancedPattern */
export function buildSegmentPattern(prefix: string, restDigits: string[]) {
  const m = restDigits.slice(0, 3).join('')
  const e = restDigits.slice(3, 7).join('')
  return buildAdvancedPattern(prefix, m, e)
}

export function segmentPatternToFullNumber(prefix: string, restDigits: string[]) {
  const m = restDigits.slice(0, 3).join('')
  const e = restDigits.slice(3, 7).join('')
  return advancedToFullNumber(prefix, m, e)
}

export type SimSearchMode = 'simple' | 'advanced'

export interface SimSearchPayload {
  mode: SimSearchMode
  query?: string
  prefix?: string
  middle?: string
  end?: string
  restDigits?: string[]
}

export function buildSearchPayload(payload: SimSearchPayload) {
  if (payload.mode === 'simple') {
    const q = toAsciiDigits(payload.query || '').replace(/\D/g, '')
    let fullNumber: string | null = null
    if (/^09\d{9}$/.test(q)) fullNumber = q
    else if (/^9\d{9}$/.test(q)) fullNumber = `0${q}`
    return { mode: 'simple' as const, pattern: buildPartialPattern(q), fullNumber }
  }

  const prefix = payload.prefix || '0930'
  const middle = payload.middle || ''
  const end = payload.end || ''
  return {
    mode: 'advanced' as const,
    pattern: buildAdvancedPattern(prefix, middle, end),
    fullNumber: advancedToFullNumber(prefix, middle, end),
  }
}

export function countSearchDigits(payload: SimSearchPayload) {
  if (payload.mode === 'simple') {
    return digitCount(payload.query || '')
  }
  return digitCount(payload.prefix || '') + digitCount(payload.middle || '') + digitCount(payload.end || '')
}

export function payloadToQuery(payload: SimSearchPayload) {
  const q: Record<string, string> = { mode: payload.mode }
  if (payload.mode === 'simple') {
    q.q = payload.query || ''
  } else {
    q.prefix = payload.prefix || '0930'
    q.middle = payload.middle || ''
    q.end = payload.end || ''
  }
  return q
}

export function queryToPayload(query: Record<string, string | string[] | undefined>): SimSearchPayload | null {
  const mode = query.mode === 'advanced' ? 'advanced' : 'simple'
  if (mode === 'simple') {
    const q = String(query.q || '')
    if (digitCount(q) < 3) return null
    return { mode: 'simple', query: q }
  }
  const prefix = String(query.prefix || '0930')
  const middle = String(query.middle || query.rest?.toString().slice(0, 3) || '')
  const end = String(query.end || query.rest?.toString().slice(3, 7) || '')
  if (countSearchDigits({ mode: 'advanced', prefix, middle, end }) < 3) return null
  return {
    mode: 'advanced',
    prefix,
    middle,
    end,
    restDigits: restDigitsFromSegments(prefix, middle, end),
  }
}

export function buildApiQuery(payload: SimSearchPayload, offset = 0) {
  const params = new URLSearchParams({ mode: payload.mode, limit: '20', offset: String(offset) })
  if (payload.mode === 'simple') {
    params.set('q', payload.query || '')
  } else {
    params.set('prefix', payload.prefix || '0930')
    params.set('middle', payload.middle || '')
    params.set('end', payload.end || '')
  }
  return `/numbers/sim-search?${params.toString()}`
}
