import type { IconName } from '@/components';

export const demoUser = {
  name: 'Michał',
  motto: 'Najpierw powtórzenia. Odpoczynek z sensem.',
  weightKg: 80.3,
  heightCm: 178,
  age: 24,
} as const;

export const demoNextWorkout = {
  title: 'Góra ciała',
  subtitle: 'Twój następny trening',
  durationMin: 55,
  focus: 'Pchanie · Przyciąganie',
} as const;

export const demoQuickTools = [
  { href: '/tools/one-rm', label: '1RM', icon: 'calculator' as IconName },
  { href: '/tools/timer', label: 'Timer', icon: 'clock' as IconName },
  { href: '/tools/plates', label: 'Talerze', icon: 'weight' as IconName },
  { href: '/tools/records', label: 'PR', icon: 'dumbbell' as IconName },
] as const;

export const demoTools = [
  {
    href: '/tools/one-rm',
    title: 'Kalkulator 1RM',
    description: 'Szacuj maksimum z ciężaru i powtórzeń',
    icon: 'calculator' as IconName,
  },
  {
    href: '/tools/timer',
    title: 'Timer interwałowy',
    description: 'Rundy, praca i przerwy',
    icon: 'clock' as IconName,
  },
  {
    href: '/tools/plates',
    title: 'Konwerter talerzy',
    description: 'Dobór obciążenia na jedną stronę sztangi',
    icon: 'weight' as IconName,
  },
  {
    href: '/tools/records',
    title: 'Dziennik PR',
    description: 'Rekordy osobiste zapisane na urządzeniu',
    icon: 'dumbbell' as IconName,
  },
] as const;

export const demoPlanCategories = [
  'Wszystkie',
  'Siła',
  'Hipertrofia',
  'Kalistenika',
] as const;

export const demoPlans = [
  {
    id: 'ppl',
    name: 'Push Pull Legs',
    category: 'Siła',
    frequency: '6 dni / tydzień',
    duration: '60–90 min',
    level: 'Średniozaawansowany',
    tags: ['Siła', 'Hipertrofia'],
    days: [
      { day: 'Pon', label: 'Pchanie' },
      { day: 'Wt', label: 'Przyciąganie' },
      { day: 'Śr', label: 'Nogi' },
      { day: 'Czw', label: 'Pchanie' },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Góra / Dół',
    category: 'Hipertrofia',
    frequency: '4 dni / tydzień',
    duration: '50–70 min',
    level: 'Początkujący',
    tags: ['Hipertrofia'],
    days: [
      { day: 'Pon', label: 'Góra' },
      { day: 'Wt', label: 'Dół' },
      { day: 'Czw', label: 'Góra' },
      { day: 'Pt', label: 'Dół' },
    ],
  },
  {
    id: 'calisthenics',
    name: 'Baza z masą ciała',
    category: 'Kalistenika',
    frequency: '3 dni / tydzień',
    duration: '40–55 min',
    level: 'Początkujący',
    tags: ['Kalistenika'],
    days: [
      { day: 'Pon', label: 'Przyciąganie' },
      { day: 'Śr', label: 'Pchanie' },
      { day: 'Pt', label: 'Nogi' },
    ],
  },
] as const;

export const demoRecords = [
  { exercise: 'Przysiad tylny', weightKg: 140, reps: 3, date: '2026-10-08' },
  { exercise: 'Wyciskanie leżąc', weightKg: 100, reps: 2, date: '2026-10-05' },
  { exercise: 'Martwy ciąg', weightKg: 180, reps: 1, date: '2026-09-28' },
] as const;

export const demoBodyWeight = [
  { date: '09.10', weightKg: 81.2 },
  { date: '10.10', weightKg: 81.0 },
  { date: '11.10', weightKg: 80.8 },
  { date: '12.10', weightKg: 80.9 },
  { date: '13.10', weightKg: 80.6 },
  { date: '14.10', weightKg: 80.4 },
  { date: '15.10', weightKg: 80.3 },
] as const;

export const demoProgressSummary = {
  currentWeightKg: 80.3,
  heightCm: 178,
  bmiLabel: '25.3',
  bmiRange: 'Zakres prawidłowy',
  goal: 'Redukcja',
} as const;

export const demoOneRmPreview = {
  weightKg: 100,
  reps: 5,
  estimated1Rm: 120,
  intensityRows: [
    { pct: 100, weight: 120, reps: '1' },
    { pct: 90, weight: 108, reps: '3–4' },
    { pct: 80, weight: 96, reps: '5–6' },
    { pct: 70, weight: 84, reps: '8–10' },
    { pct: 60, weight: 72, reps: '12+' },
  ],
} as const;

export const demoTimerPreview = {
  rounds: 8,
  workSeconds: 45,
  restSeconds: 15,
  display: '00:45',
} as const;

export const demoPlatesPreview = {
  totalKg: 100,
  barKg: 20,
  perSide: [
    { plateKg: 25, count: 1 },
    { plateKg: 10, count: 1 },
    { plateKg: 5, count: 1 },
  ],
} as const;

export const demoProfileLinks = [
  { href: '/progress', title: 'Cele', icon: 'target' as IconName },
  { href: '/profile', title: 'Ustawienia', icon: 'settings' as IconName },
  { href: '/profile', title: 'Pomoc', icon: 'circleHelp' as IconName },
  { href: '/profile', title: 'O aplikacji', icon: 'info' as IconName },
] as const;
