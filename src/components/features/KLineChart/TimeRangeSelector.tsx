import React from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { KLineType } from '@/src/constants/api';
import { useThemeColor } from '@/hooks/use-theme-color';

interface TimeRangeSelectorProps {
  selected: KLineType;
  onSelect: (type: KLineType) => void;
}

const RANGES: { label: string; value: KLineType }[] = [
  { label: '分时', value: 'min1' },
  { label: '5日', value: 'min5' },
  { label: '日K', value: 'daily' },
  { label: '周K', value: 'weekly' },
  { label: '月K', value: 'monthly' },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selected, onSelect }) => {
  const activeColor = '#007AFF';
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {RANGES.map((range) => {
          const isActive = selected === range.value;
          return (
            <TouchableOpacity
              key={range.value}
              onPress={() => onSelect(range.value)}
              style={[
                styles.button,
                isActive && { backgroundColor: `${activeColor}20` }
              ]}
            >
              <ThemedText
                style={[
                  styles.label,
                  { color: isActive ? activeColor : textColor },
                  isActive && styles.activeLabel
                ]}
              >
                {range.label}
              </ThemedText>
              {isActive && <View style={[styles.indicator, { backgroundColor: activeColor }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 16,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 16,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  activeLabel: {
    fontWeight: 'bold',
    opacity: 1,
  },
  indicator: {
    position: 'absolute',
    bottom: -4,
    width: 12,
    height: 2,
    borderRadius: 1,
  },
});
