/**
 * Example program catalog shown on the Plans tab until plan persistence
 * exists. Labelled in the UI as examples — never presented as user data.
 */

export const demoPlanCategories = [
  'Wszystkie',
  'Siła',
  'Hipertrofia',
  'Kalistenika',
] as const;

export type DemoPlanCategory = (typeof demoPlanCategories)[number];

export const demoPlans = [
  {
    id: 'ppl',
    name: 'Push Pull Legs',
    category: 'Siła',
    frequency: '6 dni w tygodniu',
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
    frequency: '4 dni w tygodniu',
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
    frequency: '3 dni w tygodniu',
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
