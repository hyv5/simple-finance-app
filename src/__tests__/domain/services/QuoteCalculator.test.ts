import { QuoteCalculator } from '@/src/domain/services/QuoteCalculator';
import { Quote } from '@/src/domain/entities';

describe('QuoteCalculator', () => {
  const mockGCQuote: Quote = {
    symbol: 'hf_GC',
    name: '国际黄金',
    price: 2850.00,
    change: 10.00,
    changePercent: 0.35,
    high: 2860.00,
    low: 2840.00,
    open: 2845.00,
    prevClose: 2840.00,
    volume: 100000,
    amount: 0,
    time: '2024-01-15 14:30:00',
  };

  const mockSIQuote: Quote = {
    symbol: 'hf_SI',
    name: '国际白银',
    price: 32000, // 新浪返回的是 1000 倍
    change: 100,
    changePercent: 0.31,
    high: 32200,
    low: 31800,
    open: 31900,
    prevClose: 31900,
    volume: 50000,
    amount: 0,
    time: '2024-01-15 14:30:00',
  };

  const mockAUQuote: Quote = {
    symbol: 'nf_AU0',
    name: '沪金主力',
    price: 480.00,
    change: 2.00,
    changePercent: 0.42,
    high: 482.00,
    low: 478.00,
    open: 479.00,
    prevClose: 478.00,
    volume: 10000,
    amount: 0,
    time: '2024-01-15 14:30:00',
  };

  const mockAGQuote: Quote = {
    symbol: 'nf_AG0',
    name: '沪银主力',
    price: 6000, // 元/千克
    change: 50,
    changePercent: 0.84,
    high: 6050,
    low: 5950,
    open: 5980,
    prevClose: 5950,
    volume: 20000,
    amount: 0,
    time: '2024-01-15 14:30:00',
  };

  describe('calculateGC_CNY', () => {
    it('should calculate international gold in CNY correctly', () => {
      const calculator = new QuoteCalculator(7.25);
      const result = calculator.calculateGC_CNY(mockGCQuote);

      // 2850 * 7.25 / 31.1035 = ~664.18
      expect(result.symbol).toBe('GC_CNY');
      expect(result.name).toBe('国际金(人民币)');
      expect(result.price).toBeCloseTo(664.18, 0);
      expect(result.change).toBeDefined();
      expect(result.changePercent).toBeDefined();
    });

    it('should use provided exchange rate', () => {
      const calculator1 = new QuoteCalculator(7.0);
      const calculator2 = new QuoteCalculator(7.5);

      const result1 = calculator1.calculateGC_CNY(mockGCQuote);
      const result2 = calculator2.calculateGC_CNY(mockGCQuote);

      expect(result2.price).toBeGreaterThan(result1.price);
    });
  });

  describe('calculateSI_CNY', () => {
    it('should calculate international silver in CNY correctly', () => {
      const calculator = new QuoteCalculator(7.25);
      const result = calculator.calculateSI_CNY(mockSIQuote);

      // 32 * 7.25 / 31.1035 = ~7.45
      expect(result.symbol).toBe('SI_CNY');
      expect(result.name).toBe('国际银(人民币)');
      expect(result.price).toBeGreaterThan(0);
    });
  });

  describe('calculateSpreadGC_AU0', () => {
    it('should calculate gold spread correctly', () => {
      const calculator = new QuoteCalculator(7.25);
      const result = calculator.calculateSpreadGC_AU0(mockGCQuote, mockAUQuote);

      expect(result.symbol).toBe('SPREAD_GC_AU0');
      expect(result.name).toBe('外-内金差价');
      // 国际金换算后 - 沪金 = 差价
      expect(result.price).toBeDefined();
    });

    it('should calculate change based on previous spread', () => {
      const calculator = new QuoteCalculator(7.25);
      const result = calculator.calculateSpreadGC_AU0(mockGCQuote, mockAUQuote);

      expect(result.change).toBeDefined();
      expect(result.changePercent).toBeDefined();
    });
  });

  describe('calculateSpreadSI_AG0', () => {
    it('should calculate silver spread correctly', () => {
      const calculator = new QuoteCalculator(7.25);
      const result = calculator.calculateSpreadSI_AG0(mockSIQuote, mockAGQuote);

      expect(result.symbol).toBe('SPREAD_SI_AG0');
      expect(result.name).toBe('外-内银差价');
      expect(result.price).toBeDefined();
    });
  });

  describe('calculateRatioNY_GS', () => {
    it('should calculate NY gold/silver ratio correctly', () => {
      const calculator = new QuoteCalculator(7.25);
      const result = calculator.calculateRatioNY_GS(mockGCQuote, mockSIQuote);

      expect(result.symbol).toBe('RATIO_NY_GS');
      expect(result.name).toBe('纽约金银比');
      // 2850 / 32 = ~89
      expect(result.price).toBeCloseTo(89, 0);
    });
  });

  describe('calculateRatioSH_GS', () => {
    it('should calculate SH gold/silver ratio correctly', () => {
      const calculator = new QuoteCalculator(7.25);
      const result = calculator.calculateRatioSH_GS(mockAUQuote, mockAGQuote);

      expect(result.symbol).toBe('RATIO_SH_GS');
      expect(result.name).toBe('上海金银比(千倍)');
      // (480 / 6000) * 1000 = 80
      expect(result.price).toBeCloseTo(80, 0);
    });
  });

  describe('setExchangeRate', () => {
    it('should update exchange rate dynamically', () => {
      const calculator = new QuoteCalculator(7.0);
      const result1 = calculator.calculateGC_CNY(mockGCQuote);

      calculator.setExchangeRate(7.5);
      const result2 = calculator.calculateGC_CNY(mockGCQuote);

      expect(result2.price).toBeGreaterThan(result1.price);
    });
  });
});
