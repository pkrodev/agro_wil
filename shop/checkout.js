// shop/checkout.js – dostawa, płatność i potwierdzenie zamówienia
// UWAGA: wersja bez backendu – zamówienie zapisuje się w przeglądarce. Przed uruchomieniem sprzedaży
// podłącz wysyłkę zamówienia (e-mail / API sklepu) i bramkę płatności w funkcji submitOrder().

document.addEventListener('DOMContentLoaded', () => window.AGW.ready.then(() => {
  const A = window.AGW;
  const { fmt, esc, byId, icon } = A;
  const root = document.getElementById('checkout');

  const SHIPPING = [
    { id: 'kurier', name: 'Kurier DPD', price: 19.99, info: 'Dostawa 1–2 dni robocze', free: true },
    { id: 'paczkomat', name: 'Paczkomat InPost', price: 14.99, info: 'Paczki do 25 kg', free: true },
    { id: 'odbior', name: 'Odbiór osobisty', price: 0, info: 'Popowo Północ, gm. Nasielsk – zadzwoń przed przyjazdem', free: true }
  ];
  const PAYMENT = [
    { id: 'blik', name: 'BLIK', fee: 0, info: 'Szybka płatność kodem z aplikacji banku' },
    { id: 'przelew', name: 'Przelew tradycyjny', fee: 0, info: 'Wysyłka po zaksięgowaniu wpłaty' },
    { id: 'pobranie', name: 'Płatność przy odbiorze', fee: 7, info: 'Dopłata 7 zł (kurier lub odbiór osobisty)' }
  ];

  const steps = (n) => `<ol class="steps">
      ${['Koszyk', 'Dostawa i płatność', 'Potwierdzenie'].map((s, i) => `<li class="${i + 1 === n ? 'is-active' : ''}${i + 1 < n ? ' is-done' : ''}"><span>${i < n - 1 ? icon.check : i + 1}</span>${s}</li>`).join('')}
    </ol>`;

  const items = A.cart.items();

  // Sklep połączony z Shopify – dostawa, płatność i potwierdzenie odbywają się w kasie Shopify
  if (window.AGW_SHOP?.enabled && items.length) {
    root.innerHTML = `${steps(2)}<div class="empty"><h1>Przekierowujemy do bezpiecznej kasy…</h1>
      <p data-msg>Za chwilę wybierzesz dostawę i płatność.</p></div>`;
    let note = '';
    try { note = localStorage.getItem('agw_cart_note') || ''; } catch (e) { /* brak zapisu */ }
    window.AGW_SHOP.checkout(items, note)
      .then((url) => { location.href = url; })
      .catch((e) => {
        root.querySelector('[data-msg]').innerHTML = `Nie udało się połączyć z kasą (${esc(e.message)}).
          <a href="koszyk.html">Wróć do koszyka</a> albo zamów telefonicznie: <a href="tel:+48666605101">666 605 101</a>.`;
      });
    return;
  }

  if (!items.length) {
    root.innerHTML = `${steps(2)}<div class="empty"><h1>Koszyk jest pusty</h1>
      <p>Dodaj produkty, aby złożyć zamówienie.</p><a class="btn btn--primary" href="sklep.html">Przejdź do sklepu</a></div>`;
    return;
  }

  const subtotal = A.cart.total();
  const shipCost = (s) => (s.free && subtotal >= A.FREE_SHIPPING_FROM ? 0 : s.price);

  root.innerHTML = `${steps(2)}
    <h1 class="page-title">Dostawa i płatność</h1>
    <p class="demo-note">Wersja demonstracyjna sklepu – zamówienie zapisze się tylko w tej przeglądarce i nie zostanie wysłane.</p>
    <form class="checkout" novalidate>
      <div class="checkout__main">
        <fieldset class="box">
          <legend>1. Sposób dostawy</legend>
          ${SHIPPING.map((s, i) => `<label class="option">
            <input type="radio" name="shipping" value="${s.id}" ${i === 0 ? 'checked' : ''}/>
            <span class="option__txt"><b>${s.name}</b><small>${s.info}</small></span>
            <b class="option__price">${shipCost(s) ? fmt(shipCost(s)) : 'Gratis'}</b>
          </label>`).join('')}
        </fieldset>

        <fieldset class="box">
          <legend>2. Płatność</legend>
          ${PAYMENT.map((pm, i) => `<label class="option">
            <input type="radio" name="payment" value="${pm.id}" ${i === 0 ? 'checked' : ''}/>
            <span class="option__txt"><b>${pm.name}</b><small>${pm.info}</small></span>
            <b class="option__price">${pm.fee ? '+' + fmt(pm.fee) : ''}</b>
          </label>`).join('')}
        </fieldset>

        <fieldset class="box">
          <legend>3. Dane do wysyłki</legend>
          <div class="fields">
            <label>Imię i nazwisko*<input name="name" required autocomplete="name"/></label>
            <label>Telefon*<input name="phone" type="tel" required autocomplete="tel" pattern="[0-9 +\\-]{9,}"/></label>
            <label class="span-2">E-mail*<input name="email" type="email" required autocomplete="email"/></label>
            <label class="span-2" data-addr>Ulica i numer*<input name="street" required autocomplete="street-address"/></label>
            <label data-addr>Kod pocztowy*<input name="zip" required pattern="[0-9]{2}-[0-9]{3}" placeholder="00-000" autocomplete="postal-code"/></label>
            <label data-addr>Miejscowość*<input name="city" required autocomplete="address-level2"/></label>
            <label class="span-2 check"><input type="checkbox" name="invoice" data-invoice/> Chcę fakturę VAT na firmę / gospodarstwo</label>
            <label data-inv hidden>Nazwa firmy<input name="company"/></label>
            <label data-inv hidden>NIP<input name="nip" pattern="[0-9]{10}" placeholder="10 cyfr"/></label>
            <label class="span-2">Uwagi (np. numer VIN lub model maszyny – sprawdzimy dopasowanie)
              <textarea name="notes" rows="3"></textarea></label>
          </div>
        </fieldset>
      </div>

      <aside class="summary">
        <h2>Twoje zamówienie</h2>
        <ul class="summary__items">
          ${items.map(({ id, qty }) => {
            const p = byId(id);
            return `<li><span class="summary__img">${window.AGW_IMG(p)}</span><span>${esc(p.name)}<small>${qty} × ${fmt(p.price)}</small></span><b>${fmt(p.price * qty)}</b></li>`;
          }).join('')}
        </ul>
        <dl>
          <dt>Produkty</dt><dd>${fmt(subtotal)}</dd>
          <dt>Dostawa</dt><dd data-ship></dd>
          <dt data-fee-row>Opłata za pobranie</dt><dd data-fee-row data-fee></dd>
        </dl>
        <div class="summary__total"><span>Do zapłaty</span><b data-total></b></div>
        <label class="check check--terms"><input type="checkbox" name="terms" required/> Akceptuję regulamin sklepu i politykę prywatności*</label>
        <p class="form-error" data-error hidden></p>
        <button type="submit" class="btn btn--primary btn--block">Zamawiam i płacę</button>
        <a class="link-btn" href="koszyk.html">← Wróć do koszyka</a>
      </aside>
    </form>`;

  const form = root.querySelector('form');

  const current = () => {
    const ship = SHIPPING.find((s) => s.id === form.shipping.value);
    const pay = PAYMENT.find((x) => x.id === form.payment.value);
    return { ship, pay, total: subtotal + shipCost(ship) + pay.fee };
  };

  const update = () => {
    const { ship, pay, total } = current();
    root.querySelector('[data-ship]').textContent = shipCost(ship) ? fmt(shipCost(ship)) : 'Gratis';
    root.querySelectorAll('[data-fee-row]').forEach((el) => { el.hidden = !pay.fee; });
    root.querySelector('[data-fee]').textContent = fmt(pay.fee);
    root.querySelector('[data-total]').textContent = fmt(total);

    // odbiór osobisty – adres niepotrzebny; paczkomat – bez pobrania
    const pickup = ship.id === 'odbior';
    root.querySelectorAll('[data-addr]').forEach((el) => {
      el.hidden = pickup;
      el.querySelector('input').required = !pickup;
    });
    const cod = form.querySelector('input[value="pobranie"]');
    cod.disabled = ship.id === 'paczkomat';
    if (cod.disabled && cod.checked) {
      form.querySelector('input[value="blik"]').checked = true;
      update();
    }

    const inv = form.invoice.checked;
    root.querySelectorAll('[data-inv]').forEach((el) => {
      el.hidden = !inv;
      el.querySelector('input').required = inv;
    });
  };

  form.addEventListener('change', update);
  update();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = root.querySelector('[data-error]');
    const invalid = [...form.querySelectorAll('input, textarea')].filter((el) => !el.closest('[hidden]') && !el.checkValidity());
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    if (invalid.length) {
      invalid.forEach((el) => (el.type === 'checkbox' ? el.parentElement : el).classList.add('is-invalid'));
      err.textContent = invalid.some((el) => el.name === 'terms') && invalid.length === 1
        ? 'Zaakceptuj regulamin, aby złożyć zamówienie.'
        : 'Uzupełnij poprawnie zaznaczone pola.';
      err.hidden = false;
      invalid[0].focus();
      return;
    }
    err.hidden = true;
    submitOrder();
  });

  const submitOrder = () => {
    const { ship, pay, total } = current();
    const data = Object.fromEntries(new FormData(form));
    const number = `AGW/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`;
    const order = {
      number,
      date: new Date().toISOString(),
      items: items.map(({ id, qty }) => ({ id, qty, price: byId(id).price })),
      shipping: ship.id,
      payment: pay.id,
      total,
      customer: { name: data.name, email: data.email, phone: data.phone }
    };
    A.orders.add(order);
    A.cart.clear();
    window.scrollTo({ top: 0 });

    root.innerHTML = `${steps(3)}
      <div class="done">
        <span class="done__icon">${icon.check}</span>
        <h1>Dziękujemy za zamówienie!</h1>
        <p>Numer zamówienia: <b>${esc(number)}</b></p>
        <p>Potwierdzenie wyślemy na <b>${esc(data.email)}</b>. Jeśli w uwagach podałeś numer VIN, sprawdzimy dopasowanie części i zadzwonimy w razie wątpliwości.</p>
        ${pay.id === 'przelew' ? `<div class="box transfer">
          <h2>Dane do przelewu</h2>
          <p>Odbiorca: AgroWil, Popowo Północ<br/>Nr konta: <i>(uzupełnij numer konta)</i><br/>Tytuł: ${esc(number)}<br/>Kwota: <b>${fmt(total)}</b></p>
        </div>` : ''}
        ${ship.id === 'odbior' ? '<p>Odbiór osobisty: zadzwoń przed przyjazdem – <a href="tel:+48666605101">666 605 101</a>.</p>' : ''}
        <a class="btn btn--primary" href="sklep.html">Wróć do sklepu</a>
      </div>
      ${A.carousel('Może przydać się też', order.items
        .flatMap((i) => A.boughtTogether(i.id, 3))
        .filter((p, i, arr) => arr.indexOf(p) === i && !order.items.some((x) => x.id === p.id)))}`;
  };
}));
