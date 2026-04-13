import { SYMBOL_NAME_MAP } from '../../constants/api';

/**
 * 获取展示名称
 */
export const getDisplayName = (symbol: string, rawName: string): string => {
  return SYMBOL_NAME_MAP[symbol] || rawName || symbol;
};

/**
 * 判断是否为自定义指标
 */
export const isCustomIndex = (symbol: string): boolean => {
  const customIndices = ['GC_CNY', 'SI_CNY', 'SPREAD_GC_AU0', 'SPREAD_SI_AG0', 'RATIO_NY_GS', 'RATIO_SH_GS'];
  return customIndices.includes(symbol);
};

/**
 * 判断是否为差价/比率类型
 */
export const isSpreadSymbol = (symbol: string): boolean => {
  return symbol.startsWith('SPREAD_') || symbol.startsWith('RATIO_');
};

/**
 * 计算涨跌颜色
 */
export const getPriceColor = (change: number): string => {
  if (change > 0) return '#ff4d4f';
  if (change < 0) return '#52c41a';
  return '#666666';
};
