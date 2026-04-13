import { httpClient } from './client';
import { SINA_API_BASE, GATEIO_API_BASE } from '../constants/api';

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
 * 从 Gate.io 获取单个币种行情
 */
export const fetchGateioTicker = async (symbol: string): Promise<string> => {
  const response = await httpClient.get(`${GATEIO_API_BASE}/spot/tickers`, {
    params: { currency_pair: symbol },
  });
  return JSON.stringify(response.data);
};

/**
 * 根据品种前缀判断数据源
 */
const isGateioSymbol = (symbol: string): boolean => symbol.startsWith('gateio_');

/**
 * 将品种拆分为 Sina 和 Gate.io 两组
 */
const splitBySource = (symbols: string[]): { sina: string[]; gateio: string[] } => {
  const sina: string[] = [];
  const gateio: string[] = [];
  symbols.forEach(s => {
    if (isGateioSymbol(s)) gateio.push(s);
    else sina.push(s);
  });
  return { sina, gateio };
};

/**
 * 获取多个品种原始行情数据（支持 Sina + Gate.io 混合数据源）
 */
export const fetchMultipleRawQuotes = async (symbols: string[]): Promise<Record<string, string>> => {
  const { sina, gateio } = splitBySource(symbols);
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

  // 获取 Gate.io 数据
  for (const fullSymbol of gateio) {
    try {
      const gateioSymbol = fullSymbol.replace('gateio_', '');
      const rawData = await fetchGateioTicker(gateioSymbol);
      result[fullSymbol] = rawData;
    } catch (error) {
      console.error(`[Gate.io] 获取 ${fullSymbol} 失败:`, error);
      result[fullSymbol] = '';
    }
  }

  return result;
};
