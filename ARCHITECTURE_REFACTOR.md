# 架构重构总结

## 重构完成的内容

### 1. 新的目录结构

```
src/
├── api/                    # API 层（纯请求，无业务逻辑）
│   ├── client.ts          # HTTP 客户端配置
│   ├── types.ts           # API 类型定义
│   ├── quote.ts           # 行情请求
│   ├── kline.ts           # K线请求
│   └── search.ts          # 搜索请求
│
├── domain/                 # 领域层（核心业务逻辑）
│   ├── entities/          # 领域实体
│   │   └── index.ts       # Quote, KLine, Symbol 等
│   ├── services/          # 领域服务
│   │   ├── QuoteCalculator.ts     # 自定义指标计算
│   │   ├── KLineCalculator.ts     # K线数据计算
│   │   ├── KLineAggregator.ts     # K线数据聚合
│   │   └── QuoteUtils.ts          # 行情工具函数
│   └── parsers/           # 数据解析器
│       ├── QuoteParser.ts         # 行情数据解析
│       └── KLineParser.ts         # K线数据解析
│
├── hooks/                  # React Hooks
│   ├── useQuote.ts        # 获取行情
│   ├── useQuotes.ts       # 获取多个行情
│   ├── useExchangeRate.ts # 获取汇率
│   ├── useKLine.ts        # 获取K线
│   ├── useCustomIndex.ts  # 获取自定义指标
│   └── useFundManager.ts  # 管理自选基金
│
├── components/             # 组件
│   ├── ui/                # 基础 UI 组件（纯展示）
│   │   ├── Card.tsx
│   │   └── PriceChange.tsx
│   └── features/          # 业务组件
│       └── QuoteTile/
│           ├── index.ts
│           ├── QuoteTile.tsx       # UI 组件
│           └── QuoteTileContainer.tsx  # 业务逻辑容器
│
└── constants/              # 常量配置
    └── api.ts             # API 配置和常量
```

### 2. 架构改进点

#### API 层（关注点：数据获取）
- ✅ 纯 HTTP 请求，不包含解析逻辑
- ✅ 统一的错误处理和日志
- ✅ 易于测试和 mock

#### Domain 层（关注点：业务逻辑）
- ✅ 领域实体定义清晰
- ✅ 解析器独立，易于维护
- ✅ 自定义指标计算独立封装
- ✅ K线聚合逻辑可复用

#### Hooks 层（关注点：状态管理）
- ✅ 单一职责，每个 hook 只做一件事
- ✅ 使用 React Query 管理服务端状态
- ✅ 移除重复的状态管理（Zustand 仅用于用户相关状态）

#### Components 层（关注点：UI 渲染）
- ✅ UI 组件和业务逻辑分离
- ✅ Container/Presenter 模式
- ✅ 纯 UI 组件易于测试和复用

### 3. 使用示例

#### 获取行情
```typescript
// 获取单个行情
const { data: quote, isLoading } = useQuote('hf_GC');

// 获取多个行情
const { data: quotes } = useQuotes(['hf_GC', 'nf_AU0']);

// 获取自定义指标
const { data: spread } = useCustomIndex('SPREAD_GC_AU0');
```

#### 使用组件
```typescript
// 使用容器组件（自动获取数据）
<QuoteTileContainer symbol="hf_GC" />

// 使用纯 UI 组件（传入数据）
<QuoteTile quote={quote} />
```

#### 自定义指标计算
```typescript
import { QuoteCalculator } from '@/src/domain/services';

const calculator = new QuoteCalculator(exchangeRate);
const gcCNY = calculator.calculateGC_CNY(gcQuote);
const spread = calculator.calculateSpreadGC_AU0(gcQuote, auQuote);
```

## 待完成的工作

1. **迁移其他页面**
   - `app/(tabs)/fund.tsx` → `src/components/screens/FundScreen.tsx`
   - `app/(tabs)/custom.tsx` → `src/components/screens/CustomScreen.tsx`
   - `app/details/[symbol].tsx` → 更新使用新架构

2. **迁移其他组件**
   - `components/charts/` → `src/components/features/KLineChart/`
   - `components/finance/QuoteCard.tsx` → 重构为 Container/Presenter 模式

3. **删除旧代码**
   - 删除 `api/sina/` 目录
   - 删除 `hooks/finance/` 目录
   - 删除 `store/useFinanceStore.ts`（如果不需要）

4. **更新 tsconfig.json**
   - 已添加 `@/src/*` 路径别名
   - 建议使用 `@/src/hooks/useQuote` 而非相对路径

5. **测试**
   - 验证所有功能正常工作
   - 确保数据流正确

## 最佳实践

1. **导入顺序**
   ```typescript
   // 1. React/React Native
   import React from 'react';
   import { View } from 'react-native';
   
   // 2. 第三方库
   import { useRouter } from 'expo-router';
   
   // 3. 项目内部（按层级）
   import { useQuote } from '@/src/hooks';
   import { QuoteTile } from '@/src/components/features';
   import { QuoteCalculator } from '@/src/domain/services';
   ```

2. **组件设计**
   - 纯 UI 组件：只接收 props，不处理业务逻辑
   - Container 组件：处理数据获取、导航等业务逻辑
   - 避免在 UI 组件中直接使用 hooks

3. **错误处理**
   - API 层抛出错误
   - Hooks 层使用 React Query 的错误处理
   - UI 层显示错误状态

## 优势

1. **可维护性**：职责清晰，修改影响范围可控
2. **可测试性**：纯函数易于单元测试
3. **可复用性**：服务和解析器可在多处使用
4. **可扩展性**：新增功能时只需在对应层级添加
