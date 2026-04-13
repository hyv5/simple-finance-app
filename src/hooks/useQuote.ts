import { useEffect, useState, useCallback } from 'react';
import { quoteDataCenter } from '../services/QuoteDataCenter';
import { Quote } from '../domain/entities';

/**
 * 使用行情数据中心订阅数据
 * @param symbol 品种代码
 * @param enabled 是否启用订阅（默认为 true）
 * @returns 行情数据和加载状态
 */
export const useQuote = (symbol: string, enabled: boolean = true) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !symbol) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 订阅数据
    const unsubscribe = quoteDataCenter.subscribe(symbol, (data) => {
      setQuote(data);
      setIsLoading(false);
    });

    // 组件卸载时取消订阅
    return () => {
      unsubscribe();
    };
  }, [symbol, enabled]);

  // 手动刷新函数
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await quoteDataCenter.refresh();
  }, []);

  return {
    data: quote,
    isLoading,
    refetch,
  };
};

/**
 * 订阅多个行情数据
 * @param symbols 品种代码数组
 * @returns 行情数据数组和加载状态
 */
export const useQuotes = (symbols: string[]) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const symbolsKey = symbols.join(',');

  useEffect(() => {
    if (symbols.length === 0) {
      setQuotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const quoteMap = new Map<string, Quote>();
    const unsubscribes: (() => void)[] = [];

    // 订阅所有品种
    symbols.forEach(symbol => {
      const unsubscribe = quoteDataCenter.subscribe(symbol, (quote) => {
        if (quote) {
          quoteMap.set(symbol, quote);
        } else {
          quoteMap.delete(symbol);
        }
        
        // 更新状态（只包含有数据的品种）
        const currentQuotes = symbols
          .map(s => quoteMap.get(s))
          .filter((q): q is Quote => q !== undefined);
        
        setQuotes(currentQuotes);
        
        // 当所有品种都有数据时，取消加载状态
        if (currentQuotes.length === symbols.length) {
          setIsLoading(false);
        }
      });
      
      unsubscribes.push(unsubscribe);
    });

    // 组件卸载时取消所有订阅
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [symbolsKey]);

  // 手动刷新函数
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await quoteDataCenter.refresh();
  }, []);

  return {
    data: quotes,
    isLoading,
    refetch,
  };
};
