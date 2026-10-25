# Gege Quiz — aplikacja quizowa w tematyce piłkarskiej

Gege Quiz to aplikacja webowa z quizami, rankingami i panelem administracyjnym. Interfejs zbudowano w React, a API w Express. Backend zapisuje dane w plikach JSON w katalogu `data/`.

## Spis treści

- [Funkcje](#funkcje)
- [Technologie](#technologie)
- [Wymagania](#wymagania)
- [Uruchomienie lokalne](#uruchomienie-lokalne)
- [Build i uruchomienie produkcyjne](#build-i-uruchomienie-produkcyjne)
- [Konfiguracja](#konfiguracja)
- [Konta początkowe](#konta-początkowe)
- [Korzystanie z aplikacji](#korzystanie-z-aplikacji)
- [API](#api)
- [Pliki danych](#pliki-danych)
- [Testy i jakość kodu](#testy-i-jakość-kodu)
- [Publikacja](#publikacja)
- [Znane ograniczenia i bezpieczeństwo](#znane-ograniczenia-i-bezpieczeństwo)
- [Struktura katalogów](#struktura-katalogów)

## Funkcje

### Dla graczy

- Logowanie do aplikacji.
- Rozwiązywanie quizu ogólnego z losowo wybranymi pytaniami.
- Rozwiązywanie quizów przypisanych bezpośrednio lub przez grupę.
- Informacja o poprawnej i błędnej odpowiedzi po wyborze.
- Zapis wyniku i czasu rozwiązywania.
- Ranking ogólny dla quizu ogólnego oraz osobne zakładki rankingów poszczególnych quizów ręcznych.
- Wylogowanie i powrót do strony głównej.

### Dla administratora

- Dodawanie, wyszukiwanie i usuwanie użytkowników oraz zmiana ich haseł.
- Tworzenie grup i zarządzanie członkostwem.
- Tworzenie quizów z biblioteki pytań i przypisywanie ich użytkownikom lub grupom.
- Edycja istniejących quizów: zmiana nazwy, pytań oraz przypisanych użytkowników i grup.
- Usuwanie quizów. Ich historyczne wyniki pozostają w głównym rankingu.
- Włączanie i wyłączanie quizów.
- Ukrywanie i ponowne pokazywanie całej zakładki rankingu quizu. Operacja nie usuwa wyników ani nie zmienia widoczności poszczególnych rekordów.
- Dodawanie, edycja, wyszukiwanie i usuwanie pytań.
- Podgląd wyników oraz zarządzanie widocznością pojedynczych rekordów.

## Technologie

- **Frontend:** React 19, Vite 8, JavaScript.
- **Backend:** Node.js, Express 5.
- **Dane:** pliki JSON w katalogu `data/`.
- **Lint:** Oxlint.

## Wymagania

- Node.js zgodny z Vite 8 (co najmniej `20.19+` lub `22.12+`).
- npm.

## Uruchomienie lokalne

Wszystkie polecenia wykonuj w katalogu projektu, w którym znajduje się `package.json`.

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Uruchom backend w pierwszym terminalu:

   ```bash
   npm start
   ```

   API będzie dostępne pod adresem `http://localhost:3001`. Endpoint kontrolny: `http://localhost:3001/api/health`.

3. Uruchom frontend w drugim terminalu:

   ```bash
   npm run dev
   ```

4. Otwórz `http://localhost:5173`.

Vite przekazuje żądania z prefiksem `/api` do backendu działającego pod `http://localhost:3001`. Aby udostępnić serwer deweloperski w sieci lokalnej:

```bash
npm run dev -- --host 0.0.0.0
```

## Build i uruchomienie produkcyjne

Zbuduj frontend:

```bash
npm run build
```

Build trafia do katalogu `dist/`. Backend Express serwuje pliki z tego katalogu, obsługuje API i przekazuje pozostałe ścieżki do aplikacji React. Po zbudowaniu projektu uruchom frontend i API razem:

```bash
npm start
```

Domyślny port backendu to `3001`. Można go zmienić zmienną środowiskową `PORT`, na przykład:

```bash
# PowerShell
$env:PORT = "4000"
npm start
```

## Konfiguracja

| Zmienna | Domyślna wartość | Opis |
| --- | --- | --- |
| `PORT` | `3001` | Port serwera Express. |
| `VITE_API_URL` | `/api` | Bazowy adres API używany przez frontend. Jest uwzględniany podczas budowania frontendu. |

Lokalna konfiguracja Vite zawiera proxy `/api` do `http://localhost:3001`. W osobnym środowisku frontendowym można ustawić na przykład `VITE_API_URL=https://adres-api.example.com/api` przed uruchomieniem builda.

## Konta początkowe

Przy pierwszym uruchomieniu backend tworzy pliki danych, jeśli ich brakuje. Początkowe konta demonstracyjne są zdefiniowane w `defaultUsers` w `server.js`. Jeżeli `data/users.json` już istnieje, backend zachowuje jego zawartość i nie nadpisuje jej kontami domyślnymi.

Zmień początkowe hasła przed udostępnieniem aplikacji innym osobom. Nie umieszczaj w repozytorium prawdziwych danych logowania ani danych użytkowników.

## Korzystanie z aplikacji

1. Zaloguj się na istniejące konto.
2. Wybierz rozpoczęcie quizu albo przypisany quiz widoczny na stronie głównej.
3. Wybierz jedną z odpowiedzi. Po krótkiej chwili aplikacja przejdzie do kolejnego pytania.
4. Po zakończeniu zobacz wynik i czas. Wynik zostanie zapisany w rankingu.
5. Otwórz **Rekordy**, aby przejrzeć ranking ogólny lub ranking wybranego quizu.
6. Administratorzy mogą otworzyć **Zarządzaj**, aby obsługiwać użytkowników, grupy, quizy, pytania i rankingi.

Quiz ogólny losuje 10 pytań z wbudowanej puli. Administrator może układać quizy własne z pytań w bibliotece. Pytanie zawiera dokładnie cztery odpowiedzi, a indeks poprawnej odpowiedzi w danych zaczyna się od zera (`0`–`3`).

## API

Wszystkie endpointy API mają prefiks `/api` i przyjmują lub zwracają JSON, chyba że wskazano inaczej.

| Metoda | Endpoint | Opis |
| --- | --- | --- |
| `GET` | `/health` | Sprawdzenie dostępności API. |
| `POST` | `/login` | Logowanie; zwraca dane użytkownika bez pola hasła. |
| `GET` | `/users` | Lista użytkowników bez haseł. |
| `POST` | `/users` | Utworzenie użytkownika. |
| `PUT` | `/users/:id` | Zmiana hasła lub roli użytkownika. |
| `DELETE` | `/users/:id` | Usunięcie użytkownika. |
| `GET` | `/users/:id/quizzes` | Lista aktywnych quizów przypisanych użytkownikowi lub jego grupie. |
| `GET` | `/groups` | Lista grup. |
| `POST` | `/groups` | Utworzenie grupy. |
| `POST` | `/groups/:groupId/users` | Dodanie użytkownika do grupy. |
| `DELETE` | `/groups/:groupId/users/:userId` | Usunięcie użytkownika z grupy. |
| `GET` | `/quizzes` | Lista quizów. |
| `POST` | `/quizzes` | Utworzenie quizu. |
| `PUT` | `/quizzes/:id` | Edycja nazwy, pytań i przypisanych użytkowników oraz grup. |
| `DELETE` | `/quizzes/:id` | Usunięcie quizu; historyczne wyniki pozostają zapisane. |
| `PUT` | `/quizzes/:id/toggle` | Włączenie lub wyłączenie quizu. |
| `PUT` | `/quizzes/:id/leaderboard-visibility` | Pokazanie lub ukrycie zakładki rankingu quizu. |
| `POST` | `/quizzes/assign` | Przypisanie quizu użytkownikom lub grupom. |
| `POST` | `/quizzes/:id/complete` | Oznaczenie quizu jako ukończonego przez użytkownika. |
| `GET` | `/records` | Lista rekordów, maksymalnie 30, posortowana według wyniku. |
| `POST` | `/records` | Zapis wyniku. |
| `PUT` | `/records/:recordId/visibility` | Zmiana widoczności pojedynczego wyniku. |
| `PUT` | `/records/quiz/:quizId/visibility` | Zmiana widoczności rekordów danego quizu. |
| `GET` | `/questions` | Lista pytań dodanych do pliku danych. |
| `POST` | `/questions` | Dodanie pytania. |
| `PUT` | `/questions/:id` | Edycja pytania. |
| `DELETE` | `/questions/:id` | Usunięcie pytania. |

Przykładowe sprawdzenie API:

```bash
curl http://localhost:3001/api/health
```

## Pliki danych

Backend przechowuje stan aplikacji w następujących plikach:

| Plik | Zawartość |
| --- | --- |
| `data/users.json` | Użytkownicy, role i hasła. |
| `data/groups.json` | Grupy i identyfikatory członków. |
| `data/quizzes.json` | Quizy, pytania, przypisania, status i widoczność zakładki rankingu. |
| `data/questions.json` | Pytania utworzone przez administratora. |
| `data/records.json` | Wyniki, czasy i widoczność rekordów. |

Pliki tworzone są przy pierwszym uruchomieniu, jeżeli nie istnieją. Dane zapisują się lokalnie i przetrwają restart procesu, ale nie są współdzielone automatycznie pomiędzy osobnymi instancjami backendu. Zrób kopię katalogu `data/` przed ręczną edycją lub przenoszeniem środowiska. Niepoprawny JSON może zostać zastąpiony wartościami domyślnymi przez mechanizm odczytu danych.

## Testy i jakość kodu

Skrypty dostępne w `package.json`:

```bash
npm run build
npm run lint
npm run preview
```

- `build` — produkcyjny build frontendu.
- `lint` — statyczna analiza plików przez Oxlint.
- `preview` — podgląd builda Vite; aby obsłużyć API, uruchom także backend.

## Publikacja

Projekt zawiera skrypt publikujący statyczny frontend na GitHub Pages:

```bash
npm run deploy
```

GitHub Pages hostuje tylko frontend statyczny. Backend Express i jego pliki JSON muszą działać osobno na serwerze dostępnym z internetu. Przed budowaniem frontendu do takiego wdrożenia skonfiguruj `VITE_API_URL` na publiczny adres API. Sama publikacja do GitHub Pages nie uruchamia backendu.

## Znane ograniczenia i bezpieczeństwo

To projekt demonstracyjny, a nie gotowy system do publicznego użycia:

- Hasła są obecnie przechowywane w pliku JSON w postaci jawnej.
- Endpointy administracyjne API nie wymagają uwierzytelnienia ani nie sprawdzają roli administratora po stronie serwera. Ukrycie panelu w interfejsie nie zabezpiecza endpointów.
- CORS jest skonfigurowany szeroko.
- Pliki JSON nie zapewniają współbieżności, transakcji ani wspólnego magazynu danych dla wielu instancji.
- Kopie plików JSON mogą zawierać dane osobowe i dane logowania; nie udostępniaj ich publicznie.

Przed wdrożeniem publicznym należy dodać bezpieczne haszowanie haseł, prawdziwe uwierzytelnianie i autoryzację po stronie API, ograniczyć CORS oraz przenieść dane do odpowiedniego magazynu.

## Struktura katalogów

```text
.
├── data/                 # Dane aplikacji w plikach JSON
├── public/               # Logo, tło boiska i statyczne zasoby
├── src/
│   ├── assets/           # Zasoby używane przez frontend
│   ├── App.jsx           # Widoki, stan i logika interfejsu
│   ├── App.css           # Style aplikacji
│   ├── api.js            # Klient API
│   ├── index.css         # Style globalne
│   └── main.jsx          # Punkt wejścia React
├── index.html            # Dokument startowy Vite
├── server.js             # API Express i serwowanie builda
├── vite.config.js        # Konfiguracja Vite i proxy API
└── package.json          # Zależności i skrypty npm
```
