import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemeColor } from '@/hooks/use-theme-color';
import { KLine } from '@/src/domain/entities';
import { KLineType } from '@/src/constants/api';
import { getKLineOption } from './echarts-config';

interface KLineChartProps {
  data: KLine[];
  type?: KLineType;
}

/**
 * KLineChart - 纯 UI 组件
 * 只负责渲染图表，不处理数据逻辑
 */
export const KLineChart: React.FC<KLineChartProps> = ({ data, type = 'daily' }) => {
  const textColor = useThemeColor({}, 'text');
  const webViewRef = useRef<WebView>(null);

  // 当数据变化时，通知 WebView 更新图表
  useEffect(() => {
    if (webViewRef.current && data.length > 0) {
      const option = getKLineOption(data, type, textColor);
      const optionStr = JSON.stringify(option);

      const script = `
        (function() {
          var option = ${optionStr};
          if (option.xAxis && option.xAxis[0] && option.xAxis[0].axisLabel) {
            option.xAxis[0].axisLabel.formatter = function(value) {
              if (!value) return '';
              if (value.startsWith('FUTURE_')) return '';
              if (value.length > 10) return value.substring(11, 16);
              if (value.length === 10) return value.substring(5);
              return value;
            };
          }
          if (window.chart) {
            window.chart.setOption(option);
          }
        })();
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [data, type, textColor]);

  const htmlContent = useMemo(() => {
    const initialOption = getKLineOption(data, type, textColor);
    const initialOptionStr = JSON.stringify(initialOption);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://fastly.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
        <style>
          body, html, #chart { height: 100%; margin: 0; padding: 0; overflow: hidden; background: transparent; }
        </style>
      </head>
      <body>
        <div id="chart"></div>
        <script>
          window.chart = echarts.init(document.getElementById('chart'));
          var option = ${initialOptionStr};
          if (option.xAxis && option.xAxis[0] && option.xAxis[0].axisLabel) {
            option.xAxis[0].axisLabel.formatter = function(value) {
              if (!value) return '';
              if (typeof value === 'string' && value.indexOf('FUTURE_') === 0) return '';
              if (value.length > 10) return value.substring(11, 16);
              if (value.length === 10) return value.substring(5);
              return value;
            };
          }
          window.chart.setOption(option);
          window.addEventListener('resize', () => window.chart.resize());
        </script>
      </body>
      </html>
    `;
  }, [textColor]);

  if (!data || data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
        overScrollMode="never"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 300,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
