declare module 'react-native-kline-view' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface KLineViewProps {
    /** JSON 字符串格式的配置 */
    optionList: string;
    /** 组件样式 */
    style?: ViewStyle;
    /** 画图工具被触摸时的回调 */
    onDrawItemDidTouch?: (event: {
      shouldReloadDrawItemIndex: number;
      drawColor: string;
      drawLineHeight: number;
      drawDashWidth: number;
      drawDashSpace: number;
      drawIsLock: boolean;
    }) => void;
    /** 画图完成的回调 */
    onDrawItemComplete?: () => void;
    /** 画点完成的回调 */
    onDrawPointComplete?: (event: { pointCount: number }) => void;
  }

  export class KLineView extends Component<KLineViewProps> {}
}
