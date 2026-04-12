# react-native-kline-view 集成指南

## ✅ 已完成的工作

### 1. 库安装
```bash
yarn add react-native-kline-view@https://github.com/hellohublot/react-native-kline-view.git
```
✅ **已完成**

### 2. 技术指标计算服务
创建了 `src/utils/technicalIndicators.ts`，包含：
- ✅ MA (移动平均线) - MA5, MA10, MA20, MA60
- ✅ MACD (指数平滑异同平均线)
- ✅ KDJ (随机指标)
- ✅ RSI (相对强弱指标)
- ✅ 成交量 MA

### 3. 专业图表组件
创建了 `src/components/features/KLineChart/ProfessionalKLineChart.tsx`

### 4. 类型声明
创建了 `types/react-native-kline-view.d.ts`

---

## 📱 下一步：iOS 设置

**重要：** iOS 需要安装 CocoaPods 依赖

```bash
cd ios
pod install
cd ..
```

---

## 🎯 使用方法

### 基础用法

```typescript
import { ProfessionalKLineChart } from '@/src/components/features/KLineChart';
import { KLine } from '@/src/domain/entities';

// 你的 K 线数据
const klineData: KLine[] = [
  {
    time: '2024-01-01 09:30',
    open: 2850.50,
    high: 2860.00,
    low: 2840.00,
    close: 2855.00,
    volume: 15000,
  },
  // ... 更多数据
];

// 渲染图表
<ProfessionalKLineChart 
  data={klineData}
  isLoading={false}
/>
```

### 在详情页中使用

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { ProfessionalKLineChart } from '@/src/components/features/KLineChart';
import { useKLine } from '@/src/hooks';

function DetailScreen() {
  const { data: klineData, isLoading } = useKLine('hf_GC', 'daily');
  
  return (
    <ScrollView>
      {/* 价格信息 */}
      <PriceHeader />
      
      {/* 专业 K 线图 */}
      <View style={{ height: 450 }}>
        <ProfessionalKLineChart 
          data={klineData || []}
          isLoading={isLoading}
        />
      </View>
      
      {/* 其他信息 */}
    </ScrollView>
  );
}
```

---

## 📊 功能特性

### 技术指标
- **主图指标**: MA5, MA10, MA20 移动平均线
- **副图指标**: MACD, KDJ, RSI
- **成交量**: 带成交量的 MA 均线

### 交互功能
- 👆 **单指滑动**: 浏览历史数据
- 🤏 **捏合缩放**: 缩放时间轴
- 👆 **长按**: 显示十字光标和价格详情

### 主题支持
- 🌙 **深色模式**: 自动适配系统主题
- ☀️ **浅色模式**: 自动适配系统主题

---

## 🎨 自定义配置

### 修改指标参数

编辑 `src/components/features/KLineChart/ProfessionalKLineChart.tsx`:

```typescript
const config = {
  targetList: {
    // MA 均线
    maList: [
      { name: "MA5", count: 5 },
      { name: "MA10", count: 10 },
      { name: "MA20", count: 20 },
      { name: "MA60", count: 60 },  // 添加 MA60
    ],
    
    // MACD 参数
    macd: { s: "12", l: "26", m: "9" },
    
    // KDJ 参数
    kdj: { n: "9", m1: "3", m2: "3" },
    
    // RSI 参数
    rsiList: [
      { name: "RSI6", count: 6 },
      { name: "RSI12", count: 12 },
    ],
  },
  
  configList: {
    // 调整主图和副图比例
    mainFlex: 0.65,      // 主图占 65%
    volumeFlex: 0.35,    // 成交量占 35%
    
    // 修改颜色
    colorList: {
      increaseColor: "#ff4d4f",    // 涨 - 红色
      decreaseColor: "#52c41a",    // 跌 - 绿色
    },
  }
};
```

---

## 📁 文件结构

```
src/
├── components/
│   └── features/
│       └── KLineChart/
│           ├── ProfessionalKLineChart.tsx  # 新组件
│           ├── ProfessionalKLineExample.tsx # 示例
│           └── index.ts                    # 导出
├── utils/
│   └── technicalIndicators.ts             # 指标计算
└── ...

types/
└── react-native-kline-view.d.ts          # 类型声明
```

---

## 🔧 技术指标算法

所有指标计算都在 `src/utils/technicalIndicators.ts` 中实现：

### MA (简单移动平均线)
```typescript
MA_n = (Close_1 + Close_2 + ... + Close_n) / n
```

### MACD
```typescript
EMA_12 = 12日指数移动平均
EMA_26 = 26日指数移动平均
DIF = EMA_12 - EMA_26
DEA = DIF 的 9日 EMA
MACD = (DIF - DEA) × 2
```

### KDJ
```typescript
RSV = (Close - Lowest_Low) / (Highest_High - Lowest_Low) × 100
K = 2/3 × 昨日K + 1/3 × RSV
D = 2/3 × 昨日D + 1/3 × K
J = 3K - 2D
```

### RSI
```typescript
RSI = 100 - (100 / (1 + RS))
RS = 平均上涨幅度 / 平均下跌幅度
```

---

## ⚠️ 注意事项

1. **iOS 必须运行 pod install**
2. **Android 无需额外配置**
3. **数据格式**: 需要至少 60 条数据才能计算 MA60
4. **性能**: 原生渲染，60fps 流畅度

---

## 🚀 下一步

完成 iOS 设置后，你可以：

1. 在详情页中替换旧的 KLineChart
2. 添加指标切换功能（MA/MACD/KDJ）
3. 添加画图工具（趋势线、水平线）

需要我帮你完成哪一步？
