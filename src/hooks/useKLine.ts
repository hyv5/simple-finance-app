import { useQuery } from '@tanstack/react-query';
import { fetchRawKLineData, fetchFallbackKLineData } from '../api/kline';
import { KLineParser } from '../domain/parsers/KLineParser';
import { KLineAggregator } from '../domain/services/KLineAggregator';
import { KLine } from '../domain/entities';
import { KLineType } from '../constants/api';

/**
 * 检测响应是否无效
 */
const isInvalidResponse = (data: string): boolean => {
  return !data || 
    data.includes('__ERROR') || 
    data.includes('Service not found') || 
    data.includes('Invalid service name');
};

/**
 * 获取 K 线数据
 */
export const useKLine = (symbol: string, type: KLineType) => {
  return useQuery<KLine[], Error>({
    queryKey: ['kline', symbol, type],
    queryFn: async () => {
      let rawData = await fetchRawKLineData(symbol, type);
      
      // 尝试 fallback
      if (isInvalidResponse(rawData)) {
        const fallback = await fetchFallbackKLineData(symbol, type);
        if (fallback) {
          rawData = fallback;
        }
      }

      let data = KLineParser.parse(rawData);

      // 周线/月线需要聚合
      if ((type === 'weekly' || type === 'monthly') && data.length > 0) {
        data = type === 'weekly' 
          ? KLineAggregator.aggregateToWeekly(data)
          : KLineAggregator.aggregateToMonthly(data);
      }

      return data;
    },
    enabled: !!symbol,
    staleTime: 60000,
  });
};
