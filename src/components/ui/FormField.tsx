import { forwardRef, useState, type ReactNode } from 'react';
import { Platform, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/context';
import { radii } from '@/theme';

import { GlassSurface } from './GlassSurface';

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Short helper shown under the input when there is no error. */
  hint?: string;
  error?: string | null;
  /** Unit or action rendered inside the input row, on the right. */
  trailing?: ReactNode;
  size?: 'md' | 'lg';
}

/** Labelled text input with inline hint / error, themed for both modes. */
export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, hint, error, trailing, size = 'md', multiline, onFocus, onBlur, ...inputProps },
  ref,
) {
  const { colors } = useTheme();
  const hasError = Boolean(error);
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text className="mb-1.5 text-label font-medium text-text-secondary">{label}</Text>
      <GlassSurface
        radius={radii.sm}
        intensity="subtle"
        glow={focused && !hasError}
        className={hasError ? 'rounded-sm border border-danger' : undefined}
        contentClassName="flex-row items-center px-3.5"
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={{
            flex: 1,
            // Lets the input shrink next to trailing controls (web inputs have an intrinsic width).
            minWidth: 0,
            minHeight: multiline ? 88 : 48,
            paddingVertical: 12,
            color: colors.textPrimary,
            fontSize: size === 'lg' ? 22 : 16,
            fontWeight: size === 'lg' ? '600' : '400',
            textAlignVertical: multiline ? 'top' : 'center',
            // The field border shows focus; avoid the double browser outline on web.
            ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
          }}
          {...inputProps}
        />
        {trailing ? <View className="ml-2">{trailing}</View> : null}
      </GlassSurface>
      {hasError ? (
        <Text accessibilityLiveRegion="polite" className="mt-1.5 text-label text-danger">
          {error}
        </Text>
      ) : hint ? (
        <Text className="mt-1.5 text-label text-text-muted">{hint}</Text>
      ) : null}
    </View>
  );
});
