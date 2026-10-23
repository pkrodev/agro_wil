// shop/products.js – katalog sklepu AgroWil (dane przykładowe)
// Numery katalogowe i ceny są poglądowe – przed startem sklepu podmień na dane z hurtowni / systemu magazynowego.

window.AGW_CATEGORIES = [
  { id: 'filtry',     name: 'Filtry',                desc: 'Filtry oleju, paliwa, powietrza, hydrauliki i kabinowe do ciągników i kombajnów John Deere.' },
  { id: 'oleje',      name: 'Oleje i płyny',         desc: 'Oryginalne oleje silnikowe, przekładniowe, smary i płyny chłodzące John Deere.' },
  { id: 'naped',      name: 'Paski i łożyska',       desc: 'Paski napędowe, łożyska i napinacze – części, które zużywają się najszybciej w sezonie.' },
  { id: 'zniwne',     name: 'Części żniwne i prasy', desc: 'Nożyki, palce listwy tnącej i materiały do pras – przygotuj maszyny przed żniwami.' },
  { id: 'hydraulika', name: 'Hydraulika',            desc: 'Szybkozłącza i zakute węże hydrauliczne. Węże na wymiar wykonamy też na miejscu.' },
  { id: 'elektryka',  name: 'Elektryka i oświetlenie', desc: 'Lampy robocze LED, czujniki i elementy instalacji elektrycznej.' }
];

// Serie maszyn używane w filtrze „Pasuje do maszyny”. '*' w polu fits = uniwersalne.
window.AGW_MODELS = ['5R', '6M', '6R', '7R', '8R', 'S700', 'T670', 'Prasy V4xx'];

