import { Link, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { GlassPanel } from './GlassPanel';

interface NavLinkProps {
  href: string;
  title: string;
  description: string;
}

/** Lightweight link row — prefer ModuleTile for primary hubs. */
export function NavLink({ href, title, description }: NavLinkProps) {
  return (
    <Link href={href as Href} asChild>
      <Pressable className="mb-3 active:opacity-80">
        <GlassPanel variant="soft">
          <Text className="text-body font-semibold text-text-primary">{title}</Text>
          <Text className="mt-1 text-caption text-text-secondary">
            {description}
          </Text>
        </GlassPanel>
      </Pressable>
    </Link>
  );
}
