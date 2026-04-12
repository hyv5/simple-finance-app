import { SILVER_SYMBOLS } from '@/src/constants/api';
import { QuoteTile } from '@/src/components/features/QuoteTile/QuoteTile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExchangeRate, useQuotes, useAllCustomIndices } from '@/src/hooks';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

function ExchangeRateDisplay() {
  const { data: rate, isLoading } = useExchangeRate();

  if (isLoading || !rate) return null;

  return (
    <View style={styles.rateContainer}>
      <ThemedText style={styles.rateLabel}>USD/CNH</ThemedText>
      <ThemedText style={styles.rateValue}>{rate.toFixed(4)}</ThemedText>
    </View>
  );
}

function SilverPriceList() {
  // 批量获取白银相关的基础行情
  const { data: quotes, isLoading: loadingQuotes } = useQuotes([
    SILVER_SYMBOLS.COMEX_SILVER,
    SILVER_SYMBOLS.SHFE_SILVER,
  ]);
  
  // 批量获取所有自定义指数（内部共享基础数据请求）
  const { data: indices, isLoading: loadingIndices } = useAllCustomIndices();

  if (loadingQuotes || loadingIndices) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const comexSilver = quotes?.find(q => q.symbol === SILVER_SYMBOLS.COMEX_SILVER);
  const shfeSilver = quotes?.find(q => q.symbol === SILVER_SYMBOLS.SHFE_SILVER);
  const siCny = indices?.['SI_CNY'];
  const spread = indices?.['SPREAD_SI_AG0'];

  return (
    <View style={styles.listContainer}>
      {comexSilver && (
        <View style={styles.cardWrapper}>
          <QuoteTile quote={comexSilver} />
        </View>
      )}
      {shfeSilver && (
        <View style={styles.cardWrapper}>
          <QuoteTile quote={shfeSilver} />
        </View>
      )}
      {siCny && (
        <View style={styles.cardWrapper}>
          <QuoteTile quote={siCny} />
        </View>
      )}
      {spread && (
        <View style={styles.cardWrapper}>
          <QuoteTile quote={spread} />
        </View>
      )}
    </View>
  );
}

export default function SilverScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">白银行情</ThemedText>
          <ExchangeRateDisplay />
        </ThemedView>
        <SilverPriceList />
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
    paddingBottom: 20,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
});
