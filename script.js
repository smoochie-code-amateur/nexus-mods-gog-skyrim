const WORKER_URL = 'https://gog-skyrim-checker.YOUR_SUBDOMAIN.workers.dev';
const KEY_STORAGE = 'nexus_api_key';

const keyView = document.getElementById('keyView');
const appView = document.getElementById('appView');
const keyInput = document.getElementById('keyInput');
const keyBtn = document.getElementById('keyBtn');
const keyError = document.getElementById('keyError');
const changeKeyBtn = document.getElementById('changeKeyBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');

init();

function init() {
  const savedKey = localStorage.getItem(KEY_STORAGE);
  if (savedKey) {
    showApp();
  }
  keyBtn.addEventListener('click', saveKey);
  keyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveKey();
  });
  changeKeyBtn.addEventListener('click', showKeyForm);
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

function saveKey() {
  const key = keyInput.value.trim();
  if (!key) {
    keyError.textContent = 'Введіть API-ключ';
    keyError.classList.remove('hidden');
    return;
  }
  if (key.length < 10) {
    keyError.textContent = 'Схоже, це не схоже на API-ключ';
    keyError.classList.remove('hidden');
    return;
  }
  localStorage.setItem(KEY_STORAGE, key);
  keyError.classList.add('hidden');
  showApp();
}

function showKeyForm() {
  appView.classList.add('hidden');
  keyView.classList.remove('hidden');
  keyInput.value = localStorage.getItem(KEY_STORAGE) || '';
  keyError.classList.add('hidden');
}

function showApp() {
  keyView.classList.add('hidden');
  appView.classList.remove('hidden');
  resultsDiv.innerHTML = '';
  errorDiv.classList.add('hidden');
  searchInput.focus();
}

function getKey() {
  return localStorage.getItem(KEY_STORAGE);
}

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  errorDiv.classList.add('hidden');
  resultsDiv.innerHTML = '<div class="spinner"></div>';
  searchBtn.disabled = true;

  try {
    const res = await fetch(WORKER_URL + '/check?name=' + encodeURIComponent(query), {
      headers: { 'APIKEY': getKey() },
    });

    const data = await res.json();

    if (res.status === 401) {
      localStorage.removeItem(KEY_STORAGE);
      showKeyForm();
      keyError.textContent = 'Ключ недійсний. Введіть новий.';
      keyError.classList.remove('hidden');
      return;
    }

    if (!res.ok) {
      showError(data.error || 'Помилка сервера');
      return;
    }

    renderResults(data);
  } catch (err) {
    showError('Не вдалося з\'єднатися з сервером.');
  } finally {
    searchBtn.disabled = false;
  }
}

function renderResults(data) {
  if (data.results && data.results.length > 0) {
    resultsDiv.innerHTML = data.results.map(renderCard).join('');
  } else {
    resultsDiv.innerHTML =
      '<div class="empty-state"><h2>' + (data.message || 'Нічого не знайдено') + '</h2><p>Спробуйте іншу назву</p></div>';
  }
}

function renderCard(mod) {
  const labels = { yes: 'С', maybe: 'М', no: 'Н', unknown: '?' };

  const tagsHtml = (mod.tags || []).length
    ? '<div class="mod-tags">' + mod.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>'
    : '';

  const notesHtml = (mod.notes || []).length
    ? '<div class="mod-notes">' + mod.notes.map(function (n) { return '<div class="note">' + esc(n) + '</div>'; }).join('') + '</div>'
    : '';

  return '<div class="mod-card">' +
    '<div class="badge" style="background:' + mod.color + '">' + (labels[mod.status] || '?') + '</div>' +
    '<div class="mod-info">' +
    '<div class="mod-name"><a href="' + mod.url + '" target="_blank">' + esc(mod.name) + '</a></div>' +
    '<div class="mod-meta">' + esc(mod.author) + ' · ID ' + mod.id + '</div>' +
    '<div class="mod-summary">' + esc(mod.summary || '') + '</div>' +
    '<div class="compat-reason ' + mod.status + '">' + esc(mod.reason) + '</div>' +
    tagsHtml + notesHtml +
    '</div></div>';
}

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.remove('hidden');
  resultsDiv.innerHTML = '';
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
