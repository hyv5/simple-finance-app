import { KLine } from '../entities';
import { KLineType } from '../../constants/api';

/**
 * K线聚合器 - 将低周期数据聚合为高周期
 */
export class KLineAggregator {
  /**
   * 聚合为周线
   */
  static aggregateToWeekly(data: KLine[]): KLine[] {
    return this.aggregate(data, 'weekly');
  }

  /**
   * 聚合为月线
   */
  static aggregateToMonthly(data: KLine[]): KLine[] {
    return this.aggregate(data, 'monthly');
  }

  /**
   * 通用聚合方法
   */
  private static aggregate(data: KLine[], type: 'weekly' | 'monthly'): KLine[] {
    if (!data || data.length === 0) return [];

    const result: KLine[] = [];
    let currentGroup: KLine[] = [];

    data.forEach((item, index) => {
      const date = new Date(item.time);
      if (isNaN(date.getTime())) return;

      let isNewGroup = false;
      if (index > 0) {
        const prevDate = new Date(data[index - 1].time);
        if (type === 'weekly') {
          const day = date.getDay();
          const prevDay = prevDate.getDay();
          isNewGroup = day < prevDay || (date.getTime() - prevDate.getTime() > 5 * 24 * 3600 * 1000);
        } else {
          isNewGroup = date.getMonth() !== prevDate.getMonth() || 
                       date.getFullYear() !== prevDate.getFullYear();
        }
      }

      if (isNewGroup && currentGroup.length > 0) {
        result.push(this.mergeGroup(currentGroup));
        currentGroup = [];
      }
      currentGroup.push(item);
    });

    if (currentGroup.length > 0) {
      result.push(this.mergeGroup(currentGroup));
    }

    return result;
  }

  /**
   * 合并一组 K 线
   */
  private static mergeGroup(group: KLine[]): KLine {
    const first = group[0];
    const last = group[group.length - 1];
    
    return {
      time: last.time,
      open: first.open,
      high: Math.max(...group.map(d => d.high)),
      low: Math.min(...group.map(d => d.low)),
      close: last.close,
      volume: group.reduce((sum, d) => sum + d.volume, 0),
    };
  }

  /**
   * 将 1 分钟数据聚合为 5 分钟
   */
  static aggregateTo5Min(data: KLine[]): KLine[] {
    if (!data || data.length === 0) return [];

    const buckets = new Map<number, KLine[]>();
    
    data.forEach(d => {
      const date = new Date(d.time);
      date.setSeconds(0);
      date.setMilliseconds(0);
      const minutes = date.getMinutes();
      date.setMinutes(minutes - (minutes % 5));
      const bucketTs = date.getTime();
      
      if (!buckets.has(bucketTs)) buckets.set(bucketTs, []);
      buckets.get(bucketTs)!.push(d);
    });

    return Array.from(buckets.keys())
      .sort((a, b) => a - b)
      .map(ts => {
        const chunk = buckets.get(ts)!;
        const first = chunk[0];
        const last = chunk[chunk.length - 1];
        const d = new Date(ts);
        const timeStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
        
        return {
          time: timeStr,
          open: first.open,
          high: Math.max(...chunk.map(c => c.high)),
          low: Math.min(...chunk.map(c => c.low)),
          close: last.close,
          volume: chunk.reduce((sum, c) => sum + c.volume, 0),
        };
      });
  }
}
