import { router } from 'expo-router';

import { EmptyState, ScreenContainer } from '@/components';

export default function NotFoundScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="info"
        title="Ten ekran nie istnieje"
        description="Link mógł się zmienić albo ekran został usunięty."
        actionLabel="Wróć do ekranu głównego"
        onActionPress={() => router.replace('/')}
      />
    </ScreenContainer>
  );
}
