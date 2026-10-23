// shop/fjd.js – podstrona FJDynamics: podświetlanie aktywnej pozycji w menu sekcji

document.addEventListener('DOMContentLoaded', () => {
  const links = [...document.querySelectorAll('.fjd-subnav a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const setActive = (id) => {
    links.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-active', on);
      if (on) a.parentElement.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
    });
  };

  // sekcja jest „aktywna”, gdy jej górna część mija pasek menu
  const observer = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e) => setActive(e.target.id));
  }, { rootMargin: '-35% 0px -60% 0px' });
  sections.forEach((s) => observer.observe(s));
});
