# Zaawansowane testowanie w React

Ten rozdział polega na przetestowaniu twojej wiedzy i przetestowaniu rzeczywistego wycinka aplikacji (w tym przypadku Planera). Składa się on z:

- ekranu logowania - podajesz mail, a potem kod, który dostajesz na maila (jest w konsoli 😭)
- ekranu listy planów

Mamy tutaj takie elementy jak:

- formularze - wpisywanie maila i kodu OTP
- stan - przechowywanie informacji o zalogowanym użytkowniku
- autentykacja - logowanie się do aplikacji
- routing - przechodzenie między ekranami

Zachęcam do obejrzenia niżej podlinkowanych części kursu, ale obstawiam, że z obecną wiedzą też sobie poradzicie :3.

Po wykonaniu wszystkich części należy wykonać zadanie końcowe.

## Części kursu

1. [Testowanie formularzy](https://drive.google.com/drive/folders/18vvLyR0upq840auDx0_2r_tFfjosx8rd?usp=drive_link)
1. [Testowanie stanu](https://drive.google.com/drive/folders/1DTvfaLK5nE2cuP_QKuXhkC9Cl2CAzJGG?usp=drive_link)
1. [Testowanie autentykacji](https://drive.google.com/drive/folders/1d-Q6UKZgJNcypYWX39V1oIDW0ovTJYE_?usp=drive_link)
1. [Testowanie routingu](https://drive.google.com/drive/folders/1vF2anQf0zIIaCK9YP9Nm1ifLwcH_mXZH?usp=drive_link)

## Zadania końcowe

W skrócie - macie przetestować jak największą część tej aplikacji - im wyższy code coverage, tym lepiej. Zachęcam do pomyślenia samemu co warto przetestować. Wymagane jest:

- użycie MSW do zamockowania API
- test renderujący LoginPage
- test routingu przy użyciu [createMemoryRouter](https://reactrouter.com/api/data-routers/createMemoryRouter)

Tak jak zawsze, od zawsze zależy jak daleko polecicie

Instrukcja jak uruchomić aplikację jest na końcu tego pliku.

Dodatkowo pamiętaj o zrobienu review PR'ki partnera z poprzedniego zadania - jest to wymagane do zaliczenia zadania.

### Oddanie zadania

Aby oddać zadanie, należy wykonać pull requesta do tego repozytorium, po czym oznaczacie przypisaną wam osobę do review. Format PR'a powinien być następujący:

- branch: `imie-nazwisko/6-react-advanced-tests`, np. `bartosz-gotowski/6-react-advanced-tests`
- tytuł: `Imię Nazwisko - Etap 6, React Advanced Tests`, np. `Bartosz Gotowski - Etap 6, React Advanced Tests`

PR powinien zawierać jedynie obecnie oddawane zadanie!!! Uważajcie, żeby przypadkiem przypadkiem nie dodać poprzednich zadań. Zacznijcie brancha na świeżo z `main`a, żeby nie było problemów.

### Jak odpalić aplikacje?

1. Sklonuj repozytorium.

   ```sh
   git clone git@github.com:Solvro/testing-course.git
   ```

1. Przejdź do katalogu z zadaniami.

   ```sh
   cd testing-course/2a.\ React/3.\ Advanced\ tests
   ```

1. Zainstaluj zależności

   ```sh
   npm install
   ```

1. Uruchom aplikację

   ```sh
   npm run dev
   ```

1. Otwórz przeglądarkę i przejdź do adresu `http://localhost:5173/`.
