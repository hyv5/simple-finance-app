import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useKLine } from '@/src/hooks';
import { KLineType } from '@/src/constants/api';
import { KLineChart } from './KLineChart';
import { TimeRangeSelector } from './TimeRangeSelector';

interface KLineChartContainerProps {
  symbol: string;
}

/**
 * KLineChartContainer - 业务逻辑容器
 * 处理数据获取和周期切换逻辑
 */
export const KLineChartContainer: React.FC<KLineChartContainerProps> = ({ symbol }) => {
  const [selectedRange, setSelectedRange] = useState<KLineType>('min1');
  const { data: klineData, isLoading } = useKLine(symbol, selectedRange);

  return (
    <View style={styles.container}>
      <TimeRangeSelector 
        selected={selectedRange} 
        onSelect={setSelectedRange} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#007AFF" />
        </View>
      ) : klineData && klineData.length > 0 ? (
        <KLineChart data={klineData} type={selectedRange} />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
