import { Text } from 'react-native';

/** Required wording: BMI is an orientation index, not a body-fat measurement. */
export function BmiNote() {
  return (
    <Text className="text-label text-text-muted">
      BMI to orientacyjny wskaźnik liczony tylko z masy ciała i wzrostu. Nie mierzy tkanki
      tłuszczowej, a u osób umięśnionych może dawać mylący obraz. Nie służy do diagnozy.
    </Text>
  );
}
