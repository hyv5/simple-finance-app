import { KLineParser } from '@/src/domain/parsers/KLineParser';

describe('KLineParser', () => {
  describe('extractJsonArray', () => {
    it('should extract array from standard JSON response', () => {
      const data = 'var _data = [{"d":"2024-01-15 10:00","o":100,"h":105,"l":98,"c":102,"v":1000}];';
      const result = KLineParser.extractJsonArray(data);
      
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });

    it('should extract array from East Money fund format', () => {
      const data = 'var Data_netWorthTrend = [{"x":1705312800000,"y":1.523}];';
      const result = KLineParser.extractJsonArray(data);
      
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });

    it('should handle nested object format', () => {
      const data = '{"minLine_1d": [{"t":"10:00","p":100}]}';
      const result = KLineParser.extractJsonArray(data);
      
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });

    it('should return null for invalid data', () => {
      const result = KLineParser.extractJsonArray('invalid data');
      expect(result).toBeNull();
    });
  });

  describe('flattenNestedData', () => {
    it('should flatten day-grouped data', () => {
      const rawData = [
        { d: '2024-01-15', m: [['10:00', 100, 105, 98, 102, 1000]] },
        { d: '2024-01-16', m: [['10:00', 102, 108, 101, 106, 2000]] }
      ];
      const result = KLineParser.flattenNestedData(rawData);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toContain('2024-01-15 10:00');
    });

    it('should handle object format within arrays', () => {
      const rawData = [
        { d: '2024-01-15', m: [{ t: '10:00', o: 100, h: 105, l: 98, c: 102, v: 1000 }] }
      ];
      const result = KLineParser.flattenNestedData(rawData);
      
      expect(result).toHaveLength(1);
    });
  });

  describe('parsePoint', () => {
    it('should parse array format point', () => {
      const data = ['2024-01-15 10:00', 100, 105, 98, 102, 1000];
      const result = KLineParser.parsePoint(data);
      
      expect(result).toEqual({
        time: '2024-01-15 10:00',
        open: 100,
        high: 105,
        low: 98,
        close: 102,
        volume: 1000
      });
    });

    it('should parse object format point', () => {
      const data = { d: '2024-01-15 10:00', o: 100, h: 105, l: 98, c: 102, v: 1000 };
      const result = KLineParser.parsePoint(data);
      
      expect(result).toEqual({
        time: '2024-01-15 10:00',
        open: 100,
        high: 105,
        low: 98,
        close: 102,
        volume: 1000
      });
    });

    it('should return null for invalid data', () => {
      const result = KLineParser.parsePoint([1, 2, 3]);
      expect(result).toBeNull();
    });
  });

  describe('parse', () => {
    it('should parse complete K-line data', () => {
      const data = JSON.stringify([
        { d: '2024-01-15', m: [
          ['10:00', 100, 105, 98, 102, 1000],
          ['10:05', 102, 106, 101, 104, 1500]
        ]}
      ]);
      
      const result = KLineParser.parse(data);
      
      expect(result).toHaveLength(2);
      expect(result[0].time).toContain('2024-01-15 10:00');
      expect(result[0].open).toBe(100);
      expect(result[1].close).toBe(104);
    });

    it('should return empty array for invalid data', () => {
      const result = KLineParser.parse('invalid');
      expect(result).toEqual([]);
    });
  });
});
