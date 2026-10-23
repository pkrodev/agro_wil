# Uruchomienie sprzedaży – Shopify

Sklep na stronie (wygląd, opisy, zdjęcia, rekomendacje) zostaje na GitHub Pages.
**Shopify** odpowiada za: ceny i stany magazynowe, kasę, płatności, wysyłkę, zamówienia i maile do klientów.

Połączenie: produkty łączą się po **URL handle** w Shopify = `id` produktu w `shop/products.js`
(np. `filtr-oleju-re504836`). Dopóki w `shop/shopify-config.js` nie ma adresu sklepu, strona działa w trybie pokazowym.

---

## 1. Załóż sklep Shopify
1. Załóż konto na <https://www.shopify.com/pl> (na dane firmy AgroWil) i wybierz plan.
2. **Ustawienia → Dane sklepu**: nazwa, adres firmy, NIP, waluta **PLN**, strefa czasowa Warszawa.
3. **Ustawienia → Podatki i cła**: Polska, zaznacz **„Wszystkie ceny zawierają podatek”** (ceny w sklepie są brutto, 23% VAT).

## 2. Płatności
**Ustawienia → Płatności** – włącz dostępnych dostawców (np. Shopify Payments, jeśli jest dostępne dla Polski,
albo Przelewy24 / PayU / Tpay – one obsługują BLIK i szybkie przelewy). Każdy dostawca ma własną umowę i prowizje.
Opcjonalnie dodaj metody ręczne: **przelew tradycyjny** i **płatność przy odbiorze**.

## 3. Wysyłka
**Ustawienia → Wysyłka i dostawa → Polska**:
- Kurier – 19,99 zł, oraz stawka **0 zł dla zamówień od 500 zł** (warunek na wartość zamówienia),
- Paczkomaty InPost – przez aplikację InPost z Shopify App Store (paczki do 25 kg),
- **Odbiór lokalny** – Popowo Północ, gm. Nasielsk.

> Jeśli zmienisz próg darmowej dostawy, zmień też `FREE_SHIPPING_FROM` w `shop/shop.js` (pasek „brakuje X zł”).

## 4. Import produktów
1. **Produkty → Importuj** → wybierz `shopify/produkty-shopify.csv` (20 produktów z cenami, stanami, wagą i zdjęciami).
2. Sprawdź ceny, stany i **wagi** (są szacunkowe – liczą się do kosztu wysyłki).
3. Plik generuje się z katalogu: `node tools/shopify-csv.mjs` (po zmianach w `shop/products.js`).

## 5. Kanał „Headless” i klucz dla strony
1. **Ustawienia → Aplikacje i kanały sprzedaży → Shopify App Store** → zainstaluj **Headless** (aplikacja Shopify).
2. W Headless: **Utwórz sklep (storefront)** → **Storefront API**:
   - skopiuj **publiczny token dostępu** (*Public access token*) – **nie** prywatny i **nie** token Admin API,
   - w uprawnieniach włącz **odczyt stanów magazynowych** (`unauthenticated_read_product_inventory`) – wtedy strona pokazuje „Ostatnie sztuki (3)”.
3. **Produkty** → zaznacz wszystkie → **Więcej działań → Uwzględnij w kanałach sprzedaży → Headless**.
   Produkt niewidoczny w kanale Headless pokaże się na stronie jako „Zapytaj o termin”.
4. Wpisz dane w `shop/shopify-config.js`:
   ```js
   domain: 'twoj-sklep.myshopify.com',
   token: 'publiczny-token-storefront',
   ```
   Publiczny token jest przeznaczony do użycia w przeglądarce, więc może trafić do repozytorium.

## 6. Powiadomienia, regulaminy, faktury
- **Ustawienia → Powiadomienia**: e-mail dla obsługi o nowym zamówieniu (np. damianwilski@wp.pl) i treść maili do klientów po polsku.
- **Ustawienia → Zasady**: regulamin, polityka prywatności, zasady zwrotów (14 dni) – wymagane przy sprzedaży online.
- **Faktury VAT**: aplikacja do faktur z App Store (np. integracja z programem księgowym).
- **Ustawienia → Kasa**: logo, kolory, pole telefonu jako wymagane; uwagi klienta (np. **numer VIN**) przychodzą z koszyka na stronie jako notatka zamówienia.

## 7. Promocje i Omnibus
Cenę promocyjną ustawiasz w Shopify: **Cena** (nowa) i **Cena przed rabatem** (*Compare-at price*).
Strona musi pokazać **najniższą cenę z 30 dni przed obniżką**:
- utwórz definicję metapola produktu `custom.najnizsza_cena_30` (typ: liczba dziesiętna) z dostępem dla Storefront API
  i wpisuj wartość przy promocjach, **albo**
- ustaw `lowest30` w `shop/products.js` (działa, gdy cena i cena przed rabatem zgadzają się z Shopify).

## 8. Test przed startem
1. **Ustawienia → Płatności** → tryb testowy dostawcy (albo *Bogus Gateway* do testów).
2. Na stronie: dodaj produkty do koszyka → wpisz VIN w uwagach → **Przejdź do kasy** → złóż zamówienie testowe.
3. Sprawdź: zamówienie w panelu Shopify, notatka z VIN, mail do klienta i do obsługi, po powrocie na stronę koszyk jest pusty.
4. Wyłącz tryb testowy.

## Jak to działa technicznie
- `shop/shopify.js` – przy wejściu na stronę pobiera z Storefront API cenę, cenę przed rabatem i stan każdego produktu
  (jedno zapytanie, pamięć podręczna 5 min). Gdy Shopify nie odpowie w 6 s, strona pokazuje ceny z `products.js`, a kasa zgłasza błąd z numerem telefonu.
- „Przejdź do kasy” tworzy koszyk w Shopify (`cartCreate`) i przenosi klienta do kasy Shopify (`checkoutUrl`).
- Nowy produkt: dodaj go w `shop/products.js` **i** w Shopify z tym samym *URL handle* (albo ustaw w produkcie `shopifyHandle`).
