// scripts.js – nawigacja + boczne menu

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelector('.nav-links');
  const burger = document.querySelector('.nav-burger');
  const sideNav = document.querySelector('.side-nav');
  const heroHeader = document.querySelector('.hero-header');

  // Burger menu (górne)
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-open');
      navLinks.classList.toggle('is-open');
    });

    navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('is-open');
        navLinks.classList.remove('is-open');
      });
    });
  }

  // Pokazywanie / chowanie bocznego menu po zjechaniu z headera
  const handleScroll = () => {
    if (sideNav && heroHeader) {
      const threshold = heroHeader.offsetHeight - 80;
      if (window.scrollY > threshold) {
        sideNav.classList.add('side-nav--visible');
      } else {
        sideNav.classList.remove('side-nav--visible');
        sideNav.classList.remove('side-nav--open');
        const toggle = sideNav.querySelector('.side-nav__toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Pokaż menu sekcji');
        }
      }
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll);

  // Wysuwane menu boczne (prostokątne) – toggle dla touch + klawiatury
  const initSideNavDrawer = () => {
    if (!sideNav) return;

    // Nie duplikuj
    if (sideNav.querySelector('.side-nav__toggle')) return;

    const links = Array.from(sideNav.querySelectorAll('a'));
    if (!links.length) return;

    // Wrapper na linki (łatwiejsza animacja)
    const items = document.createElement('div');
    items.className = 'side-nav__items';

    links.forEach(a => items.appendChild(a));

    // Uchwyt / przycisk
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'side-nav__toggle';
    toggle.setAttribute('aria-label', 'Pokaż menu sekcji');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '☰';

    sideNav.appendChild(items);
    sideNav.insertBefore(toggle, sideNav.firstChild);

    const close = () => {
      sideNav.classList.remove('side-nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Pokaż menu sekcji');
    };

    const open = () => {
      sideNav.classList.add('side-nav--open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Ukryj menu sekcji');
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sideNav.classList.contains('side-nav--open')) close();
      else open();
    });

    // Klik na link zamyka menu (na touch)
    items.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) close();
    });

    // Klik poza – zamknij
    document.addEventListener('click', (e) => {
      if (!sideNav.classList.contains('side-nav--open')) return;
      if (!sideNav.contains(e.target)) close();
    });

    // ESC – zamknij
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  };

  initSideNavDrawer();


  // Rok w stopce
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }


  // FJD scroll reveal (pinned) – karty „wychodzą” spod poprzednich
  const initFjdScrollReveal = () => {
    const scrollers = Array.from(document.querySelectorAll('[data-fjd-scroll]'));
    if (!scrollers.length) return;

    const mqWide = window.matchMedia('(min-width: 992px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const bindMq = (mq, fn) => {
      // Safari fallback
      if (mq.addEventListener) mq.addEventListener('change', fn);
      else if (mq.addListener) mq.addListener(fn);
    };

    scrollers.forEach((scroller) => {
      const cards = Array.from(scroller.querySelectorAll('.fjd-item'));
      if (!cards.length) return;

      const setStaticMode = () => {
        scroller.style.height = '';
        cards.forEach((card) => {
          card.classList.remove('is-active', 'is-leaving');
          card.style.opacity = '';
          card.style.transform = '';
          card.style.zIndex = '';
          card.style.pointerEvents = '';
        });
        // reset, żeby po powrocie do trybu pinned nie zostać „na starym indeksie”
        activeIdx = -1;
      };

      const setPinnedHeight = () => {
        scroller.style.height = `${cards.length * window.innerHeight}px`;
      };

      // Snap transitions: użytkownik nie zatrzyma się „pomiędzy” kafelkami.
      // Nowy kafelek wskakuje od razu, a poprzedni tylko wygasa.
      const FADE_MS = 420;
      let activeIdx = -1;
      let leaveTimer = null;

      const showInstant = (card) => {
        // pokaż bez animacji (żeby animowała się tylko karta, która znika)
        card.style.transition = 'none';
        card.style.opacity = '1';
        card.classList.add('is-active');
        // wymuś reflow, żeby transition:none zadziałało
        void card.offsetHeight;
        card.style.transition = '';
      };

      const applyIndex = (nextIdx) => {
        if (nextIdx === activeIdx) return;

        const prevIdx = activeIdx;
        const prev = prevIdx >= 0 ? cards[prevIdx] : null;
        const next = cards[nextIdx];

        if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimer = null;
        }

        // Ukryj wszystkie pozostałe natychmiast (bez efektu „pomiędzy”)
        cards.forEach((c, i) => {
          if (i !== prevIdx && i !== nextIdx) {
            c.classList.remove('is-active', 'is-leaving');
            c.style.opacity = '0';
            c.style.zIndex = '0';
            c.style.pointerEvents = 'none';
            c.style.transform = 'translateY(0)';
          }
        });

        // Przygotuj nową kartę „pod spodem” i pokaż ją od razu
        next.classList.remove('is-leaving');
        next.style.zIndex = prev ? '1' : '2';
        next.style.transform = 'translateY(0)';
        next.style.pointerEvents = 'auto';
        showInstant(next);

        // Poprzednia karta: tylko zanika
        if (prev) {
          prev.classList.remove('is-active');
          prev.classList.add('is-leaving');
          prev.style.zIndex = '2';
          prev.style.opacity = '0';
          prev.style.transform = 'translateY(0)';
          prev.style.pointerEvents = 'none';

          leaveTimer = window.setTimeout(() => {
            prev.classList.remove('is-leaving');
            prev.style.zIndex = '0';
          }, FADE_MS + 60);
        }

        activeIdx = nextIdx;
      };

      const update = () => {
        if (!mqWide.matches || mqReduce.matches) {
          setStaticMode();
          return;
        }

        const vh = window.innerHeight;
        const rect = scroller.getBoundingClientRect();
        const maxLocal = Math.max(0, scroller.offsetHeight - vh);
        const local = Math.min(Math.max(-rect.top, 0), maxLocal);

        // Każdy kafelek = 1 wysokość okna. +0.55 daje „snap” z lekką histerezą.
        const step = local / vh;
        const idx = Math.min(cards.length - 1, Math.max(0, Math.floor(step + 0.55)));
        applyIndex(idx);
      };

      const recalc = () => {
        if (!mqWide.matches || mqReduce.matches) {
          setStaticMode();
          return;
        }
        setPinnedHeight();
        update();
      };

      // inicjalizacja
      recalc();

      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', recalc);
      bindMq(mqWide, recalc);
      bindMq(mqReduce, recalc);
    });
  };

  initFjdScrollReveal();

});