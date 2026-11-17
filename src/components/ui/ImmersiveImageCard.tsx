import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radii } from '@/theme';

interface ImmersiveImageCardProps {
  source: ImageSource;
  height?: number;
  children?: ReactNode;
  className?: string;
}

export function ImmersiveImageCard({
  source,
  height = 220,
  children,
  className,
}: ImmersiveImageCardProps) {
  return (
    <View
      className={className}
      style={[styles.container, { height, borderRadius: radii.lg }]}
    >
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['transparent', colors.overlay, colors.deepWater]}
        locations={[0.25, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
});
