/**
 * ECharts 配置生成器
 */

import { KLineType } from '@/src/constants/api';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const getKLineOption = (
  rawData: ChartData[],
  type: KLineType,
  themeColor: string
) => {
  const isLine = type === 'min1' || type === 'min5';
  const is5Day = type === 'min5';
  const isDark = themeColor === '#FFFFFF' || themeColor === '#ffffff' || themeColor === 'white';

  const upColor = '#ef5350';
  const downColor = '#26a69a';

  // 处理数据
  const dates = rawData.map(item => item.time);
  const values = rawData.map(item => [item.open, item.close, item.low, item.high]);
  const volumes = rawData.map((item, i) => [i, item.volume, item.close >= item.open ? 1 : -1]);

  // 针对 5 日线优化：补齐右侧空白
  if (is5Day && rawData.length > 0) {
    const tradingDays = Array.from(new Set(dates.map(d => d.substring(0, 10)))).sort();
    const pointsPerDay = Math.ceil(rawData.length / tradingDays.length);
    const expectedTotalPoints = pointsPerDay * 5;
    if (dates.length < expectedTotalPoints) {
      const paddingCount = expectedTotalPoints - dates.length;
      for (let i = 0; i < paddingCount; i++) {
        dates.push(`FUTURE_${i}`);
      }
    }
  }

  return {
    backgroundColor: 'transparent',
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: '#919294',
          type: 'dashed',
          width: 1
        }
      },
      textStyle: { color: isDark ? '#eee' : '#333' },
      formatter: function(params: any) {
        const param = params[0];
        if (param.name.startsWith('FUTURE_')) return '';

        let res = '<div style="font-size: 12px; line-height: 1.5;">' + param.name + '</div>';
        params.forEach((p: any) => {
          if (p.seriesName === 'KLine') {
            if (isLine) {
              res += '<div style="color: #2196f3">价格: ' + p.value.toFixed(2) + '</div>';
            } else {
              const color = p.value[1] >= p.value[0] ? upColor : downColor;
              res += '<div style="color:' + color + '">';
              res += '开盘: ' + p.value[0].toFixed(2) + '<br/>';
              res += '最高: ' + p.value[3].toFixed(2) + '<br/>';
              res += '最低: ' + p.value[2].toFixed(2) + '<br/>';
              res += '收盘: ' + p.value[1].toFixed(2);
              res += '</div>';
            }
          } else if (p.seriesName === 'Volume') {
            res += '<div style="color: #777">成交量: ' + p.value[1] + '</div>';
          }
        });
        return res;
      }
    },
    grid: [
      {
        left: '10%',
        right: '5%',
        height: '60%',
        top: '10%'
      },
      {
        left: '10%',
        right: '5%',
        top: '75%',
        height: '15%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        boundaryGap: !isLine,
        axisLine: { lineStyle: { color: themeColor, opacity: 0.5 } },
        axisLabel: {
          color: themeColor,
          fontSize: 10,
        }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dates,
        boundaryGap: !isLine,
        axisLabel: { show: false },
        axisTick: { show: false }
      }
    ],
    yAxis: [
      {
        scale: true,
        axisLine: { lineStyle: { color: themeColor, opacity: 0.5 } },
        splitLine: { lineStyle: { color: 'rgba(128,128,128,0.1)' } },
        axisLabel: { color: themeColor, fontSize: 10 }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    visualMap: {
      show: false,
      seriesIndex: 1,
      dimension: 2,
      pieces: [
        { value: 1, color: upColor },
        { value: -1, color: downColor }
      ]
    },
    dataZoom: [
      {
        type: 'inside',
        disabled: is5Day,
        xAxisIndex: [0, 1],
        startValue: is5Day ? 0 : Math.max(0, rawData.length - (isLine ? 100 : 60)),
        endValue: dates.length - 1
      }
    ],
    series: [
      {
        name: 'KLine',
        type: isLine ? 'line' : 'candlestick',
        data: isLine ? rawData.map(item => item.close) : values,
        showSymbol: false,
        smooth: isLine,
        lineStyle: {
          width: isLine ? 2 : 1,
          color: isLine ? '#2196f3' : undefined
        },
        areaStyle: isLine ? {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
              { offset: 1, color: 'rgba(33, 150, 243, 0)' }
            ]
          }
        } : undefined,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upColor,
          borderColor0: downColor
        }
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes
      }
    ]
  };
};
