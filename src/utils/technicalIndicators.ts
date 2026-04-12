/**
 * 技术指标计算器
 * 为 KLineView 计算 MA、MACD、KDJ、RSI 等指标
 */

import { KLine } from '../domain/entities';

export interface KLineWithIndicators extends KLine {
  // MA 指标
  ma5?: number;
  ma10?: number;
  ma20?: number;
  ma60?: number;
  
  // MACD 指标
  macdDif?: number;
  macdDea?: number;
  macdBar?: number;
  
  // KDJ 指标
  kdjK?: number;
  kdjD?: number;
  kdjJ?: number;
  
  // RSI 指标
  rsi6?: number;
  rsi12?: number;
  rsi24?: number;
  
  // 成交量 MA
  maVolume5?: number;
  maVolume10?: number;
}

/**
 * 计算简单移动平均线 (SMA)
 */
const calculateSMA = (data: number[], period: number): number | undefined => {
  if (data.length < period) return undefined;
  const sum = data.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
};

/**
 * 计算指数移动平均线 (EMA)
 */
const calculateEMA = (data: number[], period: number): number[] => {
  const multiplier = 2 / (period + 1);
  const ema: number[] = [];
  
  // 第一个 EMA 使用 SMA
  let prevEMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(data[i]);
    } else if (i === period - 1) {
      ema.push(prevEMA);
    } else {
      const currentEMA = (data[i] - prevEMA) * multiplier + prevEMA;
      ema.push(currentEMA);
      prevEMA = currentEMA;
    }
  }
  
  return ema;
};

/**
 * 计算 MA 指标
 */
export const calculateMA = (data: KLine[]): KLineWithIndicators[] => {
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);
  
  return data.map((item, index) => {
    const closesSlice = closes.slice(0, index + 1);
    const volumesSlice = volumes.slice(0, index + 1);
    
    return {
      ...item,
      ma5: calculateSMA(closesSlice, 5),
      ma10: calculateSMA(closesSlice, 10),
      ma20: calculateSMA(closesSlice, 20),
      ma60: calculateSMA(closesSlice, 60),
      maVolume5: calculateSMA(volumesSlice, 5),
      maVolume10: calculateSMA(volumesSlice, 10),
    };
  });
};

/**
 * 计算 MACD 指标
 */
export const calculateMACD = (
  data: KLineWithIndicators[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): KLineWithIndicators[] => {
  const closes = data.map(d => d.close);
  
  // 计算快速和慢速 EMA
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  
  // 计算 DIF
  const dif = fastEMA.map((fast, i) => fast - slowEMA[i]);
  
  // 计算 DEA (DIF 的 EMA)
  const dea = calculateEMA(dif, signalPeriod);
  
  // 计算 MACD 柱状图 (BAR)
  const bar = dif.map((d, i) => (d - dea[i]) * 2);
  
  return data.map((item, index) => ({
    ...item,
    macdDif: dif[index],
    macdDea: dea[index],
    macdBar: bar[index],
  }));
};

/**
 * 计算 RSV (用于 KDJ)
 */
const calculateRSV = (closes: number[], lows: number[], highs: number[], period: number, index: number): number => {
  if (index < period - 1) return 50;
  
  const sliceLow = lows.slice(index - period + 1, index + 1);
  const sliceHigh = highs.slice(index - period + 1, index + 1);
  
  const lowest = Math.min(...sliceLow);
  const highest = Math.max(...sliceHigh);
  const current = closes[index];
  
  if (highest === lowest) return 50;
  return ((current - lowest) / (highest - lowest)) * 100;
};

/**
 * 计算 KDJ 指标
 */
export const calculateKDJ = (
  data: KLineWithIndicators[],
  period: number = 9,
  kSmooth: number = 3,
  dSmooth: number = 3
): KLineWithIndicators[] => {
  const closes = data.map(d => d.close);
  const lows = data.map(d => d.low);
  const highs = data.map(d => d.high);
  
  const kValues: number[] = [];
  const dValues: number[] = [];
  let prevK = 50;
  let prevD = 50;
  
  for (let i = 0; i < data.length; i++) {
    const rsv = calculateRSV(closes, lows, highs, period, i);
    
    // K = (2/3) * 昨日K + (1/3) * 当日RSV
    const k = (2 / 3) * prevK + (1 / 3) * rsv;
    // D = (2/3) * 昨日D + (1/3) * 当日K
    const d = (2 / 3) * prevD + (1 / 3) * k;
    // J = 3K - 2D
    const j = 3 * k - 2 * d;
    
    kValues.push(k);
    dValues.push(d);
    prevK = k;
    prevD = d;
  }
  
  return data.map((item, index) => ({
    ...item,
    kdjK: kValues[index],
    kdjD: dValues[index],
    kdjJ: kValues[index] * 3 - dValues[index] * 2,
  }));
};

/**
 * 计算 RSI 指标
 */
export const calculateRSI = (
  data: KLineWithIndicators[],
  periods: number[] = [6, 12, 24]
): KLineWithIndicators[] => {
  const closes = data.map(d => d.close);
  const changes: number[] = [];
  
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  
  const rsiResults: Record<string, number[]> = {};
  
  periods.forEach(period => {
    const rsi: number[] = [];
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      
      if (i < period) {
        // 初始化
        if (change > 0) avgGain += change;
        else avgLoss += Math.abs(change);
        
        if (i === period - 1) {
          avgGain /= period;
          avgLoss /= period;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsi.push(100 - (100 / (1 + rs)));
        } else {
          rsi.push(50); // 默认值
        }
      } else {
        // 平滑移动平均
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;
        
        avgGain = ((avgGain * (period - 1)) + gain) / period;
        avgLoss = ((avgLoss * (period - 1)) + loss) / period;
        
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    
    // 第一个数据点 RSI 设为 50
    rsi.unshift(50);
    rsiResults[`rsi${period}`] = rsi;
  });
  
  return data.map((item, index) => ({
    ...item,
    rsi6: rsiResults['rsi6']?.[index],
    rsi12: rsiResults['rsi12']?.[index],
    rsi24: rsiResults['rsi24']?.[index],
  }));
};

/**
 * 计算所有指标
 */
export const calculateAllIndicators = (data: KLine[]): KLineWithIndicators[] => {
  let result = calculateMA(data);
  result = calculateMACD(result);
  result = calculateKDJ(result);
  result = calculateRSI(result);
  return result;
};

/**
 * 转换为 KLineView 数据格式
 */
export const formatForKLineView = (data: KLineWithIndicators[]) => {
  return data.map((item, index) => ({
    id: new Date(item.time).getTime(),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    vol: item.volume,
    dateString: item.time,
    // MA 数据
    maList: [
      item.ma5,
      item.ma10,
      item.ma20,
      item.ma60,
    ].filter(Boolean),
    maVolumeList: [
      item.maVolume5,
      item.maVolume10,
    ].filter(Boolean),
    // MACD 数据
    macdDif: item.macdDif,
    macdDea: item.macdDea,
    macdBar: item.macdBar,
    // KDJ 数据
    kdjK: item.kdjK,
    kdjD: item.kdjD,
    kdjJ: item.kdjJ,
    // RSI 数据
    rsi: item.rsi6,
  }));
};
