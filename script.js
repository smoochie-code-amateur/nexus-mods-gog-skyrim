const WORKER_URL = 'https://nexus-api.nitanaredleaf.workers.dev';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  errorDiv.classList.add('hidden');
  resultsDiv.innerHTML = '<div class="spinner"></div>';
  searchBtn.disabled = true;

  try {
    const res = await fetch(`${WORKER_URL}/check?name=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Помилка сервера');
      return;
    }

    renderResults(data);
  } catch (err) {
    showError('Не вдалося з\'єднатися з сервером. Перевір URL Worker-а.');
  } finally {
    searchBtn.disabled = false;
  }
}

function renderResults(data) {
  if (data.results && data.results.length > 0) {
    resultsDiv.innerHTML = data.results.map(renderCard).join('');
  } else {
    resultsDiv.innerHTML = `
      <div class="empty-state">
        <h2>${data.message || 'Нічого не знайдено'}</h2>
        <p>Спробуйте іншу назву</p>
      </div>`;
  }
}

function renderCard(mod) {
  const labels = {
    yes: 'Сумісний',
    maybe: 'Можливо сумісний',
    no: 'Несумісний',
    unknown: 'Невідомо',
  };

  return `
    <div class="mod-card">
      <div class="badge" style="background:${mod.color}">
        ${labels[mod.status]?.[0] || '?'}
      </div>
      <div class="mod-info">
        <div class="mod-name">
          <a href="${mod.url}" target="_blank">${escapeHtml(mod.name)}</a>
        </div>
        <div class="mod-meta">
          ${escapeHtml(mod.author)} · ID ${mod.id}
        </div>
        <div class="mod-summary">${escapeHtml(mod.summary || '')}</div>
        <div class="compat-reason ${mod.status}">${escapeHtml(mod.reason)}</div>
      </div>
    </div>`;
}

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.remove('hidden');
  resultsDiv.innerHTML = '';
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
