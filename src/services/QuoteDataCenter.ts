/**
 * 行情数据中心 - 发布订阅模式
 * 所有数据请求通过此中心统一管理，实现真正的请求合并
 */
import { Quote } from '../domain/entities';
import { fetchMultipleRawQuotes } from '../api/quote';
import { parseQuote } from '../domain/parsers/QuoteParser';

// 订阅者回调函数类型
type SubscriberCallback = (quote: Quote | null) => void;

class QuoteDataCenter {
  private subscriptions: Map<string, Set<SubscriberCallback>> = new Map();
  private quoteCache: Map<string, Quote> = new Map();
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private readonly POLLING_INTERVAL = 5000; // 5秒轮询一次
  private isPolling = false;

  /**
   * 订阅行情数据
   * @param symbol 品种代码
   * @param callback 数据更新回调
   * @returns 取消订阅函数
   */
  subscribe(symbol: string, callback: SubscriberCallback): () => void {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set());
    }
    
    this.subscriptions.get(symbol)!.add(callback);
    
    // 如果有缓存数据，立即回调
    const cached = this.quoteCache.get(symbol);
    if (cached) {
      callback(cached);
    }
    
    // 启动轮询（如果还没启动）
    this.startPolling();
    
    // 返回取消订阅函数
    return () => {
      this.unsubscribe(symbol, callback);
    };
  }

  /**
   * 取消订阅
   */
  private unsubscribe(symbol: string, callback: SubscriberCallback): void {
    const callbacks = this.subscriptions.get(symbol);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscriptions.delete(symbol);
      }
    }
    
    // 如果没有订阅了，停止轮询
    if (this.subscriptions.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * 启动轮询
   */
  private startPolling(): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('[QuoteDataCenter] 启动轮询');
    
    // 立即执行一次
    this.fetchAll();
    
    // 定时轮询
    this.pollingTimer = setInterval(() => {
      this.fetchAll();
    }, this.POLLING_INTERVAL);
  }

  /**
   * 停止轮询
   */
  private stopPolling(): void {
    if (!this.isPolling) return;
    
    this.isPolling = false;
    console.log('[QuoteDataCenter] 停止轮询');
    
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * 获取所有订阅的数据
   */
  private async fetchAll(): Promise<void> {
    const symbols = Array.from(this.subscriptions.keys());
    
    if (symbols.length === 0) return;
    
    try {
      console.log(`[QuoteDataCenter] 批量获取 ${symbols.length} 个品种: ${symbols.join(',')}`);
      
      const rawDataMap = await fetchMultipleRawQuotes(symbols);
      
      // 解析并更新缓存
      symbols.forEach(symbol => {
        const rawData = rawDataMap[symbol];
        if (rawData) {
          try {
            const quote = parseQuote(symbol, rawData);
            this.quoteCache.set(symbol, quote);
            
            // 通知所有订阅者
            const callbacks = this.subscriptions.get(symbol);
            if (callbacks) {
              callbacks.forEach(callback => {
                try {
                  callback(quote);
                } catch (err) {
                  console.error(`[QuoteDataCenter] 回调错误: ${symbol}`, err);
                }
              });
            }
          } catch (parseErr) {
            console.error(`[QuoteDataCenter] 解析错误: ${symbol}`, parseErr);
          }
        }
      });
    } catch (error) {
      console.error('[QuoteDataCenter] 获取数据失败:', error);
      
      // 出错时通知所有订阅者 null
      symbols.forEach(symbol => {
        const callbacks = this.subscriptions.get(symbol);
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(null);
            } catch (err) {
              console.error(`[QuoteDataCenter] 错误回调失败: ${symbol}`, err);
            }
          });
        }
      });
    }
  }

  /**
   * 获取当前缓存的数据（不触发请求）
   */
  getCachedQuote(symbol: string): Quote | undefined {
    return this.quoteCache.get(symbol);
  }

  /**
   * 强制刷新所有数据
   */
  async refresh(): Promise<void> {
    await this.fetchAll();
  }

  /**
   * 获取当前订阅数量
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

// 导出单例
export const quoteDataCenter = new QuoteDataCenter();
