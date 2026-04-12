/**
 * 品种分类工具
 */

export type SymbolCategory = 'futures' | 'stock' | 'fund' | 'forex' | 'bond' | 'unknown';

/**
 * 根据 symbol 判断品种类别
 */
export function getSymbolCategory(symbol: string): SymbolCategory {
  if (!symbol) return 'unknown';
  
  // 国际期货（COMEX等）
  if (symbol.startsWith('hf_')) {
    return 'futures';
  }
  
  // 国内期货
  if (symbol.startsWith('nf_')) {
    return 'futures';
  }
  
  // 外汇
  if (symbol.startsWith('fx_')) {
    return 'forex';
  }
  
  // 开放式基金
  if (symbol.startsWith('f_')) {
    return 'fund';
  }
  
  // 股票/ETF/LOF（上海、深圳）
  if (symbol.startsWith('sh') || symbol.startsWith('sz')) {
    // ETF 通常以 510、511、159 开头
    const code = symbol.substring(2);
    if (code.startsWith('51') || code.startsWith('159')) {
      return 'fund';  // ETF 归为基金类
    }
    // LOF 通常以 160-169 开头
    if (code.startsWith('16') || code.startsWith('16')) {
      return 'fund';  // LOF 归为基金类
    }
    // 否则视为股票
    return 'stock';
  }
  
  // 自定义指数
  if (symbol.startsWith('SPREAD_') || symbol.startsWith('RATIO_') || 
      symbol === 'GC_CNY' || symbol === 'SI_CNY') {
    return 'futures';  // 自定义指数归为期货类
  }
  
  return 'unknown';
}

/**
 * 获取类别显示名称
 */
export function getCategoryName(category: SymbolCategory): string {
  const names: Record<SymbolCategory, string> = {
    futures: '期货',
    stock: '股票',
    fund: '基金',
    forex: '外汇',
    bond: '债券',
    unknown: '其他',
  };
  return names[category] || '其他';
}

/**
 * 获取类别排序权重
 */
export function getCategoryOrder(category: SymbolCategory): number {
  const orders: Record<SymbolCategory, number> = {
    futures: 1,
    fund: 2,
    stock: 3,
    bond: 4,
    forex: 5,
    unknown: 6,
  };
  return orders[category] || 99;
}

/**
 * 按类别分组
 */
export function groupByCategory<T extends { symbol: string }>(items: T[]): Record<SymbolCategory, T[]> {
  const groups: Record<SymbolCategory, T[]> = {
    futures: [],
    stock: [],
    fund: [],
    forex: [],
    bond: [],
    unknown: [],
  };
  
  items.forEach(item => {
    const category = getSymbolCategory(item.symbol);
    groups[category].push(item);
  });
  
  return groups;
}
