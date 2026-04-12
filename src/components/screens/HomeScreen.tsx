import React, { useCallback, useState } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QuoteTileContainer } from '@/src/components/features/QuoteTile';
import { useQuotes } from '@/src/hooks/useQuote';
import { useExchangeRate } from '@/src/hooks/useExchangeRate';
import { GOLD_SYMBOLS, SILVER_SYMBOLS } from '@/src/constants/api';
import { useQueryClient } from '@tanstack/react-query';

const goldSymbols = [GOLD_SYMBOLS.COMEX_GOLD, GOLD_SYMBOLS.SHFE_GOLD];
const silverSymbols = [SILVER_SYMBOLS.COMEX_SILVER, SILVER_SYMBOLS.SHFE_SILVER];

/**
 * 汇率显示组件
 */
const ExchangeRateDisplay: React.FC = () => {
  const { data: rate, isLoading } = useExchangeRate();

  if (isLoading || !rate) return null;

  return (
    <View style={styles.rateContainer}>
      <ThemedText style={styles.rateLabel}>USD/CNY</ThemedText>
      <ThemedText style={styles.rateValue}>{rate.toFixed(4)}</ThemedText>
    </View>
  );
};

/**
 * 行情组组件
 */
interface QuoteGroupProps {
  title: string;
  symbols: string[];
}

const QuoteGroup: React.FC<QuoteGroupProps> = ({ title, symbols }) => {
  const { data: quotes, isLoading } = useQuotes(symbols);

  if (isLoading && !quotes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.groupContainer}>
      <ThemedText style={styles.groupTitle}>{title}</ThemedText>
      <View style={styles.grid}>
        {quotes?.map((quote) => (
          <View key={quote.symbol} style={styles.gridItem}>
            <QuoteTileContainer symbol={quote.symbol} quote={quote} />
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * 首页 - 期货行情
 */
export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ['quote'] });
      await queryClient.refetchQueries({ queryKey: ['exchangeRate'] });
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
          <ThemedText type="title">期货行情</ThemedText>
          <ExchangeRateDisplay />
        </ThemedView>
        
        <QuoteGroup title="黄金行情" symbols={goldSymbols} />
        <View style={styles.divider} />
        <QuoteGroup title="白银行情" symbols={silverSymbols} />
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
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  rateValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007AFF',
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
