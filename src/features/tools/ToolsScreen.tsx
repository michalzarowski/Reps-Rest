import { View } from 'react-native';

import { ModuleTile, Screen, SectionHeader } from '@/components';
import { demoTools } from '@/mocks/demo';

export function ToolsScreen() {
  return (
    <Screen
      title="Narzędzia"
      subtitle="Kalkulatory i stoper na salę treningową."
    >
      <SectionHeader title="Moduły" />
      <View className="gap-3">
        {demoTools.map((tool) => (
          <ModuleTile
            key={tool.href}
            href={tool.href}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            variant="elevated"
          />
        ))}
      </View>
    </Screen>
  );
}
