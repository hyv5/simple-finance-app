import {
  parseQuote,
  parseGlobalFutureQuote,
  parseStockQuote,
  parseInnerFutureQuote,
  parseFXQuote,
  parseFundQuote,
} from '@/src/domain/parsers/QuoteParser';

describe('QuoteParser', () => {
  describe('parseGlobalFutureQuote', () => {
    it('should parse COMEX gold quote correctly', () => {
      // 模拟新浪返回的国际期货数据格式
      const rawData = '2850.50,10.50,2840.00,2860.00,2835.00,2840.00,14:30:00,2840.00,2845.00,100000,0,0,2024-01-15,COMEX黄金,0,0,0,0';
      const result = parseGlobalFutureQuote('hf_GC', rawData);

      expect(result.symbol).toBe('hf_GC');
      expect(result.name).toBe('国际黄金'); // 应该使用映射表中的名称
      expect(result.price).toBe(2850.50);
      expect(result.change).toBe(10.50);
      expect(result.prevClose).toBe(2840.00);
      expect(result.high).toBe(2860.00);
      expect(result.low).toBe(2835.00);
      expect(result.open).toBe(2845.00);
      expect(result.volume).toBe(100000);
    });

    it('should handle price zero with change value', () => {
      const rawData = '0,5.00,2840.00,2860.00,2835.00,2840.00,14:30:00,2840.00,2845.00,100000,0,0,2024-01-15,TEST,0,0,0,0';
      const result = parseGlobalFutureQuote('hf_GC', rawData);

      expect(result.price).toBe(2845.00); // 应该用开盘价+涨跌额
      expect(result.change).toBe(5.00);
    });
  });

  describe('parseStockQuote', () => {
    it('should parse stock quote correctly', () => {
      // 模拟新浪返回的股票数据格式
      const rawData = '测试股票,10.00,9.80,10.50,11.00,9.50,0,0,1000000,1050000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2024-01-15,14:30:00';
      const result = parseStockQuote('sh600000', rawData);

      expect(result.symbol).toBe('sh600000');
      expect(result.name).toBe('测试股票');
      expect(result.price).toBe(10.50);
      expect(result.prevClose).toBe(9.80);
      expect(result.change).toBe(0.70);
      expect(result.changePercent).toBeCloseTo(7.14, 1);
      expect(result.high).toBe(11.00);
      expect(result.low).toBe(9.50);
      expect(result.open).toBe(10.00);
      expect(result.volume).toBe(1000000);
      expect(result.amount).toBe(1050000);
    });
  });

  describe('parseInnerFutureQuote', () => {
    it('should parse SHFE gold quote correctly', () => {
      // 模拟新浪返回的国内期货数据格式
      const rawData = '沪金主力,143000,480.00,482.00,478.00,479.00,475.00,481.00,480.50,0,479.00,100000,0,0,5000,0,0,2024-01-15';
      const result = parseInnerFutureQuote('nf_AU0', rawData);

      expect(result.symbol).toBe('nf_AU0');
      expect(result.name).toBe('沪金主力');
      expect(result.price).toBe(480.50);
      expect(result.prevClose).toBe(479.00);
      expect(result.change).toBeCloseTo(1.50, 1);
      expect(result.high).toBe(482.00);
      expect(result.low).toBe(478.00);
      expect(result.open).toBe(480.00);
      expect(result.volume).toBe(5000);
    });

    it('should handle time format conversion', () => {
      const rawData = '测试,143000,480.00,482.00,478.00,479.00,475.00,481.00,480.50,0,479.00,100000,0,0,5000,0,0,2024-01-15';
      const result = parseInnerFutureQuote('nf_AU0', rawData);

      expect(result.time).toContain('14:30:00');
    });
  });

  describe('parseFXQuote', () => {
    it('should parse USD/CNY exchange rate correctly', () => {
      const rawData = '2024-01-15 14:30:00,7.2450,7.2480,7.2400,0.0050,7.2420,7.2500,7.2380,7.2450,0,0,0';
      const result = parseFXQuote('fx_susdcny', rawData);

      expect(result.symbol).toBe('fx_susdcny');
      expect(result.price).toBe(7.2450);
      expect(result.prevClose).toBe(7.2400);
      expect(result.change).toBe(0.0050);
      expect(result.high).toBe(7.2500);
      expect(result.low).toBe(7.2380);
      expect(result.open).toBe(7.2420);
    });
  });

  describe('parseFundQuote', () => {
    it('should parse fund quote correctly', () => {
      const rawData = '测试基金,1.5230,2.1450,1.5120,2024-01-15,0';
      const result = parseFundQuote('f_000001', rawData);

      expect(result.symbol).toBe('f_000001');
      expect(result.name).toBe('测试基金');
      expect(result.price).toBe(1.5230);
      expect(result.prevClose).toBe(1.5120);
      expect(result.change).toBeCloseTo(0.011, 2);
      expect(result.changePercent).toBeCloseTo(0.73, 1);
    });
  });

  describe('parseQuote', () => {
    it('should dispatch to correct parser based on symbol prefix', () => {
      const hfData = '2850.50,10.50,2840.00,2860.00,2835.00,2840.00,14:30:00,2840.00,2845.00,100000,0,0,2024-01-15,TEST,0,0,0,0';
      const hfResult = parseQuote('hf_GC', hfData);
      expect(hfResult.symbol).toBe('hf_GC');

      const shData = '测试,10.00,9.80,10.50,11.00,9.50,0,0,1000000,1050000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2024-01-15,14:30:00';
      const shResult = parseQuote('sh600000', shData);
      expect(shResult.symbol).toBe('sh600000');

      const nfData = '测试,143000,480.00,482.00,478.00,479.00,475.00,481.00,480.50,0,479.00,100000,0,0,5000,0,0,2024-01-15';
      const nfResult = parseQuote('nf_AU0', nfData);
      expect(nfResult.symbol).toBe('nf_AU0');
    });

    it('should throw error for empty data', () => {
      expect(() => parseQuote('hf_GC', '')).toThrow('Empty data');
    });

    it('should throw error for unknown symbol type', () => {
      expect(() => parseQuote('unknown_symbol', 'test,data')).toThrow('Unknown symbol type');
    });
  });
});
