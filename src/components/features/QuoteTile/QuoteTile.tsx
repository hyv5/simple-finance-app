import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/src/components/ui/Card';
import { PriceChange } from '@/src/components/ui/PriceChange';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Quote } from '@/src/domain/entities';

interface QuoteTileProps {
  quote: Quote;
  onPress?: () => void;
}

/**
 * QuoteTile - 纯 UI 组件
 * 只负责渲染，不处理任何业务逻辑
 */
export const QuoteTile: React.FC<QuoteTileProps> = ({ quote }) => {
  const textColor = useThemeColor({}, 'text');
  const isSpread = quote.symbol.startsWith('SPREAD_') || quote.symbol.startsWith('RATIO_');

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {quote.name}
        </Text>
        <Text style={styles.symbol}>{quote.symbol}</Text>
      </View>
      
      <PriceChange 
        value={quote.price} 
        showSign={false}
        style={styles.price}
      />

      <View style={styles.bottomRow}>
        <PriceChange value={quote.change} />
        {!isSpread && (
          <PriceChange 
            value={quote.changePercent} 
            suffix="%" 
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  header: {
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.6,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 10,
    color: '#888',
    fontWeight: '500',
  },
});
