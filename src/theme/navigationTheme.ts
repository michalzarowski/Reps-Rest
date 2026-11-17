import { DarkTheme, type Theme } from '@react-navigation/native';

import { colors } from './tokens';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.aqua,
    background: colors.deepWater,
    card: colors.seaDepth,
    text: colors.textPrimary,
    border: colors.glassBorder,
    notification: colors.acidLime,
  },
};
