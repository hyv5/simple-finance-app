import axios from 'axios';
import { DEFAULT_HEADERS } from '../constants/api';

/**
 * HTTP 客户端配置
 */
export const httpClient = axios.create({
  timeout: 10000,
  headers: DEFAULT_HEADERS,
  responseType: 'text',
});

/**
 * 请求拦截器
 */
httpClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Response Error]', error.message);
    return Promise.reject(error);
  }
);
