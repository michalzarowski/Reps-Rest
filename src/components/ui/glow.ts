import { Platform, type ViewStyle } from 'react-native';

/**
 * Soft glow that follows the shape of the content (icon glyph, ring stroke).
 * Native shadows on a transparent View trace the content's alpha; on web the
 * same props become a rectangular box-shadow, so a CSS drop-shadow is used.
 */
export function contentGlow(color: string, radius = 8, strength = 0.85): ViewStyle {
  if (Platform.OS === 'web') {
    return { filter: `drop-shadow(0 0 ${radius / 2}px ${color})` } as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOpacity: strength,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 0 },
  };
}
