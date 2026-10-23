export const koreanIndexCodes = ['KOSPI', 'KOSDAQ'] as const;
export type IndexQuote = {
  symbol: string; name: string; price: number; change: number; date: string;
  asOf: string; marketStatus: string; source: string; sourceUrl: string; delayMinutes: number;
};
export function parseIndexQuote(code: typeof koreanIndexCodes[number], value: any, now = Date.now()): IndexQuote {
  const number = (v: unknown) => typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v.replace(/,/g, '')) : NaN;
  const price = number(value?.closePrice), change = number(value?.fluctuationsRatio);
  const asOf = value?.localTradedAt;
  const stamp = typeof asOf === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?\+09:00$/.test(asOf) ? Date.parse(asOf) : NaN;
  if (value?.itemCode !== code || !Number.isFinite(price) || price <= 0 || !Number.isFinite(change) || Math.abs(change) > 100 || !Number.isFinite(stamp) || stamp > now + 300000) throw Error('지수 원본의 코드·가격·기준시각 확인 실패');
  const delay = number(value.delayTime);
  return {symbol: code === 'KOSPI' ? '^KS11' : '^KQ11', name: code, price, change,
    date: asOf.slice(0,10), asOf, marketStatus: String(value.marketStatus || 'UNKNOWN'),
    source: '네이버 증권', sourceUrl: 'https://m.stock.naver.com/domestic/index/' + code,
    delayMinutes: Number.isFinite(delay) && delay >= 0 ? delay : 0};
}

