/**
 * 实时行情实体
 */
export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume: number;
  amount: number;
  time: string;
}

/**
 * K 线数据实体
 */
export interface KLine {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 品种类型
 */
export type SymbolType = 'comex' | 'shfe' | 'stock' | 'fund' | 'fx' | 'custom';

/**
 * 品种实体
 */
export interface Symbol {
  code: string;
  name: string;
  type: SymbolType;
  market: string;
}

/**
 * 自定义指标类型
 */
export type CustomIndexType = 
  | 'GC_CNY'           // 国际金(人民币)
  | 'SI_CNY'           // 国际银(人民币)
  | 'SPREAD_GC_AU0'    // 外-内金差价
  | 'SPREAD_SI_AG0'    // 外-内银差价
  | 'RATIO_NY_GS'      // 纽约金银比
  | 'RATIO_SH_GS';     // 上海金银比
