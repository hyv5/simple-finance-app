import { KLine } from '../entities';

/**
 * 解析时间字符串为时间戳
 */
const parseTime = (timeStr: string): number => {
  if (timeStr.includes('-') && timeStr.includes(':')) {
    return new Date(timeStr).getTime();
  }
  return new Date().getTime();
};

/**
 * K线数据解析器
 */
export class KLineParser {
  /**
   * 从 JSON 提取数组
   */
  static extractJsonArray(data: string): unknown[] | null {
    try {
      // 处理天天基金格式
      if (data.includes('Data_netWorthTrend')) {
        const startKey = 'var Data_netWorthTrend = ';
        const startIdx = data.indexOf(startKey);
        if (startIdx !== -1) {
          const arrayStartIdx = startIdx + startKey.length;
          const endIdx = data.indexOf('];', arrayStartIdx);
          if (endIdx !== -1) {
            const jsonStr = data.substring(arrayStartIdx, endIdx + 1);
            return JSON.parse(jsonStr);
          }
        }
      }

      // 寻找 JSON 开始位置
      const startArray = data.indexOf('[');
      const startObject = data.indexOf('{');
      let startIdx = -1;
      
      if (startArray !== -1 && (startObject === -1 || startArray < startObject)) {
        startIdx = startArray;
      } else {
        startIdx = startObject;
      }

      if (startIdx === -1) return null;

      const endArray = data.lastIndexOf(']');
      const endObject = data.lastIndexOf('}');
      const endIdx = Math.max(endArray, endObject);

      if (endIdx === -1 || endIdx <= startIdx) return null;

      const jsonStr = data.substring(startIdx, endIdx + 1);
      let raw = JSON.parse(jsonStr);

      // 处理嵌套格式
      if (!Array.isArray(raw) && typeof raw === 'object' && raw !== null) {
        const obj = raw as Record<string, any>;
        if (obj.minLine_5m) return obj.minLine_5m;
        if (obj.minLine_1d) return obj.minLine_1d;
        return [raw];
      }

      return Array.isArray(raw) ? raw : null;
    } catch (e) {
      console.error('[KLineParser] Parse error:', e);
      return null;
    }
  }

  /**
   * 展平嵌套数据
   */
  static flattenNestedData(rawData: unknown[]): any[] {
    const firstItem = rawData[0] as any;
    let flatData: any[] = [];

    if (firstItem && !Array.isArray(firstItem) && typeof firstItem === 'object') {
      const hasDataArray = Array.isArray(firstItem.m || firstItem.data || firstItem.list);
      const hasDate = !!(firstItem.d || firstItem.date || firstItem.day);

      if (hasDataArray && hasDate) {
        rawData.forEach((dayGroup: any) => {
          const dayDate = dayGroup.d || dayGroup.date || dayGroup.day;
          const points = dayGroup.m || dayGroup.data || dayGroup.list;
          if (Array.isArray(points)) {
            points.forEach(p => {
              if (Array.isArray(p)) {
                if (String(p[0]).includes(':') && !String(p[0]).includes('-')) {
                  const newPoint = [...p];
                  newPoint[0] = `${dayDate} ${p[0]}`;
                  flatData.push(newPoint);
                } else {
                  flatData.push(p);
                }
              } else if (typeof p === 'object' && p !== null) {
                flatData.push({ ...p, d: `${dayDate} ${p.t || p.time}` });
              }
            });
          }
        });
        return flatData;
      }
    }

    return rawData;
  }

  /**
   * 解析单个 K 线点
   */
  static parsePoint(data: any): KLine | null {
    if (Array.isArray(data) && data.length >= 6) {
      return {
        time: String(data[0]),
        open: parseFloat(data[1]),
        high: parseFloat(data[2]),
        low: parseFloat(data[3]),
        close: parseFloat(data[4]),
        volume: parseFloat(data[5]),
      };
    }
    
    if (typeof data === 'object' && data !== null) {
      return {
        time: String(data.d || data.time || data.t || data.date || ''),
        open: parseFloat(data.o || data.open || 0),
        high: parseFloat(data.h || data.high || 0),
        low: parseFloat(data.l || data.low || 0),
        close: parseFloat(data.c || data.close || 0),
        volume: parseFloat(data.v || data.volume || 0),
      };
    }

    return null;
  }

  /**
   * 解析完整 K 线数据
   */
  static parse(data: string): KLine[] {
    const rawArray = this.extractJsonArray(data);
    if (!rawArray) return [];

    const flatData = this.flattenNestedData(rawArray);
    const result: KLine[] = [];

    flatData.forEach(item => {
      const point = this.parsePoint(item);
      if (point && point.time) {
        result.push(point);
      }
    });

    return result;
  }
}
