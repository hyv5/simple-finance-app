import { httpClient } from './client';
import { SINA_API_ROUTES, KLINE_SCALES, KLineType } from '../constants/api';

/**
 * 构建 K 线 URL
 */
const buildKLineUrl = (
  symbol: string,
  type: KLineType,
  datalen: number
): string => {
  const isHF = symbol.startsWith('hf_');
  const isNF = symbol.startsWith('nf_');
  const isStock = symbol.startsWith('sh') || symbol.startsWith('sz');

  if (isHF) {
    const s = symbol.replace('hf_', '').toUpperCase();
    if (type === 'min1' || type === 'min5') {
      return `${SINA_API_ROUTES.GLOBAL_FUTURE_MIN}?symbol=${s}&type=${type === 'min1' ? '1' : '5'}`;
    }
    return `${SINA_API_ROUTES.GLOBAL_FUTURE}getGlobalFuturesDailyKLine?symbol=${s}`;
  }

  if (isStock) {
    return `${SINA_API_ROUTES.CN_STOCK}?symbol=${symbol}&scale=${KLINE_SCALES[type]}&ma=no&datalen=${datalen}`;
  }

  if (isNF) {
    const s = symbol.replace('nf_', '').toUpperCase();
    if (type === 'min1' || type === 'min5') {
      const t = type === 'min1' ? '1' : '5';
      return `${SINA_API_ROUTES.INNER_FUTURE_NEW}getFewMinLine?symbol=${s}&type=${t}&datalen=${datalen}&len=${datalen}`;
    }
    return `${SINA_API_ROUTES.INNER_FUTURE}getInnerFuturesDailyKLine?symbol=${s}`;
  }

  if (symbol.startsWith('f_')) {
    const s = symbol.replace('f_', '');
    return `${SINA_API_ROUTES.EAST_MONEY_FUND}${s}.js`;
  }

  throw new Error(`Unsupported symbol type: ${symbol}`);
};

/**
 * 获取 K 线原始数据
 */
export const fetchRawKLineData = async (
  symbol: string,
  type: KLineType,
  datalen?: number
): Promise<string> => {
  const defaultLen = type === 'min5' ? 8000 : type === 'min1' ? 2000 : 1000;
  const url = buildKLineUrl(symbol, type, datalen || defaultLen);
  
  console.log(`[KLine API] Fetching ${symbol} ${type}: ${url}`);
  
  const response = await httpClient.get(url);
  return response.data;
};

/**
 * 获取备用 K 线数据（fallback）
 */
export const fetchFallbackKLineData = async (
  symbol: string,
  type: KLineType
): Promise<string | null> => {
  if (symbol.startsWith('hf_') && (type === 'min1' || type === 'min5')) {
    const s = symbol.replace('hf_', '').toUpperCase();
    const url = `${SINA_API_ROUTES.GLOBAL_FUTURE_MIN}?symbol=${s}&type=${type === 'min1' ? '1' : '5'}`;
    const response = await httpClient.get(url);
    return response.data;
  }
  return null;
};
