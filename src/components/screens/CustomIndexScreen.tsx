import React, { useCallback, useState } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QuoteTile } from '@/src/components/features/QuoteTile/QuoteTile';
import { useAllCustomIndices } from '@/src/hooks';
import { useQueryClient } from '@tanstack/react-query';

const goldIndexTypes = ['GC_CNY', 'SPREAD_GC_AU0', 'RATIO_NY_GS', 'RATIO_SH_GS'] as const;
const silverIndexTypes = ['SI_CNY', 'SPREAD_SI_AG0'] as const;

interface QuoteGroupProps {
  title: string;
  indices: readonly string[];
  data: Record<string, any>;
  isLoading: boolean;
}

/**
 * 自定义指数组组件
 */
const QuoteGroup: React.FC<QuoteGroupProps> = ({ title, indices, data, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#007AFF" />
      </View>
    );
  }

  const quotes = indices
    .map(type => data?.[type])
    .filter(Boolean);

  return (
    <View style={styles.groupContainer}>
      <ThemedText style={styles.groupTitle}>{title}</ThemedText>
      <View style={styles.grid}>
        {quotes.map((quote) => (
          <View key={quote.symbol} style={styles.gridItem}>
            <QuoteTile quote={quote} />
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * 自定义指数页面
 * 使用批量请求，大幅减少 API 调用次数
 */
export default function CustomIndexScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  
  // 使用批量请求，一次获取所有自定义指数
  const { data: indices, isLoading } = useAllCustomIndices();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 刷新基础行情和自定义指数
      await queryClient.refetchQueries({ queryKey: ['baseQuotes'] });
      await queryClient.refetchQueries({ queryKey: ['customIndices'] });
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">自定义指数</ThemedText>
        </ThemedView>
        
        <QuoteGroup 
          title="黄金指数" 
          indices={goldIndexTypes} 
          data={indices || {}}
          isLoading={isLoading}
        />
        <View style={styles.divider} />
        <QuoteGroup 
          title="白银指数" 
          indices={silverIndexTypes}
          data={indices || {}}
          isLoading={isLoading}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  groupContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    opacity: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: {
    width: '50%',
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.04)',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
