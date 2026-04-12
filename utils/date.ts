/**
 * 日期处理工具函数，特别针对 React Native Hermes 引擎优化
 */

/**
 * 将各种格式的日期字符串转换为兼容 Hermes 的 ISO 格式
 * 兼容：
 * - 2026-01-29 10:44:00 -> 2026-01-29T10:44:00
 * - 2026-01-29 10:44 -> 2026-01-29T10:44:00
 * - 2026-01-29 -> 2026-01-29T00:00:00
 * - 2026/01/29 -> 2026-01-29T00:00:00
 */
export const formatToISODate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // 替换斜杠为短横线
  let formatted = dateStr.replace(/\//g, '-');
  
  // 替换空格为 T
  if (formatted.includes(' ')) {
    formatted = formatted.replace(' ', 'T');
  }
  
  // 处理纯日期 YYYY-MM-DD
  if (formatted.includes('-') && !formatted.includes('T')) {
    formatted = `${formatted}T00:00:00`;
  } 
  // 处理 YYYY-MM-DDTHH:mm
  else if (formatted.includes('T') && formatted.split(':').length === 2) {
    formatted = `${formatted}:00`;
  }
  
  // 关键修复：新浪数据均为北京时间 (UTC+8)，强制指定时区防止 Hermes/时区差异导致过滤掉“未来”数据
  if (formatted.includes('T') && !formatted.endsWith('Z') && !formatted.includes('+')) {
    formatted = `${formatted}+08:00`;
  }
  
  return formatted;
};

/**
 * 解析日期字符串并返回时间戳，失败返回 NaN
 */
export const parseDateTime = (dateStr: string): number => {
  const isoStr = formatToISODate(dateStr);
  return new Date(isoStr).getTime();
};

/**
 * 格式化显示日期，移除秒位
 * 2026-01-29 10:44:00 -> 2026-01-29 10:44
 */
export const formatDisplayTime = (time: string): string => {
  if (!time) return '';
  if (time.includes(' ')) {
    return time.substring(0, 16);
  }
  // 如果是无分隔符日期 20240101
  if (/^\d{8}$/.test(time)) {
    return `${time.substring(0, 4)}-${time.substring(4, 6)}-${time.substring(6, 8)}`;
  }
  return time;
};

/**
 * 判断是否为未来时间
 * @param timeStr 时间字符串
 * @param toleranceMs 容忍误差（毫秒）
 */
export const isFutureTime = (timeStr: string, toleranceMs: number = 0): boolean => {
  const timestamp = parseDateTime(timeStr);
  if (isNaN(timestamp)) return false;
  return timestamp > Date.now() + toleranceMs;
};
