import { router } from 'expo-router';
import { Fragment } from 'react';

import { AppCard, ListDivider, ListRow, ScreenContainer } from '@/components';

import { TOOL_CATALOG } from './toolCatalog';

export function ToolsScreen() {
  return (
    <ScreenContainer title="Narzędzia" subtitle="Kalkulatory, timer i dziennik wyników.">
      <AppCard padding="none" className="overflow-hidden">
        {TOOL_CATALOG.map((tool, index) => (
          <Fragment key={tool.title}>
            {index > 0 ? <ListDivider /> : null}
            <ListRow
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              onPress={() => router.push(tool.href)}
            />
          </Fragment>
        ))}
      </AppCard>
    </ScreenContainer>
  );
}
