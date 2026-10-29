(() => {
  'use strict';
  const search = document.getElementById('dashboardSearch');
  const cards = Array.from(document.querySelectorAll('.portal-grid .dash-card'));
  const count = document.getElementById('countDisplay');
  const empty = document.getElementById('portalEmpty');
  if (!search || !cards.length) return;
  function update() {
    const value = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const haystack = `${card.dataset.title} ${card.dataset.desc}`.toLocaleLowerCase();
      const match = haystack.includes(value);
      card.hidden = !match;
      if (match) visible++;
    });
    count.textContent = `(${visible}${value ? ' of ' + cards.length : ''})`;
    empty.hidden = visible !== 0;
  }
  search.addEventListener('input', update);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault(); search.focus();
    }
    if (e.key === 'Escape' && document.activeElement === search) {search.value='';update();search.blur();}
  });
  update();
})();
