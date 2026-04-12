import React from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProfessionalKLineChart } from '@/src/components/features/KLineChart';
import { useQuote, useKLine } from '@/src/hooks';
import { KLineType } from '@/src/constants/api';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * 详情页面 - 优化布局
 * 第一行：主价格 + 右侧涨幅/百分比
 * 第二行：6项统计数据
 * 第三行：图表
 */
export default function DetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { data: quote, isLoading } = useQuote(symbol);
  const textColor = useThemeColor({}, 'text');
  const [selectedPeriod, setSelectedPeriod] = useState<KLineType>('daily');
  const { data: klineData, isLoading: isKLineLoading } = useKLine(symbol, selectedPeriod);

  if (isLoading || !quote) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  const isSpread = symbol?.startsWith('SPREAD_') || symbol?.startsWith('RATIO_');
  const isPositive = quote.change > 0;
  const isNegative = quote.change < 0;
  const changeColor = isPositive ? '#ff4d4f' : isNegative ? '#52c41a' : textColor;
  
  // 主价格也根据涨跌显示颜色
  const priceColor = isSpread ? textColor : changeColor;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: quote.name || symbol,
          headerBackTitle: '返回',
        }} 
      />
      
      <ScrollView>
        {/* 第一行：主价格 + 右侧涨幅/百分比 */}
        <View style={styles.priceRow}>
          <View style={styles.priceInfoContainer}>
            <Text style={[styles.mainPrice, { color: priceColor }]}>
              {quote.price.toFixed(2)}
            </Text>
            
            <View style={styles.changeContainer}>
              <Text style={[styles.changeValue, { color: changeColor }]}>
                {isPositive ? '+' : ''}{quote.change.toFixed(2)}
              </Text>
              {!isSpread && (
                <Text style={[styles.changePercent, { color: changeColor }]}>
                  {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 第二行：6项统计数据 */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatItem label="今开" value={quote.open} />
            <StatItem label="最高" value={quote.high} isHigh />
            <StatItem label="成交量" value={quote.volume} isVolume />
          </View>
          <View style={styles.statsRow}>
            <StatItem label="昨收" value={quote.prevClose} />
            <StatItem label="最低" value={quote.low} isLow />
            <StatItem label="时间" value={quote.time.split(' ')[1] || quote.time} />
          </View>
        </View>

        {/* 第三行：周期选择器 */}
        <View style={styles.periodSelector}>
          {(['min1', 'min5', 'daily', 'weekly', 'monthly'] as KLineType[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodText, { color: textColor }, selectedPeriod === period && styles.periodTextActive]}>
                {period === 'min1' ? '分时' : period === 'min5' ? '5日' : period === 'daily' ? '日K' : period === 'weekly' ? '周K' : '月K'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 第四行：专业K线图 */}
        <View style={styles.chartSection}>
          <ProfessionalKLineChart 
            data={klineData || []} 
            isLoading={isKLineLoading}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

interface StatItemProps {
  label: string;
  value: number | string;
  isHigh?: boolean;
  isLow?: boolean;
  isVolume?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, isHigh, isLow, isVolume }) => {
  const textColor = useThemeColor({}, 'text');
  let displayValue: string;
  let valueStyle: any = { color: textColor };

  if (isVolume && typeof value === 'number') {
    if (value > 100000000) {
      displayValue = `${(value / 100000000).toFixed(2)}亿`;
    } else if (value > 10000) {
      displayValue = `${(value / 10000).toFixed(2)}万`;
    } else if (value > 0) {
      displayValue = value.toLocaleString();
    } else {
      displayValue = '--';
    }
  } else if (typeof value === 'number') {
    displayValue = value.toFixed(2);
    if (isHigh) valueStyle = { color: '#ff4d4f' };
    if (isLow) valueStyle = { color: '#52c41a' };
  } else {
    displayValue = String(value);
  }

  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueStyle]} numberOfLines={1}>
        {displayValue}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 第一行：主价格和涨跌幅
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.02)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  priceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainPrice: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  changeContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  changeValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  changePercent: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // 第二行：统计数据
  statsGrid: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.02)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#8e8e93',
    width: 50,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  
  // 第三行：周期选择器
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.02)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#ffffff',
  },

  // 第四行：图表
  chartSection: {
    marginTop: 0,
    paddingBottom: 20,
    height: 480,
  },
});