window.AGW_PRODUCTS = [
  // ===== FILTRY =====
  {
    id: 'filtr-oleju-re504836',
    sku: 'RE504836',
    name: 'Filtr oleju silnika John Deere RE504836',
    category: 'filtry',
    price: 89.0,
    stock: 46,
    rating: 4.9, reviews: 128, popularity: 100,
    badges: ['bestseller'],
    img: { t: 'filter', c: '#2f7a27' },
    short: 'Oryginalny filtr oleju do silników PowerTech 4.5 l i 6.8 l. Wymiana przy każdym serwisie olejowym.',
    desc: [
      'Filtr oleju RE504836 to jeden z najczęściej wymienianych elementów w ciągnikach serii 6M, 6R i 7R z silnikami PowerTech. Wkład z mieszanki celulozy i włókien syntetycznych zatrzymuje drobne zanieczyszczenia, a zawór zwrotny chroni silnik przed pracą „na sucho” przy rozruchu.',
      'Zalecamy wymianę razem z olejem Plus-50 II – przy wydłużonych interwałach (do 500 mth) używaj wyłącznie oryginalnego filtra.'
    ],
    specs: { 'Typ': 'Wkręcany (spin-on)', 'Wysokość': '178 mm', 'Średnica': '93 mm', 'Gwint': '1-12 UN', 'Zawór zwrotny': 'Tak', 'Interwał wymiany': 'do 500 mth' },
    fits: ['5R', '6M', '6R', '7R'],
    boughtWith: ['olej-plus-50-ii-20l', 'filtr-paliwa-re509036', 'filtr-powietrza-re587793']
  },
  {
    id: 'filtr-paliwa-re509036',
    sku: 'RE509036',
    name: 'Filtr paliwa główny John Deere RE509036',
    category: 'filtry',
    price: 139.0,
    stock: 31,
    rating: 4.8, reviews: 74, popularity: 88,
    badges: [],
    img: { t: 'filter', c: '#f2c200', h: 210 },
    short: 'Filtr dokładny paliwa do układów Common Rail – chroni wtryskiwacze przed wodą i zanieczyszczeniami.',
    desc: [
      'Filtr paliwa RE509036 o skuteczności filtracji 2 mikronów pracuje w układach Common Rail silników PowerTech PSS i PVX. Zabezpiecza pompę wysokiego ciśnienia i wtryskiwacze – jedne z najdroższych elementów silnika.',
      'Przy wymianie odpowietrz układ ręczną pompką i sprawdź separator wody. W sezonie warto mieć jeden filtr w zapasie w warsztacie.'
    ],
    specs: { 'Typ': 'Wkład w obudowie', 'Dokładność filtracji': '2 µm', 'Separator wody': 'Tak', 'Wysokość': '196 mm', 'Interwał wymiany': '500 mth' },
    fits: ['6M', '6R', '7R', '8R'],
    boughtWith: ['filtr-oleju-re504836', 'filtr-hydrauliki-al221066']
  },
  {
    id: 'filtr-powietrza-re587793',
    sku: 'RE587793',
    name: 'Filtr powietrza zewnętrzny John Deere RE587793',
    category: 'filtry',
    price: 389.0,
    oldPrice: 449.0,
    lowest30: 419.0,
    stock: 12,
    rating: 4.9, reviews: 56, popularity: 82,
    badges: ['promocja'],
    img: { t: 'airfilter' },
    short: 'Główny wkład filtra powietrza do ciągników 6R. Wysoka chłonność pyłu w ciężkich warunkach polowych.',
    desc: [
      'Wkład zewnętrzny RE587793 to pierwsza linia ochrony silnika przed pyłem. W okresie żniw i uprawek zapycha się najszybciej – zatkany filtr to wyższe spalanie i spadek mocy.',
      'Nie przedmuchuj wkładu sprężonym powietrzem z bliska – uszkodzone włókno przepuszcza pył prosto do turbiny. Wymieniaj komplet z wkładem wewnętrznym RE587794.'
    ],
    specs: { 'Typ': 'Wkład zewnętrzny (główny)', 'Długość': '422 mm', 'Średnica zewn.': '262 mm', 'Materiał': 'Celuloza z nanowłóknem', 'Uszczelnienie': 'Radialne' },
    fits: ['6R'],
    boughtWith: ['filtr-powietrza-re587794', 'filtr-kabinowy-al176218']
  },
  {
    id: 'filtr-powietrza-re587794',
    sku: 'RE587794',
    name: 'Filtr powietrza wewnętrzny (bezpieczeństwa) RE587794',
    category: 'filtry',
    price: 179.0,
    stock: 18,
    rating: 4.7, reviews: 39, popularity: 64,
    badges: [],
    img: { t: 'airfilter', inner: true },
    short: 'Wkład bezpieczeństwa – chroni silnik podczas wymiany i w razie uszkodzenia wkładu głównego.',
    desc: [
      'Filtr wewnętrzny RE587794 zostaje w obudowie podczas wymiany wkładu głównego, dzięki czemu pył nie dostaje się do kolektora dolotowego.',
      'Wymieniaj co drugą wymianę wkładu zewnętrznego lub zawsze, gdy wkład główny był uszkodzony.'
    ],
    specs: { 'Typ': 'Wkład wewnętrzny', 'Długość': '398 mm', 'Średnica zewn.': '152 mm', 'Materiał': 'Włóknina syntetyczna' },
    fits: ['6R'],
    boughtWith: ['filtr-powietrza-re587793', 'filtr-kabinowy-al176218']
  },
  {
    id: 'filtr-hydrauliki-al221066',
    sku: 'AL221066',
    name: 'Filtr oleju hydraulicznego / przekładni AL221066',
    category: 'filtry',
    price: 249.0,
    stock: 9,
    rating: 4.8, reviews: 27, popularity: 58,
    badges: [],
    img: { t: 'filter', c: '#1d1f1c', h: 230 },
    short: 'Filtr układu hydrauliki i przekładni – wymieniany razem z olejem Hy-Gard.',
    desc: [
      'Filtr AL221066 oczyszcza wspólny olej przekładni i hydrauliki. Czysty olej to płynna praca rewersu, WOM i podnośnika oraz dłuższa żywotność pompy hydraulicznej.',
      'Przy wymianie oleju Hy-Gard zawsze zmieniaj również filtr – stary wkład potrafi zanieczyścić świeży olej w kilka godzin.'
    ],
    specs: { 'Typ': 'Wkręcany (spin-on)', 'Wysokość': '228 mm', 'Średnica': '108 mm', 'Dokładność filtracji': '10 µm', 'Interwał wymiany': '1500 mth' },
    fits: ['6M', '6R', '7R'],
    boughtWith: ['olej-hy-gard-20l', 'filtr-oleju-re504836']
  },
  {
    id: 'filtr-kabinowy-al176218',
    sku: 'AL176218',
    name: 'Filtr kabinowy z węglem aktywnym AL176218',
    category: 'filtry',
    price: 159.0,
    oldPrice: 189.0,
    lowest30: 179.0,
    stock: 22,
    rating: 4.6, reviews: 41, popularity: 61,
    badges: ['promocja'],
    img: { t: 'cabin' },
    short: 'Filtr powietrza kabiny z warstwą węgla aktywnego – zatrzymuje pył, pyłki i opary środków ochrony roślin.',
    desc: [
      'Filtr kabinowy z węglem aktywnym poprawia komfort i bezpieczeństwo operatora – szczególnie przy opryskach i pracach w dużym zapyleniu.',
      'W sezonie oprysków zalecamy wymianę co 300 mth lub raz na sezon, jeśli czujesz zapach środków w kabinie.'
    ],
    specs: { 'Typ': 'Panelowy, węgiel aktywny', 'Wymiary': '298 × 228 × 58 mm', 'Klasa': 'Kategoria 2 (EN 15695)' },
    fits: ['6M', '6R', '7R', '8R'],
    boughtWith: ['filtr-powietrza-re587793', 'filtr-powietrza-re587794']
  },

  // ===== OLEJE I PŁYNY =====
  {
    id: 'olej-plus-50-ii-20l',
    sku: 'VC50002',
    name: 'Olej silnikowy John Deere Plus-50 II 15W-40, 20 l',
    category: 'oleje',
    price: 649.0,
    stock: 28,
    rating: 4.9, reviews: 211, popularity: 97,
    badges: ['bestseller'],
    img: { t: 'jug', c: '#2f7a27', label: 'PLUS-50 II' },
    short: 'Premium olej do silników Diesla – pozwala wydłużyć interwał wymiany do 500 mth z oryginalnym filtrem.',
    desc: [
      'Plus-50 II to olej opracowany do silników John Deere PowerTech, także z układami oczyszczania spalin (DPF, SCR). Utrzymuje lepkość przy wysokich temperaturach pracy i ogranicza tworzenie się osadów.',
      'Z oryginalnym filtrem oleju pozwala na interwał 500 mth – mniej postojów serwisowych w sezonie.'
    ],
    specs: { 'Lepkość': '15W-40', 'Pojemność': '20 l', 'Normy': 'API CK-4, ACEA E9', 'Interwał': 'do 500 mth (z filtrem JD)' },
    fits: ['*'],
    boughtWith: ['filtr-oleju-re504836', 'filtr-paliwa-re509036']
  },
  {
    id: 'olej-hy-gard-20l',
    sku: 'VC70126',
    name: 'Olej przekładniowo-hydrauliczny John Deere Hy-Gard, 20 l',
    category: 'oleje',
    price: 529.0,
    stock: 24,
    rating: 4.8, reviews: 143, popularity: 90,
    badges: [],
    img: { t: 'jug', c: '#f2c200', label: 'HY-GARD' },
    short: 'Olej UTTO do wspólnych układów przekładni, hydrauliki i hamulców mokrych.',
    desc: [
      'Hy-Gard to olej typu UTTO zaprojektowany do ciągników John Deere ze wspólnym zbiornikiem przekładni i hydrauliki. Zapewnia cichą pracę hamulców mokrych i sprzęgieł WOM.',
      'Stosuj razem z oryginalnym filtrem hydrauliki – mieszanie z olejami innych producentów może powodować piszczenie hamulców.'
    ],
    specs: { 'Typ': 'UTTO', 'Pojemność': '20 l', 'Specyfikacja': 'JDM J20C', 'Zastosowanie': 'Przekładnia, hydraulika, hamulce mokre' },
    fits: ['*'],
    boughtWith: ['filtr-hydrauliki-al221066', 'szybkozlacze-iso-12']
  },
  {
    id: 'smar-grease-gard-400g',
    sku: 'TY24416',
    name: 'Smar John Deere Grease-Gard Premium Plus, kartusz 400 g',
    category: 'oleje',
    price: 39.0,
    stock: 160,
    rating: 4.7, reviews: 96, popularity: 79,
    badges: [],
    img: { t: 'cartridge' },
    short: 'Smar litowo-kompleksowy do łożysk, sworzni i przegubów – odporny na wodę i wysokie obciążenia.',
    desc: [
      'Grease-Gard Premium Plus to uniwersalny smar do punktów smarnych ciągników, kombajnów i pras. Dobrze trzyma się na powierzchni i nie jest wypłukiwany przez wodę.',
      'W sezonie żniwnym smaruj punkty na hederze i podajniku codziennie – to najtańsza ochrona łożysk.'
    ],
    specs: { 'Baza': 'Litowo-kompleksowa', 'Klasa NLGI': '2', 'Pojemność': '400 g', 'Temp. pracy': '-30…+160 °C' },
    fits: ['*'],
    boughtWith: ['lozysko-ah128208', 'nozyki-listwy-h213174']
  },
  {
    id: 'plyn-cool-gard-ii-5l',
    sku: 'TY26575',
    name: 'Płyn chłodzący John Deere Cool-Gard II, 5 l (gotowy)',
    category: 'oleje',
    price: 119.0,
    stock: 40,
    rating: 4.8, reviews: 52, popularity: 55,
    badges: [],
    img: { t: 'jug', c: '#e9e4d6', cap: '#f2c200', label: 'COOL-GARD II', small: true },
    short: 'Gotowy płyn chłodzący o wydłużonej żywotności (do 6 lat / 6000 mth).',
    desc: [
      'Cool-Gard II chroni układ chłodzenia przed korozją, kawitacją tulei cylindrowych i zamarzaniem. Gotowy do użycia – nie wymaga mieszania z wodą.',
      'Przed zimą sprawdź temperaturę krzepnięcia i stan paska wentylatora.'
    ],
    specs: { 'Typ': 'OAT, gotowy do użycia', 'Pojemność': '5 l', 'Ochrona': 'do -37 °C', 'Żywotność': '6 lat / 6000 mth' },
    fits: ['*'],
    boughtWith: ['pasek-wielorowkowy-r520378', 'filtr-oleju-re504836']
  },

  // ===== PASKI I ŁOŻYSKA =====
  {
    id: 'pasek-wielorowkowy-r520378',
    sku: 'R520378',
    name: 'Pasek wielorowkowy napędu wentylatora R520378',
    category: 'naped',
    price: 219.0,
    stock: 14,
    rating: 4.7, reviews: 33, popularity: 66,
    badges: [],
    img: { t: 'belt' },
    short: 'Pasek napędu wentylatora, alternatora i sprężarki klimatyzacji w silnikach PowerTech 6.8 l.',
    desc: [
      'Pęknięty pasek wielorowkowy to natychmiastowe przegrzanie silnika i brak ładowania. Sprawdzaj go przy każdym serwisie – pęknięcia na żebrach oznaczają konieczność wymiany.',
      'Przy wymianie skontroluj łożysko rolki napinacza – zużyte powoduje piski i przyspiesza zużycie nowego paska.'
    ],
    specs: { 'Typ': 'Wielorowkowy (PK)', 'Liczba żeber': '8', 'Długość': '2010 mm', 'Materiał': 'EPDM' },
    fits: ['6R', '7R'],
    boughtWith: ['napinacz-paska-re545004', 'lozysko-ah128208']
  },
  {
    id: 'lozysko-ah128208',
    sku: 'AH128208',
    name: 'Łożysko kulkowe z obudową AH128208 (kombajn)',
    category: 'naped',
    price: 145.0,
    stock: 7,
    rating: 4.6, reviews: 18, popularity: 49,
    badges: [],
    img: { t: 'bearing' },
    short: 'Łożysko z pierścieniem mimośrodowym do wałów napędowych kombajnów S700 i T670.',
    desc: [
      'Łożysko AH128208 pracuje w wielu miejscach kombajnu – napęd przenośników, wytrząsaczy i podajnika. Uszczelnienia potrójne chronią przed pyłem i plewami.',
      'Przed żniwami przejdź kombajn „na słuch” – szumiące łożysko lepiej wymienić w warsztacie niż na polu.'
    ],
    specs: { 'Średnica wału': '40 mm', 'Typ': 'Kulkowe, samonastawne', 'Uszczelnienie': 'Potrójne', 'Smarowanie': 'Fabryczne + smarowniczka' },
    fits: ['S700', 'T670'],
    boughtWith: ['smar-grease-gard-400g', 'pasek-wielorowkowy-r520378']
  },
  {
    id: 'napinacz-paska-re545004',
    sku: 'RE545004',
    name: 'Napinacz automatyczny paska napędu RE545004',
    category: 'naped',
    price: 489.0,
    oldPrice: 559.0,
    lowest30: 529.0,
    stock: 3,
    rating: 4.8, reviews: 15, popularity: 42,
    badges: ['promocja'],
    img: { t: 'tensioner' },
    short: 'Kompletny napinacz z rolką i sprężyną – utrzymuje właściwe napięcie paska wielorowkowego.',
    desc: [
      'Napinacz automatyczny eliminuje konieczność ręcznej regulacji napięcia paska. Osłabiona sprężyna lub zużyte łożysko rolki objawia się piskiem przy rozruchu i drganiami paska.',
      'Wymieniaj razem z paskiem R520378 – oszczędzasz czas demontażu osłon.'
    ],
    specs: { 'Typ': 'Automatyczny, sprężynowy', 'Średnica rolki': '76 mm', 'W zestawie': 'Rolka, ramię, śruba' },
    fits: ['6R', '7R'],
    boughtWith: ['pasek-wielorowkowy-r520378', 'lozysko-ah128208']
  },

  // ===== CZĘŚCI ŻNIWNE I PRASY =====
  {
    id: 'nozyki-listwy-h213174',
    sku: 'H213174',
    name: 'Nożyki listwy tnącej hederu, ząbkowane – komplet 25 szt.',
    category: 'zniwne',
    price: 299.0,
    stock: 35,
    rating: 4.7, reviews: 48, popularity: 72,
    badges: ['nowość'],
    img: { t: 'knife' },
    short: 'Ząbkowane nożyki do hederów zbożowych serii 600F i 700F. Komplet z nitami.',
    desc: [
      'Ostre nożyki to równe ścięcie, mniejsze straty i mniejsze obciążenie napędu listwy. Ząbkowane krawędzie dłużej zachowują skuteczność przy cięciu suchych i zachwaszczonych łanów.',
      'W komplecie 25 nożyków i nity. Przy wymianie sprawdź też stan palców i docisków.'
    ],
    specs: { 'Typ': 'Ząbkowane, 3"', 'Ilość': '25 szt. + nity', 'Materiał': 'Stal hartowana', 'Pasuje do': 'Hedery 600F, 700F' },
    fits: ['S700', 'T670'],
    boughtWith: ['palce-listwy-h153212', 'smar-grease-gard-400g']
  },
  {
    id: 'palce-listwy-h153212',
    sku: 'H153212',
    name: 'Palec listwy nożowej podwójny H153212 – 4 szt.',
    category: 'zniwne',
    price: 96.0,
    stock: 52,
    rating: 4.5, reviews: 21, popularity: 47,
    badges: [],
    img: { t: 'guard' },
    short: 'Kute palce listwy tnącej – stabilne prowadzenie nożyków i równe cięcie.',
    desc: [
      'Wygięte lub wyszczerbione palce powodują wyrywanie zamiast cięcia i przyspieszają zużycie nożyków. Kuta stal dobrze znosi uderzenia o kamienie.',
      'Opakowanie zawiera 4 palce podwójne.'
    ],
    specs: { 'Typ': 'Podwójny, kuty', 'Ilość': '4 szt.', 'Wykończenie': 'Hartowany indukcyjnie' },
    fits: ['S700', 'T670'],
    boughtWith: ['nozyki-listwy-h213174', 'smar-grease-gard-400g']
  },
  {
    id: 'siatka-coveredge-123',
    sku: 'AW23578',
    name: 'Siatka do owijania bel John Deere CoverEdge 1,23 × 3600 m',
    category: 'zniwne',
    price: 899.0,
    stock: 16,
    rating: 4.9, reviews: 67, popularity: 76,
    badges: ['nowość'],
    img: { t: 'netroll' },
    short: 'Siatka sięgająca krawędzi beli – lepszy kształt beli i mniejsze straty przy przechowywaniu.',
    desc: [
      'CoverEdge wychodzi poza krawędzie beli, dzięki czemu bele lepiej trzymają kształt i łatwiej je owinąć folią. Rolka 3600 m wystarcza na ok. 1300 bel.',
      'Przechowuj w suchym miejscu, w oryginalnym opakowaniu – UV skraca żywotność siatki.'
    ],
    specs: { 'Szerokość': '1,23 m', 'Długość': '3600 m', 'Wydajność': 'ok. 1300 bel', 'Stabilizacja UV': 'Tak' },
    fits: ['Prasy V4xx'],
    boughtWith: ['smar-grease-gard-400g', 'lampa-led-2400']
  },

  // ===== HYDRAULIKA =====
  {
    id: 'szybkozlacze-iso-12',
    sku: 'AGW-SZ-12M',
    name: 'Szybkozłącze hydrauliczne ISO-A 1/2" – wtyczka (męska)',
    category: 'hydraulika',
    price: 64.0,
    stock: 120,
    rating: 4.6, reviews: 88, popularity: 70,
    badges: [],
    img: { t: 'coupler' },
    short: 'Standardowe szybkozłącze ISO 7241-A do maszyn rolniczych. Gwint M22×1,5, z kapturkiem przeciwpyłowym.',
    desc: [
      'Szybkozłącze typu „push-pull” pasujące do gniazd w ciągnikach John Deere i większości maszyn towarzyszących. Wymiana ciekącej wtyczki to kilka minut, a oszczędzasz litry oleju.',
      'Potrzebujesz innego gwintu lub kolanka? Zadzwoń – dobierzemy na miejscu.'
    ],
    specs: { 'Standard': 'ISO 7241-A', 'Rozmiar': '1/2"', 'Gwint': 'M22×1,5', 'Ciśnienie robocze': '250 bar', 'W zestawie': 'Kapturek przeciwpyłowy' },
    fits: ['*'],
    boughtWith: ['waz-hydrauliczny-12-15m', 'olej-hy-gard-20l']
  },
  {
    id: 'waz-hydrauliczny-12-15m',
    sku: 'AGW-WH-12-150',
    name: 'Wąż hydrauliczny zakuty 1/2" 2SN, 1,5 m (M22×1,5)',
    category: 'hydraulika',
    price: 119.0,
    stock: 30,
    rating: 4.9, reviews: 102, popularity: 84,
    badges: ['bestseller'],
    img: { t: 'hose' },
    short: 'Gotowy przewód z dwoma oplotami stalowymi, zakuty w naszym warsztacie. Inne długości – na zamówienie.',
    desc: [
      'Wąż 2SN zakuwany w warsztacie AgroWil z końcówkami M22×1,5 (DKOL). Każdy przewód sprawdzamy przed wysyłką.',
      'Potrzebujesz innej długości, kolanka albo gwintu calowego? Przywieź stary wąż lub zadzwoń – wykonamy „od ręki”.'
    ],
    specs: { 'Typ': '2SN (dwa oploty stalowe)', 'Średnica': 'DN12 – 1/2"', 'Długość': '1500 mm', 'Końcówki': 'M22×1,5 DKOL', 'Ciśnienie robocze': '275 bar' },
    fits: ['*'],
    boughtWith: ['szybkozlacze-iso-12', 'olej-hy-gard-20l']
  },

  // ===== ELEKTRYKA =====
  {
    id: 'lampa-led-2400',
    sku: 'AGW-LED-24',
    name: 'Lampa robocza LED 40 W, 2400 lm, 12/24 V',
    category: 'elektryka',
    price: 159.0,
    oldPrice: 199.0,
    lowest30: 189.0,
    stock: 44,
    rating: 4.7, reviews: 131, popularity: 86,
    badges: ['promocja'],
    img: { t: 'lamp' },
    short: 'Szerokie, równe światło do pracy nocnej. Aluminiowa obudowa IP68, uchwyt ze stali nierdzewnej.',
    desc: [
      'Lampa LED zastępuje halogeny w kabinie i na błotnikach – daje więcej światła przy kilkukrotnie mniejszym poborze prądu. Rozsył szeroki (flood), idealny przy uprawkach i żniwach nocą.',
      'Pasuje do instalacji 12 V i 24 V. W zestawie uchwyt i przewód z wtyczką Deutsch.'
    ],
    specs: { 'Moc': '40 W', 'Strumień świetlny': '2400 lm', 'Napięcie': '12/24 V', 'Szczelność': 'IP68', 'Barwa': '6000 K' },
    fits: ['*'],
    boughtWith: ['czujnik-cisnienia-re537665']
  },
  {
    id: 'czujnik-cisnienia-re537665',
    sku: 'RE537665',
    name: 'Czujnik ciśnienia oleju silnika John Deere RE537665',
    category: 'elektryka',
    price: 349.0,
    stock: 0,
    rating: 4.5, reviews: 9, popularity: 30,
    badges: [],
    img: { t: 'sensor' },
    short: 'Elektroniczny czujnik ciśnienia oleju – fałszywe alarmy niskiego ciśnienia często mają źródło właśnie tu.',
    desc: [
      'Czujnik RE537665 przekazuje do sterownika silnika informację o ciśnieniu oleju. Uszkodzony potrafi wyłączyć silnik w trybie ochronnym albo pokazywać błędne wartości.',
      'Przed zamówieniem odczytaj kod błędu z panelu – pomożemy go zinterpretować przez telefon.'
    ],
    specs: { 'Typ': 'Przetwornik ciśnienia', 'Zakres': '0–10 bar', 'Złącze': '3-pin', 'Gwint': 'M12×1,5' },
    fits: ['6M', '6R', '7R'],
    boughtWith: ['filtr-oleju-re504836', 'olej-plus-50-ii-20l']
  }
];
