import { httpClient } from './client';
import { SINA_API_BASE } from '../constants/api';

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
 * 获取多个品种原始行情数据
 */
export const fetchMultipleRawQuotes = async (symbols: string[]): Promise<Record<string, string>> => {
  const data = await fetchRawQuoteData(symbols);
  const result: Record<string, string> = {};
  
  symbols.forEach(symbol => {
    const regex = new RegExp(`var hq_str_${symbol}="(.*?)"`);
    const match = data.match(regex);
    result[symbol] = match?.[1] || '';
  });
  
  return result;
};
