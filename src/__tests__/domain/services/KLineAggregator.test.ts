import { KLineAggregator } from '@/src/domain/services/KLineAggregator';
import { KLine } from '@/src/domain/entities';

describe('KLineAggregator', () => {
  const mockDailyData: KLine[] = [
    { time: '2024-01-15', open: 100, high: 105, low: 98, close: 102, volume: 1000 },
    { time: '2024-01-16', open: 102, high: 108, low: 101, close: 106, volume: 1500 },
    { time: '2024-01-17', open: 106, high: 110, low: 105, close: 108, volume: 2000 },
    { time: '2024-01-18', open: 108, high: 112, low: 107, close: 110, volume: 1800 },
    { time: '2024-01-19', open: 110, high: 115, low: 109, close: 114, volume: 2200 },
  ];

  describe('aggregateToWeekly', () => {
    it('should aggregate daily data to weekly', () => {
      const result = KLineAggregator.aggregateToWeekly(mockDailyData);

      expect(result).toHaveLength(1);
      expect(result[0].open).toBe(100); // First day's open
      expect(result[0].close).toBe(114); // Last day's close
      expect(result[0].high).toBe(115); // Max high
      expect(result[0].low).toBe(98); // Min low
      expect(result[0].volume).toBe(8500); // Sum of volumes
    });

    it('should handle multiple weeks', () => {
      const multiWeekData: KLine[] = [
        ...mockDailyData,
        { time: '2024-01-22', open: 115, high: 120, low: 114, close: 118, volume: 3000 },
      ];

      const result = KLineAggregator.aggregateToWeekly(multiWeekData);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array for empty input', () => {
      const result = KLineAggregator.aggregateToWeekly([]);
      expect(result).toEqual([]);
    });
  });

  describe('aggregateToMonthly', () => {
    it('should aggregate daily data to monthly', () => {
      const result = KLineAggregator.aggregateToMonthly(mockDailyData);

      expect(result).toHaveLength(1);
      expect(result[0].open).toBe(100);
      expect(result[0].close).toBe(114);
    });

    it('should handle multiple months', () => {
      const multiMonthData: KLine[] = [
        ...mockDailyData,
        { time: '2024-02-01', open: 115, high: 120, low: 114, close: 118, volume: 3000 },
      ];

      const result = KLineAggregator.aggregateToMonthly(multiMonthData);

      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('aggregateTo5Min', () => {
    it('should aggregate 1-min data to 5-min', () => {
      const min1Data: KLine[] = [
        { time: '2024-01-15 10:01', open: 100, high: 101, low: 99, close: 100, volume: 100 },
        { time: '2024-01-15 10:02', open: 100, high: 102, low: 100, close: 101, volume: 150 },
        { time: '2024-01-15 10:03', open: 101, high: 103, low: 101, close: 102, volume: 200 },
        { time: '2024-01-15 10:04', open: 102, high: 104, low: 102, close: 103, volume: 180 },
        { time: '2024-01-15 10:05', open: 103, high: 105, low: 103, close: 104, volume: 220 },
      ];

      const result = KLineAggregator.aggregateTo5Min(min1Data);

      expect(result).toHaveLength(1);
      expect(result[0].open).toBe(100); // First candle's open
      expect(result[0].close).toBe(104); // Last candle's close
      expect(result[0].high).toBe(105); // Max high
      expect(result[0].low).toBe(99); // Min low
      expect(result[0].volume).toBe(850); // Sum of volumes
    });

    it('should create multiple 5-min candles', () => {
      const min1Data: KLine[] = [
        { time: '2024-01-15 10:01', open: 100, high: 101, low: 99, close: 100, volume: 100 },
        { time: '2024-01-15 10:02', open: 100, high: 102, low: 100, close: 101, volume: 150 },
        { time: '2024-01-15 10:03', open: 101, high: 103, low: 101, close: 102, volume: 200 },
        { time: '2024-01-15 10:04', open: 102, high: 104, low: 102, close: 103, volume: 180 },
        { time: '2024-01-15 10:05', open: 103, high: 105, low: 103, close: 104, volume: 220 },
        { time: '2024-01-15 10:06', open: 104, high: 106, low: 104, close: 105, volume: 250 },
      ];

      const result = KLineAggregator.aggregateTo5Min(min1Data);

      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });
});
