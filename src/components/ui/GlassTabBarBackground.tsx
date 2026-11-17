import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context';

/**
 * Background for the standard (in-flow) tab bar: frosted glass with a bright
 * bevel line on top. Purely visual — layout stays with React Navigation.
 */
export function GlassTabBarBackground() {
  const { glass } = useTheme();
  const blur = Platform.OS === 'ios' || Platform.OS === 'web';
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {blur ? <BlurView intensity={40} tint={glass.blurTint} style={StyleSheet.absoluteFill} /> : null}
      <LinearGradient
        colors={blur ? [glass.fillTop, glass.fillBottom] : [glass.fillTopSolid, glass.fillBottomSolid]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', glass.edgeHighlight, glass.edgeAccent, 'transparent']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1 }}
      />
    </View>
  );
}
