# Quiz kwantowy — React + Express

To jest aplikacja quizowa z prostym panelem logowania, rankingiem rekordów, systemem grup i zarządzaniem quizami dla administratora. Aplikacja korzysta z frontendu React (Vite) i backendu Express z zapisem danych w plikach JSON.

## Funkcjonalności

- quiz z pytaniami z fizyki kwantowej
- ekran startowy z loginem
- zapis wyników i czasu rozwiązywania quizu
- ranking rekordów z podziałem na główny ranking i ranking dla konkretnego quizu
- logowanie użytkowników i administratora
- panel admina do:
  - dodawania i usuwania użytkowników
  - zmiany hasła użytkownika
  - tworzenia grup użytkowników
  - przypisywania użytkowników do grup
  - tworzenia własnych quizów
  - przypisywania quizów do użytkowników i grup
  - włączania i wyłączania quizów
  - zarządzania widocznością rekordów w rankingach
- zapis danych do plików JSON w katalogu `data/`

## Struktura projektu

- `src/` — frontend React
- `server.js` — backend Express
- `data/` — pliki z użytkownikami, grupami, quizami i rekordami
- `vite.config.js` — konfiguracja Vite i proxy do API

## Domyślni użytkownicy

Po pierwszym uruchomieniu backendu tworzone są domyślne konta:

- admin / admin123
- demo / demo123

## Wymagania

- Node.js 18+
- npm

## Uruchomienie lokalne

1. Otwórz terminal w katalogu projektu.
2. Zainstaluj zależności:

```bash
npm install
```

3. Uruchom backend:

```bash
node server.js
```

4. Uruchom frontend w osobnym terminalu:

```bash
npm run dev -- --host 0.0.0.0
```

5. Otwórz aplikację w przeglądarce:

- http://localhost:5173/

Backend API działa pod adresem:

- http://localhost:3001/

## Build produkcyjny

```bash
npm run build
```

## GitHub Pages / deploy

Projekt ma ustawiony parametr `homepage` do GitHub Pages i skrypt `deploy`:

```bash
npm run deploy
```

## Uwagi

- frontend komunikuje się z backendem przez `/api`
- Vite jest skonfigurowany z proxy do `http://localhost:3001`
- dane są przechowywane lokalnie w plikach JSON, więc po zmianach w aplikacji nie traci się stanu po restarcie serwera

## Autor

Projekt wykonany jako aplikacja do nauki i demonstracji mechaniki quizowej w React + Express.
