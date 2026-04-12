import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useThemeColor } from '../../../hooks/use-theme-color';

interface PriceChangeProps {
  value: number;
  showSign?: boolean;
  style?: TextStyle;
  suffix?: string;
}

/**
 * 价格变动组件 - 纯 UI，自动根据涨跌显示颜色
 */
export const PriceChange: React.FC<PriceChangeProps> = ({
  value,
  showSign = true,
  style,
  suffix = '',
}) => {
  const textColor = useThemeColor({}, 'text');
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  const color = isPositive ? '#ff4d4f' : isNegative ? '#52c41a' : textColor;
  const sign = showSign && value > 0 ? '+' : '';
  
  return (
    <Text style={[styles.text, { color }, style]}>
      {sign}{value.toFixed(2)}{suffix}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
  },
});
