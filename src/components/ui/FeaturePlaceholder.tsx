import { EmptyState } from './EmptyState';
import { Screen } from './Screen';

interface FeaturePlaceholderProps {
  title: string;
  subtitle: string;
  moduleName: string;
}

/** Used under tools stack headers — avoids duplicating the navigation title. */
export function FeaturePlaceholder({
  title,
  subtitle,
  moduleName,
}: FeaturePlaceholderProps) {
  return (
    <Screen tabBarInset>
      <EmptyState
        title={`${moduleName} — w przygotowaniu`}
        description={`${title}. ${subtitle} Logika biznesowa pojawi się w kolejnych etapach.`}
      />
    </Screen>
  );
}
