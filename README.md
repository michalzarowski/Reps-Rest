# Rep&Rest — plan projektu aplikacji mobilnej

> **Rep&Rest** to minimalistyczny, lokalny asystent treningowy dla osób trenujących siłowo, kalistenikę i sporty walki. Łączy szybkie kalkulatory, timer interwałowy, dziennik rekordów, monitorowanie masy ciała i kreator planów treningowych.

## 1. Metryczka projektu

| Pole | Wartość |
|---|---|
| Imię i nazwisko | Michał Żarowski |
| Numer indeksu | 346727 |
| Przedmiot | PAM |
| Nazwa aplikacji | Rep&Rest |
| Repozytorium | [github.com/michalzarowski/Reps-Rest](https://github.com/michalzarowski/Reps-Rest) |
| Rok akademicki | 2023/2027 — **do weryfikacji** |
| Semestr | Zimowy |
| Grupa | 1 |

## 2. Cel i założenia

Celem projektu jest stworzenie aplikacji mobilnej, która pozwala szybko wykonać najczęstsze obliczenia treningowe i zapisywać podstawowe dane bez konieczności zakładania konta. Interfejs ma być czytelny, szybki w obsłudze na siłowni i dostosowany do małego ekranu.

### Główne założenia

- **Mobile-first:** interfejs przeznaczony przede wszystkim na Androida/iOS.
- **Local-first:** dane użytkownika są przechowywane na urządzeniu; działanie podstawowych funkcji nie wymaga konta.
- **Prostota:** użytkownik powinien przejść od ekranu głównego do kalkulatora lub timera w kilku dotknięciach.
- **Walidacja:** pola liczbowe, jednostki i zakresy muszą być weryfikowane przed obliczeniami.
- **Rozszerzalność:** moduły mają być rozdzielone na komponenty, usługi i narzędzia domenowe.

## 3. Technologie

| Obszar | Proponowane rozwiązanie | Uwagi |
|---|---|---|
| Aplikacja | React Native + Expo | Jeden projekt dla Androida i iOS. |
| Język | TypeScript | Zalecany dla modeli danych, parametrów funkcji i ograniczenia błędów. |
| Stylowanie | NativeWind | Ułatwia utrzymanie spójnych stylów; konfigurację trzeba dopasować do wybranej wersji Expo. |
| Stan aplikacji | React Context API + hooks | Wystarczy dla niewielkiego projektu; stan globalny powinien obejmować tylko dane współdzielone. |
| Trwały zapis | `@react-native-async-storage/async-storage` | Odpowiedni dla małej ilości niesensytywnych danych. Dane obiektowe zapisujemy jako JSON. |
| Katalog ćwiczeń | REST API wger | Publiczne endpointy katalogu mogą być dostępne bez uwierzytelnienia; należy obsłużyć paginację, brak połączenia i błędy API. |
| Wykresy | Jedna wybrana biblioteka wykresów dla React Native | Przed wyborem sprawdzić zgodność z wersją Expo/React Native. Nie ma potrzeby dodawania dwóch bibliotek wykresów. |
| AI — opcjonalnie | Google Gemini API | Dopiero po ukończeniu wersji bazowej; wymagane bezpieczne pośrednictwo backendu/proxy. |
| Kontrola wersji | Git + GitHub | Małe commity po każdym działającym fragmencie, repozytorium aktualizowane na bieżąco. |

> **Uwaga o danych lokalnych:** AsyncStorage nie szyfruje danych. Nie należy przechowywać w nim kluczy API, haseł ani innych sekretów. Do prostego dziennika i ustawień jest wystarczający; jeśli historia urośnie lub pojawią się bardziej złożone zapytania, można rozważyć SQLite.

## 4. Zakres funkcjonalny

Aby zachować realność harmonogramu, funkcje dzielą się na **wersję bazową (MVP)** oraz rozszerzenia. Wszystkie wymienione moduły są częścią koncepcji, lecz zaawansowane dodatki nie powinny blokować ukończenia podstawowej aplikacji.

### 4.1. Funkcje wersji bazowej (MVP)

#### A. Kalkulator szacowanego 1RM

- Wejście: ciężar roboczy, liczba wykonanych powtórzeń oraz opcjonalnie wybrana formuła.
- Wynik: szacowany ciężar maksymalny dla jednego powtórzenia (1RM).
- Formuły do wyboru:
  - **Epley:** `1RM = ciężar × (1 + powtórzenia / 30)`
  - **Brzycki:** `1RM = ciężar × 36 / (37 − powtórzenia)`
- Prosta tabela lub wykres szacowanego 1RM przy różnych liczbach powtórzeń może być pokazany jako część modułu.
- Walidacja: ciężar musi być większy od zera; liczba powtórzeń to dodatnia liczba całkowita. Praktycznie warto ograniczyć zakres do około 1–10 powtórzeń i wyświetlać ostrzeżenie dla większych wartości.
- Wyraźna informacja, że wynik jest **estymacją**, a nie gwarantowanym wynikiem testu maksymalnego.

#### B. Timer interwałowy

- Konfiguracja czasu pracy/rundy, przerwy i liczby rund.
- Start, pauza, wznowienie i reset.
- Czytelne wyświetlanie pozostałego czasu, numeru rundy i bieżącej fazy.
- Presety, np. „boks 3 × 3 min / 1 min przerwy” i „obwód 40 s / 20 s”.
- Sygnał dźwiękowy lub wibracja na zmianę fazy, jeśli będzie możliwy do niezawodnego wdrożenia na docelowych urządzeniach.
- Timer nie powinien polegać wyłącznie na wielokrotnym zmniejszaniu licznika co sekundę. Powinien wyliczać pozostały czas na podstawie znacznika czasu, aby ograniczyć dryf po chwilowym przycięciu interfejsu. Zachowanie po zminimalizowaniu aplikacji trzeba osobno przetestować.

#### C. Konwerter obciążeń na sztangę

- Wprowadzanie docelowej masy całkowitej, masy gryfu i dostępnych talerzy.
- Wyliczanie zestawu talerzy **na jedną stronę sztangi**.
- Dążenie do symetrycznego obciążenia obu stron.
- Obsługa typowych talerzy (np. 1,25; 2,5; 5; 10; 15; 20; 25 kg) oraz własnej listy talerzy.
- Informacja, gdy danego ciężaru nie można uzyskać z podanych talerzy; opcjonalnie wskazanie najbliższego możliwego ciężaru.
- Walidacja: masa docelowa nie może być mniejsza niż masa gryfu, a obliczenie musi uwzględniać ciężar całkowity, nie tylko obciążenie jednej strony.

#### D. Dziennik rekordów (PRs)

- Dodawanie rekordu dla nazwanego ćwiczenia.
- Pola: ciężar, liczba powtórzeń, data i opcjonalna notatka.
- Lista ostatnich rekordów oraz najwyższy zapisany ciężar dla danego ćwiczenia.
- Edycja i usuwanie wpisu.
- Dane zapisywane lokalnie, dostępne po ponownym uruchomieniu aplikacji.

#### E. Śledzenie masy ciała i BMI

- Ręczne dodawanie pomiaru masy ciała z datą.
- Wprowadzenie wzrostu i wyliczenie BMI.
- Wykres zmian masy ciała oraz czytelna historia wpisów.
- Opcjonalny wybór celu użytkownika, np. redukcja, utrzymanie lub budowa masy, służący wyłącznie do opisu obserwowanego trendu.
- BMI musi być opisane jako **orientacyjny wskaźnik oparty na wzroście i masie ciała**, a nie pomiar tkanki tłuszczowej. Przy osobach umięśnionych może dawać mylący obraz; nie należy na jego podstawie stawiać diagnoz ani automatycznie zalecać redukcji.

#### F. Kreator planów treningowych

- Tworzenie planu i dodawanie do niego ćwiczeń.
- Dla każdego ćwiczenia możliwość określenia liczby serii, zakresu powtórzeń, przerwy i notatki.
- Przegląd oraz edycja kolejności ćwiczeń.
- Katalog ćwiczeń pobierany z wger, z kategoriami grup mięśniowych i sprzętu — w zakresie faktycznie udostępnianym przez API.
- Możliwość dodania ćwiczenia własnego, jeśli nie ma go w katalogu.
- Obsługa ładowania, błędu API, pustych wyników i braku internetu. W razie awarii katalog powinien nadal umożliwiać korzystanie z ćwiczeń zapisanych lokalnie.

### 4.2. Rozszerzenia po ukończeniu MVP

#### G. Eksport danych do CSV

- Eksport historii masy ciała i rekordów PR do pliku CSV.
- Czytelne nagłówki kolumn, format daty i prawidłowe rozdzielanie pól, także gdy notatka zawiera przecinki.
- Wybór sposobu zapisania lub udostępnienia pliku z poziomu urządzenia.

#### H. Asystent AI (Gemini)

- Czat odpowiadający na ogólne pytania treningowe i pomagający znaleźć alternatywne ćwiczenia.
- Kontekst może obejmować wybrany plan lub ćwiczenie, ale tylko dane niezbędne do odpowiedzi.
- Jeśli korzysta z wyszukiwania internetowego, aplikacja powinna wyświetlać źródła zwrócone przez API, o ile są dostępne.
- Asystent nie może diagnozować urazów ani przedstawiać się jako fizjoterapeuta. Przy bólu, kontuzji lub ograniczeniach zdrowotnych powinien sugerować kontakt ze specjalistą zamiast samodzielnego dobierania rehabilitacji.
- **Bezpieczeństwo klucza:** klucz Gemini wpisany bezpośrednio w kod aplikacji można odzyskać z paczki aplikacji. W wersji demonstracyjnej funkcję należy pominąć albo wywoływać API przez backend/proxy, który przechowuje sekret poza aplikacją.
- Należy sprawdzić bieżącą dokumentację, dostępność modelu, limity i ceny przed wdrożeniem. Konfiguracja wyszukiwania w aktualnej dokumentacji używa narzędzia `google_search`; starsze przykłady mogą pokazywać `googleSearchRetrieval`.

### 4.3. Proponowane dodatki, jeśli zostanie czas

1. **Presety timera i ulubione ćwiczenia** — wysoka użyteczność, niski koszt wdrożenia.
2. **Historia kalkulatora 1RM** — śledzenie szacowanego wyniku w czasie dla tego samego ćwiczenia.
3. **Filtrowanie katalogu** według sprzętu, grupy mięśniowej i nazwy.
4. **Eksport/import kopii danych** — użyteczne przy zmianie telefonu; import powinien weryfikować strukturę pliku.
5. **Tryb ciemny i większe elementy sterujące** — wygoda podczas treningu.

Funkcje takie jak logowanie, synchronizacja w chmurze, społeczność, powiadomienia rozbudowane lub pełne generowanie planów przez AI należy pozostawić poza zakresem tej wersji.

## 5. Architektura i organizacja kodu

Proponowany podział katalogów (może zostać dostosowany do struktury utworzonej przez Expo):

```text
src/
  components/       # współdzielone elementy UI
  screens/          # ekrany aplikacji
  features/
    one-rm/         # formularz, wynik i logika kalkulatora
    interval-timer/ # timer, ustawienia i presety
    plate-calculator/
    records/        # dziennik PR
    body-progress/  # pomiary i BMI
    workout-plans/  # plany i katalog ćwiczeń
  context/          # współdzielony stan, jeśli jest potrzebny
  hooks/            # własne hooki
  services/
    exercise-api/   # klient API wger
    storage/        # odczyt i zapis danych lokalnych
  utils/            # formuły i funkcje bez zależności od UI
  types/            # modele TypeScript
```

### Zasady implementacji

- Logikę obliczeń (1RM, talerze, BMI) oddzielić od komponentów UI, aby można ją było przetestować niezależnie.
- Context API stosować do współdzielonych danych i operacji; nie umieszczać całej logiki aplikacji w jednym dużym providerze.
- Zapisy i odczyty AsyncStorage opakować w funkcje/usługi. Obsłużyć wyjątki oraz stan ładowania.
- Warto użyć wersjonowania struktury danych (np. `schemaVersion`), aby później bezpiecznie rozszerzyć format lokalnych zapisów.
- Dane z API normalizować do własnego modelu aplikacji; nie zakładać, że wszystkie pola zewnętrznego źródła będą zawsze wypełnione.
- Sekrety i klucze API trzymać poza repozytorium. Plik `.env` nie zabezpiecza sekretu, jeśli zostanie wbudowany do aplikacji mobilnej.

### Proponowane modele danych

| Model | Przykładowe pola |
|---|---|
| `Exercise` | `id`, `name`, `muscleGroups`, `equipment`, `source`, `isCustom` |
| `WorkoutPlan` | `id`, `name`, `createdAt`, `updatedAt`, `items[]` |
| `WorkoutPlanItem` | `exerciseId`, `order`, `sets`, `repMin`, `repMax`, `restSeconds`, `notes` |
| `PersonalRecord` | `id`, `exerciseId`, `weightKg`, `reps`, `date`, `notes` |
| `BodyWeightEntry` | `id`, `date`, `weightKg` |
| `TimerPreset` | `id`, `name`, `rounds`, `workSeconds`, `restSeconds`, `warmupSeconds` |
| `UserSettings` | `heightCm`, `preferredUnit`, `availablePlatesKg`, `theme` |

Wewnętrznie warto przechowywać masy w jednej jednostce (np. kg), a dopiero przy prezentacji przeliczać je na preferowaną jednostkę. Każdy rekord powinien mieć stabilny identyfikator, a nie opierać się wyłącznie na nazwie ćwiczenia.

## 6. Proponowane ekrany

1. **Strona główna:** kafelki skrótów do najczęściej używanych modułów.
2. **Kalkulatory:** zakładki lub osobne ekrany 1RM i obciążeń na sztangę.
3. **Timer:** duży licznik, faza/runda, podstawowe sterowanie i wybór presetu.
4. **Rekordy:** lista rekordów, formularz dodawania i szczegóły ćwiczenia.
5. **Postępy:** historia masy ciała, wykres i BMI.
6. **Plany:** lista planów, edytor planu oraz przegląd katalogu ćwiczeń.
7. **Ustawienia:** jednostki, wzrost, dostępne talerze i preferencje UI.

## 7. Harmonogram — 5 spotkań

Plan zakłada pięć spotkań roboczych, każde około 90–120 minut. Między spotkaniami warto samodzielnie dopracować rozpoczęte zadania. Harmonogram opisuje zakres minimalny; rozszerzenia realizować dopiero po spełnieniu kryteriów wersji bazowej.

| Spotkanie | Zakres prac | Rezultat / kryterium zakończenia |
|---|---|---|
| **1. Fundamenty i szkielet aplikacji** | Doprecyzowanie MVP; utworzenie projektu Expo + TypeScript; konfiguracja NativeWind; podstawowa nawigacja; motyw i komponenty bazowe; struktura katalogów; konfiguracja Git. | Aplikacja uruchamia się na urządzeniu/emulatorze, ma działające przejścia między pustymi ekranami modułów, a repozytorium zawiera pierwszą działającą wersję. |
| **2. Kalkulatory i logika domenowa** | Implementacja kalkulatora 1RM (Epley/Brzycki), walidacja; konwerter obciążeń z masą gryfu i talerzami na jedną stronę; proste testy funkcji obliczeniowych; dopracowanie formularzy. | Kalkulatory poprawnie liczą typowe przypadki, odrzucają nieprawidłowe dane i pokazują czytelne komunikaty. |
| **3. Timer i dziennik PR** | Timer z rundami/przerwami, start/pauza/reset i presetami; dziennik rekordów; zapis i odczyt lokalny; obsługa błędów zapisu oraz ponownego uruchomienia aplikacji. | Ustawiony timer działa zgodnie z parametrami, a dodane rekordy zostają zachowane po zamknięciu i ponownym uruchomieniu aplikacji. |
| **4. Kreator planów i katalog ćwiczeń** | Modele `Exercise` i `WorkoutPlan`; tworzenie/edycja planu; dodawanie ćwiczeń; integracja wger; stany ładowania, pustego wyniku i błędu sieci; możliwość dodania ćwiczenia własnego. | Użytkownik tworzy i zapisuje plan z ćwiczeniami z katalogu lub własnymi. Podstawowe plany są dostępne także bez internetu po wcześniejszym zapisaniu. |
| **5. Postępy, testy i prezentacja** | Historia masy ciała, BMI i wykres; testy manualne całej aplikacji; poprawki UI; pusty stan i komunikaty błędów; finalne README i przygotowanie demonstracji. Jeśli zostanie czas: eksport CSV. | Wszystkie funkcje bazowe są możliwe do zademonstrowania, dane zachowują się poprawnie, a repozytorium zawiera opis uruchomienia i ograniczeń. |

### Kolejność priorytetów przy opóźnieniach

1. Zachować sprawne działanie i lokalny zapis danych.
2. Ukończyć 1RM, konwerter, timer oraz dziennik PR.
3. Uprościć kreator planów do dodawania/edycji ćwiczeń i zapisu lokalnego; katalog zewnętrzny może mieć ograniczony zakres.
4. Dodać podstawowy wykres masy ciała, jeśli rozbudowana wizualizacja okaże się zbyt czasochłonna.
5. Eksport CSV i AI wdrażać dopiero wtedy, gdy wszystkie poprzednie punkty działają.

## 8. Testowanie i kryteria jakości

### Testy funkcjonalne

- Kalkulator 1RM: test poprawnego wyniku, ciężaru zerowego/ujemnego, niecałkowitej liczby powtórzeń i nietypowo dużej liczby powtórzeń.
- Konwerter talerzy: ciężar równy wadze gryfu, ciężar mniejszy od gryfu, dokładne dopasowanie i brak możliwej kombinacji.
- Timer: start, pauza, wznowienie, reset, przejście z pracy do przerwy i koniec ostatniej rundy.
- Dane lokalne: zapis, odczyt, edycja i usuwanie oraz zachowanie danych po restarcie aplikacji.
- Katalog ćwiczeń: wskaźnik ładowania, brak wyników, błąd połączenia i obsługa brakujących pól API.
- Formularze: komunikaty walidacyjne i blokada przypadkowego zapisu niepoprawnych danych.

### Kryteria gotowości

- Każdy moduł bazowy ma przynajmniej jeden przetestowany scenariusz pozytywny i najważniejszy scenariusz błędny.
- Brak internetu nie blokuje kalkulatorów, timera, dziennika ani planów już zapisanych lokalnie.
- Ekrany mają stany ładowania, puste i błędu tam, gdzie to potrzebne.
- Interfejs pozostaje czytelny na typowym ekranie telefonu.
- README zawiera instrukcję uruchomienia, opis funkcji i znane ograniczenia.

## 9. Uruchomienie projektu

Wymagane: Node.js w wersji zgodnej z wybraną wersją Expo, npm oraz aplikacja Expo Go lub emulator/urządzenie skonfigurowane do testów.

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego Expo
npx expo start
```

Jeśli projekt nie został jeszcze utworzony, najpierw należy wygenerować aplikację Expo z TypeScript, a następnie zainstalować pakiety kompatybilne z wybraną wersją SDK. Biblioteki natywne należy instalować zgodnie z dokumentacją Expo, preferując `npx expo install` tam, gdzie jest to zalecane.

> Powyższe polecenia są standardowym punktem startowym. Jeżeli istniejący projekt ma inne skrypty w `package.json`, należy stosować instrukcje z jego konfiguracji.

## 10. Ryzyka i sposoby ograniczenia

| Ryzyko | Znaczenie | Sposób ograniczenia |
|---|---|---|
| Zbyt szeroki zakres w pięciu spotkaniach | Wysokie | Najpierw MVP; AI i eksport jako rozszerzenia, bez dokładania nowych modułów przed ukończeniem podstaw. |
| API wger niedostępne lub zmieniające format | Średnie | Obsłużyć błędy/paginację, normalizować odpowiedź i umożliwić własne ćwiczenia oraz lokalny dostęp do wcześniej zapisanych danych. |
| Niedokładność timera w tle | Średnie | Obliczać czas z wykorzystaniem znaczników czasu i testować zachowanie po zminimalizowaniu aplikacji; nie obiecywać dokładności, której system nie gwarantuje. |
| Utrata lub niepoprawny odczyt danych lokalnych | Średnie | Centralna warstwa storage, obsługa wyjątków, stabilne identyfikatory i wersjonowanie schematu danych. |
| Ujawnienie klucza Gemini | Wysokie | Nie umieszczać sekretu w aplikacji mobilnej ani publicznym repozytorium; użyć backendu/proxy albo zrezygnować z AI w ramach tej wersji. |
| Myląca interpretacja BMI lub porada dotycząca urazu | Wysokie | Dodać wyjaśnienie ograniczeń BMI, nie przedstawiać aplikacji jako medycznej i nie generować diagnoz ani planów rehabilitacji. |
| Problem ze zgodnością biblioteki wykresów | Średnie | Wybrać jedną bibliotekę dopiero po sprawdzeniu jej kompatybilności z wersjami Expo i React Native w projekcie. |

## 11. Źródła techniczne

- [Dokumentacja Expo — AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/) — przechowywanie małych ilości danych lokalnych.
- [Dokumentacja Expo — przechowywanie danych](https://docs.expo.dev/develop/user-interface/store-data/) — porównanie AsyncStorage i SQLite.
- [Dokumentacja API wger](https://github.com/wger-project/docs/blob/master/docs/api/api.rst) — endpointy REST, format odpowiedzi i paginacja.
- [Dokumentacja Gemini — Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search/) — aktualna konfiguracja wyszukiwania i informacje o użyciu.
- [Dokumentacja React Native — AppState](https://reactnative.dev/docs/appstate) — wykrywanie przejścia aplikacji między pierwszym planem a tłem.

## 12. Podsumowanie

Rep&Rest ma łączyć sześć praktycznych obszarów: kalkulator 1RM, timer interwałowy, konwerter obciążeń, dziennik rekordów, śledzenie masy ciała oraz kreator planów. Najważniejsze dla powodzenia projektu jest ukończenie małej, stabilnej wersji działającej offline, a następnie rozwijanie jej o eksport, lepszą wizualizację i ewentualnie AI. W pięciu spotkaniach warto oceniać postęp według działających scenariuszy, a nie liczby rozpoczętych funkcji.
