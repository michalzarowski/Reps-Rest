import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/context';

/**
 * Static light sources behind the glass panes. Without something colourful
 * behind them, blur and reflections have nothing to refract. Not animated,
 * not interactive, and placed under the content (never part of the layout).
 */
export function AmbientBackground() {
  const { glass } = useTheme();
  const [a, b, c] = glass.ambient;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="ambA" cx="85%" cy="6%" rx="70%" ry="38%">
            <Stop offset="0" stopColor={a} stopOpacity={1} />
            <Stop offset="1" stopColor={a} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="ambB" cx="5%" cy="48%" rx="65%" ry="36%">
            <Stop offset="0" stopColor={b} stopOpacity={1} />
            <Stop offset="1" stopColor={b} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="ambC" cx="90%" cy="92%" rx="70%" ry="34%">
            <Stop offset="0" stopColor={c} stopOpacity={1} />
            <Stop offset="1" stopColor={c} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ambA)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ambB)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ambC)" />
      </Svg>
    </View>
  );
}
