import { httpClient } from './client';
import { SINA_API_BASE, BINANCE_API_BASE } from '../constants/api';

/**
 * 获取原始行情数据
 */
export const fetchRawQuoteData = async (symbols: string[]): Promise<string> => {
  const response = await httpClient.get(`${SINA_API_BASE.HQ}/list=${symbols.join(',')}`);
  return response.data;
};

/**
 * 获取单个品种原始数据
 */
export const fetchRawQuote = async (symbol: string): Promise<string> => {
  const data = await fetchRawQuoteData([symbol]);
  const regex = new RegExp(`var hq_str_${symbol}="(.*?)"`);
  const match = data.match(regex);
  return match?.[1] || '';
};

/**
 * 从 Binance 获取单个币种行情
 */
export const fetchBinanceTicker = async (symbol: string): Promise<string> => {
  const response = await httpClient.get(`${BINANCE_API_BASE}/ticker/24hr`, {
    params: { symbol },
  });
  return JSON.stringify(response.data);
};

/**
 * 根据品种前缀判断数据源
 */
const isBinanceSymbol = (symbol: string): boolean => symbol.startsWith('binance_');

/**
 * 将品种拆分为 Sina 和 Binance 两组
 */
const splitBySource = (symbols: string[]): { sina: string[]; binance: string[] } => {
  const sina: string[] = [];
  const binance: string[] = [];
  symbols.forEach(s => {
    if (isBinanceSymbol(s)) binance.push(s);
    else sina.push(s);
  });
  return { sina, binance };
};

/**
 * 获取多个品种原始行情数据（支持 Sina + Binance 混合数据源）
 */
export const fetchMultipleRawQuotes = async (symbols: string[]): Promise<Record<string, string>> => {
  const { sina, binance } = splitBySource(symbols);
  const result: Record<string, string> = {};

  // 获取 Sina 数据
  if (sina.length > 0) {
    const sinaData = await fetchRawQuoteData(sina);
    sina.forEach(symbol => {
      const regex = new RegExp(`var hq_str_${symbol}="(.*?)"`);
      const match = sinaData.match(regex);
      result[symbol] = match?.[1] || '';
    });
  }

  // 获取 Binance 数据
  for (const fullSymbol of binance) {
    try {
      const binanceSymbol = fullSymbol.replace('binance_', '');
      const rawData = await fetchBinanceTicker(binanceSymbol);
      result[fullSymbol] = rawData;
    } catch (error) {
      console.error(`[Binance] 获取 ${fullSymbol} 失败:`, error);
      result[fullSymbol] = '';
    }
  }

  return result;
};
