import { Quote } from '../entities';
import { getDisplayName } from '../services/QuoteUtils';

/**
 * 国际期货行情解析器
 */
export const parseGlobalFutureQuote = (symbol: string, rawData: string): Quote => {
  const parts = rawData.split(',');
  const price = parseFloat(parts[0]);
  const prevClose = parseFloat(parts[7]);
  const sinaChange = parseFloat(parts[1]);
  
  let change = price - prevClose;
  let displayPrice = price;
  
  if (price === 0 || (change === 0 && sinaChange !== 0)) {
    change = sinaChange || 0;
    if (displayPrice === 0 || (change !== 0 && displayPrice === prevClose)) {
      displayPrice = prevClose + change;
    }
  }
  
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol,
    name: getDisplayName(symbol, parts[13]),
    price: displayPrice,
    change,
    changePercent,
    high: parseFloat(parts[4]),
    low: parseFloat(parts[5]),
    open: parseFloat(parts[8]),
    prevClose,
    volume: parseFloat(parts[9]),
    amount: 0,
    time: `${parts[12]} ${parts[6]}`,
  };
};

/**
 * 国内股票/ETF行情解析器
 */
export const parseStockQuote = (symbol: string, rawData: string): Quote => {
  const parts = rawData.split(',');
  const price = parseFloat(parts[3]);
  const prevClose = parseFloat(parts[2]);
  const change = price - prevClose;
  
  return {
    symbol,
    name: getDisplayName(symbol, parts[0]),
    price,
    change,
    changePercent: (change / prevClose) * 100,
    high: parseFloat(parts[4]),
    low: parseFloat(parts[5]),
    open: parseFloat(parts[1]),
    prevClose,
    volume: parseFloat(parts[8]),
    amount: parseFloat(parts[9]),
    time: `${parts[30]} ${parts[31]}`,
  };
};

/**
 * 国内期货行情解析器
 */
export const parseInnerFutureQuote = (symbol: string, rawData: string): Quote => {
  const parts = rawData.split(',');
  let price = parseFloat(parts[8]);
  let prevClose = parseFloat(parts[10]) || parseFloat(parts[5]) || price;

  if (price === 0) {
    price = parseFloat(parts[9]) || prevClose;
  }

  let timeStr = parts[1] || '';
  if (timeStr.length === 6) {
    timeStr = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
  }

  const change = price - prevClose;

  return {
    symbol,
    name: getDisplayName(symbol, parts[0]),
    price,
    change,
    changePercent: prevClose !== 0 ? (change / prevClose) * 100 : 0,
    high: parseFloat(parts[3]),
    low: parseFloat(parts[4]),
    open: parseFloat(parts[2]),
    prevClose,
    volume: parseFloat(parts[14]),
    amount: 0,
    time: `${parts[17] || ''} ${timeStr}`.trim(),
  };
};

/**
 * 外汇行情解析器
 */
export const parseFXQuote = (symbol: string, rawData: string): Quote => {
  const parts = rawData.split(',');
  const price = parseFloat(parts[8]) || parseFloat(parts[1]);
  const prevClose = parseFloat(parts[3]);
  const change = price - prevClose;

  return {
    symbol,
    name: getDisplayName(symbol, '外汇'),
    price,
    change,
    changePercent: prevClose !== 0 ? (change / prevClose) * 100 : 0,
    high: parseFloat(parts[6]),
    low: parseFloat(parts[7]),
    open: parseFloat(parts[5]),
    prevClose,
    volume: 0,
    amount: 0,
    time: parts[0],
  };
};

/**
 * 开放式基金行情解析器
 */
export const parseFundQuote = (symbol: string, rawData: string): Quote => {
  const parts = rawData.split(',');
  const price = parseFloat(parts[1]);
  const prevClose = parseFloat(parts[3]);
  const change = price - prevClose;

  return {
    symbol,
    name: getDisplayName(symbol, parts[0]),
    price,
    change,
    changePercent: prevClose !== 0 ? (change / prevClose) * 100 : 0,
    high: price,
    low: price,
    open: price,
    prevClose,
    volume: 0,
    amount: 0,
    time: parts[4] || '',
  };
};

/**
 * 主解析器 - 根据品种类型自动选择解析器
 */
export const parseQuote = (symbol: string, rawData: string): Quote => {
  if (!rawData) {
    throw new Error(`Empty data for symbol: ${symbol}`);
  }

  if (symbol.startsWith('hf_')) {
    return parseGlobalFutureQuote(symbol, rawData);
  } else if (symbol.startsWith('sh') || symbol.startsWith('sz')) {
    return parseStockQuote(symbol, rawData);
  } else if (symbol.startsWith('nf_')) {
    return parseInnerFutureQuote(symbol, rawData);
  } else if (symbol.startsWith('fx_')) {
    return parseFXQuote(symbol, rawData);
  } else if (symbol.startsWith('f_')) {
    return parseFundQuote(symbol, rawData);
  } else if (symbol.startsWith('gateio_')) {
    return parseGateioTicker(symbol, rawData);
  }

  throw new Error(`Unknown symbol type: ${symbol}`);
};

/**
 * Gate.io 加密货币行情解析器
 */
export const parseGateioTicker = (symbol: string, rawData: string): Quote => {
  const dataArray = JSON.parse(rawData);
  const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
  const price = parseFloat(data.last);
  const changePercent = parseFloat(data.change_percentage) || 0;
  const high = parseFloat(data.high_24h);
  const low = parseFloat(data.low_24h);
  // Gate.io doesn't provide open/prevClose directly, calculate from change_percentage
  const prevClose = changePercent !== 0 ? price / (1 + changePercent / 100) : price;
  const change = price - prevClose;
  const open = prevClose; // approximate open as prevClose

  // 去除 gateio_ 前缀用于名称查找
  const cleanSymbol = symbol.replace('gateio_', '');

  return {
    symbol,
    name: getDisplayName(symbol, cleanSymbol),
    price,
    change,
    changePercent,
    high,
    low,
    open,
    prevClose: prevClose > 0 ? prevClose : price,
    volume: parseFloat(data.base_volume) || 0,
    amount: parseFloat(data.quote_volume) || 0,
    time: new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
};