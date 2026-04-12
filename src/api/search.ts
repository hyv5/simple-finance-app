import { httpClient } from './client';
import { SINA_API_ROUTES } from '../constants/api';

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  typeName: string;
}

/**
 * 搜索品种
 */
export const searchSymbols = async (key: string): Promise<SearchResult[]> => {
  if (!key) return [];
  
  try {
    const response = await httpClient.get(`${SINA_API_ROUTES.SUGGEST}${encodeURIComponent(key)}`);
    const match = response.data.match(/var suggestvalue="(.*)"/);
    
    if (!match || !match[1]) return [];

    const items = match[1].split(';');
    const results: SearchResult[] = items.map((item: string) => {
      const parts = item.split(',');
      const symbol = parts[0];
      const typeCode = parts[1];
      const name = parts[4];
      
      let typeName = '未知';
      if (typeCode === '11' || typeCode === '12') typeName = '股票';
      else if (typeCode === '21' || typeCode === '201') typeName = '基金';
      else if (typeCode === '22' || typeCode === '202') typeName = 'ETF';
      else if (typeCode === '23' || typeCode === '203') typeName = 'LOF';
      else if (typeCode === '81') typeName = '债券';
      else if (typeCode === '31') typeName = '港股';
      else if (typeCode === '41') typeName = '美股';

      let finalSymbol = symbol;
      if (symbol.startsWith('of')) {
        const code = symbol.substring(2);
        if (typeCode === '21' || typeCode === '201') {
          finalSymbol = `f_${code}`;
        } else {
          finalSymbol = `sz${code}`;
        }
      }

      return { symbol: finalSymbol, name, type: typeCode, typeName };
    });

    // 过滤和排序
    const filtered = results.filter(item => 
      item.symbol && (
        item.symbol.startsWith('sh') || 
        item.symbol.startsWith('sz') || 
        item.symbol.startsWith('f_')
      )
    );

    filtered.sort((a, b) => {
      const isAFund = a.type.startsWith('2');
      const isBFund = b.type.startsWith('2');
      if (isAFund && !isBFund) return -1;
      if (!isAFund && isBFund) return 1;
      return 0;
    });

    // 去重
    const uniqueMap = new Map<string, SearchResult>();
    for (const item of filtered) {
      if (!uniqueMap.has(item.symbol)) {
        uniqueMap.set(item.symbol, item);
      }
    }

    return Array.from(uniqueMap.values());
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};
