import { useEffect, useState, useCallback } from 'react';
import { quoteDataCenter } from '../services/QuoteDataCenter';
import { EXCHANGE_RATE_CONFIG } from '../constants/api';

/**
 * 获取 USD/CNY 汇率
 */
export const useExchangeRate = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // 订阅汇率数据
    const unsubscribe = quoteDataCenter.subscribe(
      EXCHANGE_RATE_CONFIG.SYMBOL,
      (quote) => {
        if (quote) {
          setRate(quote.price);
        }
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await quoteDataCenter.refresh();
  }, []);

  return {
    data: rate,
    isLoading,
    refetch,
  };
};
