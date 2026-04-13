import { useEffect, useState } from 'react';
import { quoteDataCenter } from '../services/QuoteDataCenter';
import { Quote } from '../domain/entities';
import { QuoteCalculator } from '../domain/services/QuoteCalculator';
import { GOLD_SYMBOLS, SILVER_SYMBOLS, PAXGUSDT_GATEIO } from '../constants/api';
import { useExchangeRate } from './useExchangeRate';

// 基础品种代码
const BASE_SYMBOLS = {
  COMEX_GOLD: GOLD_SYMBOLS.COMEX_GOLD,
  COMEX_SILVER: SILVER_SYMBOLS.COMEX_SILVER,
  SHFE_GOLD: GOLD_SYMBOLS.SHFE_GOLD,
  SHFE_SILVER: SILVER_SYMBOLS.SHFE_SILVER,
  PAXG: PAXGUSDT_BINANCE,
};

/**
 * 获取基础行情数据（通过 DataCenter）
 */
export const useBaseQuotes = () => {
  const { data: exchangeRate } = useExchangeRate();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const quoteMap = new Map<string, Quote>();
    const unsubscribes: (() => void)[] = [];
    
    setIsLoading(true);

    // 订阅所有基础品种
    Object.values(BASE_SYMBOLS).forEach(symbol => {
      const unsubscribe = quoteDataCenter.subscribe(symbol, (quote) => {
        if (quote) {
          quoteMap.set(symbol, quote);
        }
        
        // 更新状态
        const currentQuotes: Record<string, Quote> = {};
        quoteMap.forEach((q, s) => {
          currentQuotes[s] = q;
        });
        setQuotes(currentQuotes);
        
        // 检查是否都已加载
        if (quoteMap.size >= Object.keys(BASE_SYMBOLS).length) {
          setIsLoading(false);
        }
      });
      
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  return {
    data: quotes,
    exchangeRate,
    isLoading,
  };
};

/**
 * 获取所有自定义指数
 */
export const useAllCustomIndices = () => {
  const { data: baseQuotes, exchangeRate, isLoading: baseLoading } = useBaseQuotes();
  const [indices, setIndices] = useState<Record<string, Quote>>({});

  useEffect(() => {
    if (baseLoading || !exchangeRate) return;

    const calculator = new QuoteCalculator(exchangeRate);
    const gc = baseQuotes[BASE_SYMBOLS.COMEX_GOLD];
    const si = baseQuotes[BASE_SYMBOLS.COMEX_SILVER];
    const au = baseQuotes[BASE_SYMBOLS.SHFE_GOLD];
    const ag = baseQuotes[BASE_SYMBOLS.SHFE_SILVER];

    const newIndices: Record<string, Quote> = {};

    if (gc) {
      newIndices['GC_CNY'] = calculator.calculateGC_CNY(gc);
    }
    
    if (si) {
      newIndices['SI_CNY'] = calculator.calculateSI_CNY(si);
    }
    
    if (gc && au) {
      newIndices['SPREAD_GC_AU0'] = calculator.calculateSpreadGC_AU0(gc, au);
    }
    
    if (si && ag) {
      newIndices['SPREAD_SI_AG0'] = calculator.calculateSpreadSI_AG0(si, ag);
    }
    
    if (gc && si) {
      newIndices['RATIO_NY_GS'] = calculator.calculateRatioNY_GS(gc, si);
    }
    
    if (au && ag) {
      newIndices['RATIO_SH_GS'] = calculator.calculateRatioSH_GS(au, ag);
    }
    
    const paxg = baseQuotes[BASE_SYMBOLS.PAXG];
    if (paxg) {
      newIndices['PAXG_CNY'] = calculator.calculatePAXG_CNY(paxg);
    }
    
    if (paxg && gc) {
      newIndices['PAXG_SPREAD_GC'] = calculator.calculatePAXGSpreadGC(paxg, gc);
    }

    setIndices(newIndices);
  }, [baseQuotes, exchangeRate, baseLoading]);

  return {
    data: indices,
    isLoading: baseLoading,
  };
};

/**
 * 获取单个自定义指数
 */
export const useCustomIndex = (type: 'GC_CNY' | 'SI_CNY' | 'SPREAD_GC_AU0' | 'SPREAD_SI_AG0' | 'RATIO_NY_GS' | 'RATIO_SH_GS' | 'PAXG_CNY' | 'PAXG_SPREAD_GC') => {
  const { data: indices, isLoading } = useAllCustomIndices();
  
  return {
    data: indices?.[type] || null,
    isLoading,
  };
};
