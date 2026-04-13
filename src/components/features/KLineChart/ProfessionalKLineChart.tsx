import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { KLineView } from 'react-native-kline-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { KLine } from '@/src/domain/entities';
import { calculateAllIndicators, formatForKLineView } from '@/src/utils/technicalIndicators';

interface ProfessionalKLineChartProps {
  data: KLine[];
  isLoading?: boolean;
}

/**
 * 专业 K 线图表组件
 * 使用 react-native-kline-view
 * 支持 MA、MACD、KDJ、RSI 等技术指标
 */
export const ProfessionalKLineChart: React.FC<ProfessionalKLineChartProps> = ({
  data,
  isLoading = false,
}) => {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const isDark = textColor === '#FFFFFF' || textColor === '#ffffff';

  // 计算技术指标并格式化数据
  const optionList = useMemo(() => {
    if (!data || data.length === 0) return null;

    // 计算所有技术指标
    const dataWithIndicators = calculateAllIndicators(data);
    const formattedData = formatForKLineView(dataWithIndicators);

    const config = {
      modelArray: formattedData,
      shouldScrollToEnd: true,
      
      // 技术指标配置
      targetList: {
        // MA 均线
        maList: [
          { name: "MA5", count: 5 },
          { name: "MA10", count: 10 },
          { name: "MA20", count: 20 },
        ],
        maVolumeList: [
          { name: "VOLUME5", count: 5 },
          { name: "VOLUME10", count: 10 },
        ],
        // MACD
        macd: { s: "12", l: "26", m: "9" },
        // KDJ
        kdj: { n: "9", m1: "3", m2: "3" },
        // RSI
        rsiList: [
          { name: "RSI6", count: 6 },
        ],
      },

      // 样式配置
      configList: {
        // 颜色配置
        colorList: {
          increaseColor: "#ff4d4f",    // 涨 - 红色
          decreaseColor: "#52c41a",    // 跌 - 绿色
        },
        // 指标线颜色
        targetColorList: [
          "#ff6b6b",  // MA5 - 红色
          "#4ecdc4",  // MA10 - 青色
          "#45b7d1",  // MA20 - 蓝色
          "#f9ca24",  // MA60 - 黄色
        ],
        // 背景色
        backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
        textColor: isDark ? "#ffffff" : "#333333",
        gridColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
        candleTextColor: isDark ? "#ffffff" : "#333333",
        
        // 主图和副图比例
        mainFlex: 0.65,      // 主图占 65%
        volumeFlex: 0.35,    // 成交量和指标占 35%
        
        // 边距
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 50,
        
        // K线宽度
        itemWidth: 10,
        candleWidth: 8,
        
        // 字体
        fontFamily: "System",
        headerTextFontSize: 11,
        rightTextFontSize: 10,
        candleTextFontSize: 10,
        panelTextFontSize: 10,
        panelMinWidth: 100,
      },

      // 画图工具配置（可选）
      drawList: {
        drawType: 0,  // 0 = 无画图工具
      },
    };

    return JSON.stringify(config);
  }, [data, isDark]);

  if (isLoading || !optionList) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <KLineView
        optionList={optionList}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 450,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
