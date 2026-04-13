/**
 * API 基础配置
 */
export const SINA_API_BASE = {
  HQ: 'https://hq.sinajs.cn',
  GU: 'https://gu.sina.cn',
  STOCK2: 'https://stock2.finance.sina.com.cn',
  QUOTES: 'https://quotes.sina.cn',
} as const;

/**
 * 行情符号配置
 */
export const GOLD_SYMBOLS = {
  COMEX_GOLD: 'hf_GC',
  SHFE_GOLD: 'nf_AU0',
} as const;

export const SILVER_SYMBOLS = {
  COMEX_SILVER: 'hf_SI',
  SHFE_SILVER: 'nf_AG0',
} as const;

export const FUND_SYMBOLS = {
  SILVER_LOF: 'sz161226',
  GOLD_ETF: 'sh518660',
} as const;

/**
 * 名称映射
 */
export const SYMBOL_NAME_MAP: Record<string, string> = {
  'sz161226': '国投白银LOF',
  'sh518660': '黄金ETF工银',
  'hf_GC': '国际黄金',
  'hf_SI': '国际白银',
  'nf_AU0': '沪金主力',
  'nf_AG0': '沪银主力',
  'RATIO_NY_GS': '纽约金银比',
  'RATIO_SH_GS': '上海金银比(千倍)',
  'binance_PAXGUSDT': 'PAX黄金/USDT',
};

/**
 * 换算常数
 */
export const CONVERSION = {
  USD_CNY_DEFAULT: 7.25,
  OZ_TO_GRAM: 31.1035,
  KG_TO_GRAM: 1000,
} as const;

/**
 * 刷新频率
 */
export const REFRESH_INTERVALS = {
  QUOTES: 5000,
} as const;

/**
 * 汇率配置
 */
export const EXCHANGE_RATE_CONFIG = {
  SYMBOL: 'fx_susdcny',
} as const;

/**
 * K 线周期
 */
/**
 * 加密货币 API
 */
export const BINANCE_API_BASE = 'https://api.binance.com/api/v3' as const;

/**
 * 加密货币品种
 */
export const CRYPTO_SYMBOLS = {
  PAXGUSDT: 'PAXGUSDT',
} as const;

/**
 * K 线周期
 */
export const KLINE_SCALES = {
  min1: '1',
  min5: '5',
  daily: '240',
  weekly: 'weekly',
  monthly: 'monthly',
} as const;

export type KLineType = keyof typeof KLINE_SCALES;

/**
 * API 路由
 */
export const SINA_API_ROUTES = {
  INNER_FUTURE: `${SINA_API_BASE.STOCK2}/futures/api/json.php/InnerFuturesService.`,
  INNER_FUTURE_NEW: `${SINA_API_BASE.STOCK2}/futures/api/json.php/InnerFuturesNewService.`,
  GLOBAL_FUTURE: `${SINA_API_BASE.STOCK2}/futures/api/json.php/GlobalFuturesService.`,
  GLOBAL_FUTURE_MIN: `${SINA_API_BASE.STOCK2}/futures/api/json.php/GlobalFuturesService.getGlobalFuturesMinLine`,
  CN_STOCK: `${SINA_API_BASE.QUOTES}/cn/api/jsonp_v2.php/var%20_temp=/CN_MarketDataService.getKLineData`,
  EAST_MONEY_FUND: 'https://fund.eastmoney.com/pingzhongdata/',
  SUGGEST: 'https://suggest3.sinajs.cn/suggest/type=&key=',
} as const;

/**
 * 默认请求头
 */
export const DEFAULT_HEADERS = {
  'Referer': 'https://finance.sina.com.cn/',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
};
