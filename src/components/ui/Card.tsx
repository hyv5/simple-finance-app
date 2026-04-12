import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '../../../hooks/use-theme-color';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

/**
 * 卡片组件 - 纯 UI
 */
export const Card: React.FC<CardProps> = ({ children, style }) => {
  const backgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#333' }, 'background');
  
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
  },
});
