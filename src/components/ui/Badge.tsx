import { Text, View } from 'react-native';

type BadgeTone = 'accent' | 'neutral' | 'lilac' | 'success';

const toneClass: Record<BadgeTone, { box: string; text: string }> = {
  accent: { box: 'bg-accent/15', text: 'text-accent' },
  neutral: { box: 'bg-surface-elevated', text: 'text-text-secondary' },
  lilac: { box: 'bg-lilac/15', text: 'text-lilac' },
  success: { box: 'bg-success/15', text: 'text-success' },
};

/** Small status label (PR, category, count). Not interactive. */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const t = toneClass[tone];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${t.box}`}>
      <Text className={`text-label font-semibold ${t.text}`} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
