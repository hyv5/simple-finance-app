import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ProfessionalKLineChart } from '@/src/components/features/KLineChart';
import { KLine } from '@/src/domain/entities';

/**
 * ProfessionalKLineChart 使用示例
 * 
 * 这个组件展示如何使用新的专业 K 线图表
 * 包含 MA、MACD、KDJ、RSI 等技术指标
 */

// 示例数据
const sampleData: KLine[] = [
  {
    time: '2024-01-01 09:30',
    open: 2850.50,
    high: 2860.00,
    low: 2840.00,
    close: 2855.00,
    volume: 15000,
  },
  {
    time: '2024-01-01 09:35',
    open: 2855.00,
    high: 2865.00,
    low: 2850.00,
    close: 2860.00,
    volume: 18000,
  },
  {
    time: '2024-01-01 09:40',
    open: 2860.00,
    high: 2868.00,
    low: 2855.00,
    close: 2858.00,
    volume: 12000,
  },
  // ... 更多数据
];

export default function ProfessionalChartExample() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.chartContainer}>
          <ProfessionalKLineChart 
            data={sampleData}
            isLoading={false}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartContainer: {
    height: 500,
    margin: 16,
  },
});
