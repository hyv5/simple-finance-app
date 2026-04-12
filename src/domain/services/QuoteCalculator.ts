import { Quote } from '../entities';
import { CONVERSION } from '../../constants/api';
import { getDisplayName } from './QuoteUtils';

/**
 * 自定义指标计算器
 */
export class QuoteCalculator {
  private exchangeRate: number;

  constructor(exchangeRate: number = CONVERSION.USD_CNY_DEFAULT) {
    this.exchangeRate = exchangeRate;
  }

  /**
   * 更新汇率
   */
  setExchangeRate(rate: number): void {
    this.exchangeRate = rate;
  }

  /**
   * 计算国际金(人民币)
   */
  calculateGC_CNY(gc: Quote): Quote {
    const priceCNY = (gc.price * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    const prevPriceCNY = (gc.prevClose * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    const change = priceCNY - prevPriceCNY;

    return {
      symbol: 'GC_CNY',
      name: '国际金(人民币)',
      price: priceCNY,
      change,
      changePercent: (change / prevPriceCNY) * 100,
      high: (gc.high * this.exchangeRate) / CONVERSION.OZ_TO_GRAM,
      low: (gc.low * this.exchangeRate) / CONVERSION.OZ_TO_GRAM,
      open: (gc.open * this.exchangeRate) / CONVERSION.OZ_TO_GRAM,
      prevClose: prevPriceCNY,
      volume: gc.volume,
      amount: this.exchangeRate,
      time: gc.time,
    };
  }

  /**
   * 计算国际银(人民币)
   */
  calculateSI_CNY(si: Quote): Quote {
    const siUsdPrice = si.price / 1000;
    const priceCNY = (siUsdPrice * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    
    const prevSiUsdPrice = si.prevClose / 1000;
    const prevPriceCNY = (prevSiUsdPrice * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    const change = priceCNY - prevPriceCNY;

    return {
      symbol: 'SI_CNY',
      name: '国际银(人民币)',
      price: priceCNY,
      change,
      changePercent: (change / prevPriceCNY) * 100,
      high: (si.high / 1000 * this.exchangeRate) / CONVERSION.OZ_TO_GRAM,
      low: (si.low / 1000 * this.exchangeRate) / CONVERSION.OZ_TO_GRAM,
      open: (si.open / 1000 * this.exchangeRate) / CONVERSION.OZ_TO_GRAM,
      prevClose: prevPriceCNY,
      volume: si.volume,
      amount: this.exchangeRate,
      time: si.time,
    };
  }

  /**
   * 计算外-内金差价
   */
  calculateSpreadGC_AU0(gc: Quote, au: Quote): Quote {
    const gcPriceCNY = (gc.price * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    const spread = gcPriceCNY - au.price;
    
    const prevGcPriceCNY = (gc.prevClose * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    const prevSpread = prevGcPriceCNY - au.prevClose;
    
    const change = spread - prevSpread;

    return {
      symbol: 'SPREAD_GC_AU0',
      name: '外-内金差价',
      price: spread,
      change,
      changePercent: prevSpread !== 0 ? (change / Math.abs(prevSpread)) * 100 : 0,
      high: Math.max(spread, prevSpread),
      low: Math.min(spread, prevSpread),
      open: prevSpread,
      prevClose: prevSpread,
      volume: 0,
      amount: this.exchangeRate,
      time: gc.time,
    };
  }

  /**
   * 计算外-内银差价
   */
  calculateSpreadSI_AG0(si: Quote, ag: Quote): Quote {
    const siUsdPrice = si.price / 1000;
    const siPriceCNY = (siUsdPrice * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    const spread = siPriceCNY - (ag.price / CONVERSION.KG_TO_GRAM);
    
    const prevSiUsdPrice = si.prevClose / 1000;
    const prevSiPriceCNY = (prevSiUsdPrice * this.exchangeRate) / CONVERSION.OZ_TO_GRAM;
    const prevSpread = prevSiPriceCNY - (ag.prevClose / CONVERSION.KG_TO_GRAM);
    
    const change = spread - prevSpread;

    return {
      symbol: 'SPREAD_SI_AG0',
      name: '外-内银差价',
      price: spread,
      change,
      changePercent: prevSpread !== 0 ? (change / Math.abs(prevSpread)) * 100 : 0,
      high: Math.max(spread, prevSpread),
      low: Math.min(spread, prevSpread),
      open: prevSpread,
      prevClose: prevSpread,
      volume: 0,
      amount: this.exchangeRate,
      time: si.time,
    };
  }

  /**
   * 计算纽约金银比
   */
  calculateRatioNY_GS(gc: Quote, si: Quote): Quote {
    const siUsdPrice = si.price / 1000;
    const ratio = gc.price / siUsdPrice;
    
    const prevSiUsdPrice = si.prevClose / 1000;
    const prevRatio = gc.prevClose / prevSiUsdPrice;
    
    const change = ratio - prevRatio;

    return {
      symbol: 'RATIO_NY_GS',
      name: '纽约金银比',
      price: ratio,
      change,
      changePercent: prevRatio !== 0 ? (change / prevRatio) * 100 : 0,
      high: ratio,
      low: ratio,
      open: prevRatio,
      prevClose: prevRatio,
      volume: 0,
      amount: this.exchangeRate,
      time: gc.time,
    };
  }

  /**
   * 计算上海金银比
   */
  calculateRatioSH_GS(au: Quote, ag: Quote): Quote {
    const ratio = (au.price / ag.price) * 1000;
    const prevRatio = (au.prevClose / ag.prevClose) * 1000;
    const change = ratio - prevRatio;

    return {
      symbol: 'RATIO_SH_GS',
      name: '上海金银比(千倍)',
      price: ratio,
      change,
      changePercent: prevRatio !== 0 ? (change / prevRatio) * 100 : 0,
      high: ratio,
      low: ratio,
      open: prevRatio,
      prevClose: prevRatio,
      volume: 0,
      amount: 0,
      time: au.time,
    };
  }
}
