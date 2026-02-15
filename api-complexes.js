// Загрузка комплексов из API (если сервер поддерживает)
(function() {
  function renderComplex(c, linkBase) {
    const img = (c.images && c.images[0]) || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80';
    const href = linkBase ? `complex.html?slug=${encodeURIComponent(c.slug)}` : `complex.html?slug=${encodeURIComponent(c.slug)}`;
    return `
      <article class="complex-card" data-animate>
        <a href="${href}" class="complex-card-link">
          <div class="complex-image">
            <img src="${img}" alt="${escapeAttr(c.name)}">
            <div class="complex-overlay">
              <span class="complex-status">${escapeHtml(c.status)}</span>
            </div>
          </div>
          <div class="complex-info">
            <h3>${escapeHtml(c.name)}</h3>
            <p class="complex-location">${escapeHtml(c.location)}</p>
            <p class="complex-desc">${escapeHtml(c.description)}</p>
            <div class="complex-meta">
              <span>от ${escapeHtml(c.price_from)}</span>
              <span>${escapeHtml(c.rooms)}</span>
            </div>
            <span class="complex-link">Подробнее →</span>
          </div>
        </a>
      </article>
    `;
  }
  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  async function loadComplexes(container, limit) {
    try {
      const res = await fetch('/api/complexes');
      if (!res.ok) return;
      const list = await res.json();
      const items = limit ? list.slice(0, limit) : list;
      container.innerHTML = items.map(c => renderComplex(c)).join('');

      // Перезапуск анимаций
      const cards = container.querySelectorAll('.complex-card');
      cards.forEach((el, i) => {
        el.dataset.delay = i * 150;
        el.classList.remove('animate-in');
      });
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || 0;
            setTimeout(() => el.classList.add('animate-in'), delay);
          }
        });
      }, { threshold: 0.1 });
      cards.forEach(c => observer.observe(c));
    } catch (_) {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('complexes-api');
    const featured = document.getElementById('complexes-featured');
    if (grid) loadComplexes(grid);
    if (featured) loadComplexes(featured, 3);
  });
})();
