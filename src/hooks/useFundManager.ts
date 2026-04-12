import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const FUND_STORAGE_KEY = '@user_funds';

// 默认基金列表
const DEFAULT_FUNDS = ['sz161226', 'sh518660'];

/**
 * 基金列表管理 Hook
 */
export const useFundManager = () => {
  const queryClient = useQueryClient();

  const { data: funds = [], isLoading } = useQuery<string[]>({
    queryKey: ['funds'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FUND_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // 首次使用，初始化默认基金
      await AsyncStorage.setItem(FUND_STORAGE_KEY, JSON.stringify(DEFAULT_FUNDS));
      return DEFAULT_FUNDS;
    },
  });

  const addFund = useCallback(async (symbol: string): Promise<boolean> => {
    if (funds.includes(symbol)) {
      return false;
    }
    
    const newFunds = [...funds, symbol];
    await AsyncStorage.setItem(FUND_STORAGE_KEY, JSON.stringify(newFunds));
    queryClient.setQueryData(['funds'], newFunds);
    return true;
  }, [funds, queryClient]);

  const removeFund = useCallback(async (symbol: string): Promise<void> => {
    const newFunds = funds.filter(f => f !== symbol);
    await AsyncStorage.setItem(FUND_STORAGE_KEY, JSON.stringify(newFunds));
    queryClient.setQueryData(['funds'], newFunds);
  }, [funds, queryClient]);

  return {
    funds,
    isLoading,
    addFund,
    removeFund,
  };
};
