import { KLine } from '../entities';
import { CONVERSION } from '../../constants/api';

/**
 * K线数据计算器 - 处理自定义指标的 K 线计算
 */
export class KLineCalculator {
  private exchangeRate: number;

  constructor(exchangeRate: number = CONVERSION.USD_CNY_DEFAULT) {
    this.exchangeRate = exchangeRate;
  }

  setExchangeRate(rate: number): void {
    this.exchangeRate = rate;
  }

  /**
   * 计算换算后的国际金 K 线
   */
  calculateGC_CNY(gcData: KLine[]): KLine[] {
    const convert = (p: number) => (p * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    
    return gcData.map(d => ({
      time: d.time,
      open: convert(d.open),
      high: convert(d.high),
      low: convert(d.low),
      close: convert(d.close),
      volume: d.volume,
    }));
  }

  /**
   * 计算换算后的国际银 K 线
   */
  calculateSI_CNY(siData: KLine[]): KLine[] {
    const convert = (p: number) => (p / 1000 * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    
    return siData.map(d => ({
      time: d.time,
      open: convert(d.open),
      high: convert(d.high),
      low: convert(d.low),
      close: convert(d.close),
      volume: d.volume,
    }));
  }

  /**
   * 计算外-内金差价 K 线
   */
  calculateSpreadGC_AU0(gcData: KLine[], auData: KLine[]): KLine[] {
    return this.calculateSpread(gcData, auData, true);
  }

  /**
   * 计算外-内银差价 K 线
   */
  calculateSpreadSI_AG0(siData: KLine[], agData: KLine[]): KLine[] {
    return this.calculateSpread(siData, agData, false);
  }

  /**
   * 通用差价计算
   */
  private calculateSpread(
    foreignData: KLine[],
    domesticData: KLine[],
    isGold: boolean
  ): KLine[] {
    const domesticMap = this.buildTimeMap(domesticData);
    const result: KLine[] = [];

    const convertForeign = isGold 
      ? (p: number) => (p * this.exchangeRate) / CONVERSION.OZ_TO_GRAM
      : (p: number) => (p / 1000 * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    
    const convertDomestic = (p: number) => p / CONVERSION.KG_TO_GRAM;

    foreignData.forEach(foreign => {
      const domestic = domesticMap.get(this.normalizeTime(foreign.time));
      if (domestic) {
        result.push({
          time: foreign.time,
          open: convertForeign(foreign.open) - convertDomestic(domestic.open),
          high: convertForeign(foreign.high) - convertDomestic(domestic.low),
          low: convertForeign(foreign.low) - convertDomestic(domestic.high),
          close: convertForeign(foreign.close) - convertDomestic(domestic.close),
          volume: 0,
        });
      }
    });

    return result;
  }

  /**
   * 计算纽约金银比 K 线
   */
  calculateRatioNY_GS(gcData: KLine[], siData: KLine[]): KLine[] {
    const siMap = this.buildTimeMap(siData);
    const result: KLine[] = [];

    gcData.forEach(gc => {
      const si = siMap.get(this.normalizeTime(gc.time));
      if (si && si.close > 0) {
        result.push({
          time: gc.time,
          open: gc.open / (si.open / 1000),
          high: gc.high / (si.low / 1000),
          low: gc.low / (si.high / 1000),
          close: gc.close / (si.close / 1000),
          volume: 0,
        });
      }
    });

    return result;
  }

  /**
   * 计算上海金银比 K 线
   */
  calculateRatioSH_GS(auData: KLine[], agData: KLine[]): KLine[] {
    const agMap = this.buildTimeMap(agData);
    const result: KLine[] = [];

    auData.forEach(au => {
      const ag = agMap.get(this.normalizeTime(au.time));
      if (ag && ag.close > 0) {
        result.push({
          time: au.time,
          open: (au.open / ag.open) * 1000,
          high: (au.high / ag.low) * 1000,
          low: (au.low / ag.high) * 1000,
          close: (au.close / ag.close) * 1000,
          volume: 0,
        });
      }
    });

    return result;
  }

  /**
   * 构建时间映射表
   */
  private buildTimeMap(data: KLine[]): Map<number, KLine> {
    const map = new Map<number, KLine>();
    data.forEach(d => {
      const ts = this.normalizeTime(d.time);
      map.set(ts, d);
    });
    return map;
  }

  /**
   * 标准化时间
   */
  private normalizeTime(timeStr: string): number {
    const date = new Date(timeStr);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }
}
