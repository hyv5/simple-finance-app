import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { QuoteTile } from './QuoteTile';
import { useQuote } from '@/src/hooks/useQuote';
import { Quote } from '@/src/domain/entities';

interface QuoteTileContainerProps {
  symbol: string;
  quote?: Quote;
}

/**
 * QuoteTileContainer - 业务逻辑容器
 * 处理数据获取和导航逻辑
 * 
 * 注意：如果传入了 externalQuote，则不会发起网络请求
 * 只有未传入数据时才会使用 useQuote 获取
 */
export const QuoteTileContainer: React.FC<QuoteTileContainerProps> = ({ 
  symbol, 
  quote: externalQuote 
}) => {
  const router = useRouter();
  
  // 只有当没有外部数据时才发起请求
  const shouldFetch = !externalQuote;
  const { data, isLoading } = useQuote(symbol, shouldFetch);

  const quote = externalQuote || data;

  if ((shouldFetch && isLoading) || !quote) {
    return null;
  }

  const handlePress = () => {
    router.push(`/details/${symbol}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <QuoteTile quote={quote} />
    </Pressable>
  );
};
