# 行情数据架构 - 发布订阅模式

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                           │
│  (QuoteTile, WatchlistScreen, DetailScreen, etc.)           │
└──────────────────────┬──────────────────────────────────────┘
                       │ useQuote(symbol)
                       │ useQuotes(symbols)
                       │ useExchangeRate()
                       │ useCustomIndices()
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       React Hooks                            │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ useQuote   │  │ useQuotes  │  │ useAllCustomIndices  │  │
│  └─────┬──────┘  └─────┬──────┘  └──────────┬───────────┘  │
└────────┼───────────────┼───────────────────┼──────────────┘
         │               │                   │
         └───────────────┴───────────────────┘
                         │
                         ▼ subscribe(symbol, callback)
┌─────────────────────────────────────────────────────────────┐
│                    QuoteDataCenter                           │
│                   (单例 - 核心调度器)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  subscriptions: Map<symbol, Set<callback>>          │   │
│  │  quoteCache: Map<symbol, Quote>                     │   │
│  │  pollingTimer: 5秒轮询                              │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ fetchMultipleRawQuotes(allSymbols)
                         │ (5秒内所有订阅合并为一个请求)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│                   (纯HTTP请求)                               │
└─────────────────────────────────────────────────────────────┘
```

## 核心设计

### 1. QuoteDataCenter (发布订阅中心)

**职责：**
- 维护所有订阅关系
- 定时轮询（5秒）获取所有订阅的数据
- 缓存数据
- 分发数据给订阅者

**关键特性：**
- 单例模式，全局唯一
- 无订阅时自动停止轮询
- 有订阅时自动启动轮询
- 50ms窗口期合并请求

### 2. React Hooks (订阅接口)

**useQuote(symbol)**
```typescript
const { data, isLoading, refetch } = useQuote('hf_GC');
```
- 订阅单个品种
- 自动订阅/取消订阅
- 数据更新时自动重渲染

**useQuotes(symbols)**
```typescript
const { data, isLoading } = useQuotes(['hf_GC', 'hf_SI', 'nf_AU0', 'nf_AG0']);
```
- 订阅多个品种
- 返回数组形式的数据
- 适用于列表展示

### 3. 数据流

```
1. 组件挂载 → useQuote('hf_GC') → DataCenter.subscribe()
2. DataCenter 检查是否有轮询，没有则启动
3. 每5秒，DataCenter 收集所有订阅的品种
4. 一次性请求：GET /list=hf_GC,hf_SI,nf_AU0,nf_AG0...
5. 解析数据，更新缓存
6. 回调所有订阅者，触发 React 重渲染
7. 组件卸载 → useEffect cleanup → DataCenter.unsubscribe()
8. 如无订阅者，停止轮询
```

## 优势

### 1. 真正的请求合并

**旧架构：**
```
Component A: useQuote('hf_GC')     → GET list=hf_GC
Component B: useQuote('hf_SI')     → GET list=hf_SI  (50ms后)
Component C: useQuotes([...])      → GET list=...    (同时)
```

**新架构：**
```
Component A: subscribe('hf_GC')    ↘
Component B: subscribe('hf_SI')    → DataCenter 合并
Component C: subscribe('nf_AU0')   ↗
                                     
轮询触发: GET list=hf_GC,hf_SI,nf_AU0  (统一请求)
```

### 2. 性能优化

- **减少请求数：** 无论多少组件订阅，只有一个轮询
- **减少重渲染：** 数据通过回调精准更新
- **自动启停：** 无订阅时停止轮询，节省资源
- **本地缓存：** 新订阅者立即获得缓存数据

### 3. 可扩展性

- **易于添加新品种：** 只需订阅新的 symbol
- **自定义指数：** 基于基础数据本地计算，不额外请求
- **多页面共享：** 同一份数据在所有页面共享

## 使用示例

### 基础使用
```typescript
// 单个品种
const { data: quote } = useQuote('hf_GC');

// 多个品种
const { data: quotes } = useQuotes(['hf_GC', 'hf_SI']);

// 汇率
const { data: rate } = useExchangeRate();

// 自定义指数（本地计算）
const { data: indices } = useAllCustomIndices();
```

### 在组件中使用
```typescript
function QuoteCard({ symbol }: { symbol: string }) {
  const { data: quote, isLoading } = useQuote(symbol);
  
  if (isLoading) return <Loading />;
  if (!quote) return null;
  
  return <Text>{quote.price}</Text>;
}

// 使用
<QuoteCard symbol="hf_GC" />
<QuoteCard symbol="hf_SI" />
<QuoteCard symbol="nf_AU0" />
// 这三个组件共享同一个 DataCenter 的轮询
```

## 日志示例

```
// 首次启动
[QuoteDataCenter] 启动轮询
[QuoteDataCenter] 批量获取 5 个品种: fx_susdcny,hf_GC,nf_AU0,hf_SI,nf_AG0
[API Request] GET https://hq.sinajs.cn/list=fx_susdcny,hf_GC,nf_AU0,hf_SI,nf_AG0

// 5秒后
[QuoteDataCenter] 批量获取 7 个品种: fx_susdcny,hf_GC,nf_AU0,hf_SI,nf_AG0,sz161226,sh518660
[API Request] GET https://hq.sinajs.cn/list=fx_susdcny,hf_GC,nf_AU0,hf_SI,nf_AG0,sz161226,sh518660

// 切换页面，旧组件卸载
[QuoteDataCenter] 订阅数: 5

// 所有组件卸载
[QuoteDataCenter] 订阅数: 0
[QuoteDataCenter] 停止轮询
```

## 注意事项

1. **不要直接调用 API：** 所有数据请求通过 Hooks → DataCenter
2. **组件卸载自动清理：** 无需手动取消订阅
3. **数据缓存：** DataCenter 会缓存最新数据，新订阅者立即获得
4. **轮询间隔：** 固定5秒，如需调整修改 QuoteDataCenter.POLLING_INTERVAL

## 架构对比

| 特性 | 旧架构 (React Query) | 新架构 (发布订阅) |
|------|---------------------|------------------|
| 请求合并 | 按queryKey合并 | 全局统一合并 |
| 轮询控制 | 多个独立轮询 | 单一中心轮询 |
| 缓存位置 | React Query Cache | DataCenter Cache |
| 订阅管理 | 自动 | 显式subscribe/unsubscribe |
| 自定义指数 | 额外请求 | 本地计算 |
| 调试难度 | 中等 | 低（单一出口） |
| 性能 | 良好 | 优秀 |
