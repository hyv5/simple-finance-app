/**
 * 原始行情数据结构 - 新浪返回
 */
export interface RawGlobalFutureData {
  price: string;
  change: string;
  high: string;
  low: string;
  prevClose: string;
  open: string;
  time: string;
  date: string;
  volume: string;
  name: string;
}

/**
 * 原始 K 线数据结构
 */
export interface RawKLinePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 搜索结果原始数据
 */
export interface RawSearchResult {
  symbol: string;
  type: string;
  name: string;
}
