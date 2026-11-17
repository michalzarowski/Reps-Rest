import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors, radii } from '@/theme';

import { Icon, type IconName } from './Icon';

interface QuickToolButtonProps {
  href: string;
  label: string;
  icon: IconName;
}

export function QuickToolButton({ href, label, icon }: QuickToolButtonProps) {
  return (
    <Link href={href as Href} asChild>
      <Pressable className="w-[22%] items-center active:opacity-80">
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            backgroundColor: colors.glassFill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} color={colors.aqua} size="md" />
        </View>
        <Text
          className="mt-2 text-center text-[11px] font-medium text-text-secondary"
          numberOfLines={2}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}
