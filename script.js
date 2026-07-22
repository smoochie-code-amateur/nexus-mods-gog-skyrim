const WORKER_URL = 'https://nexus-api.nitanaredleaf.workers.dev';
const KEY_STORAGE = 'nexus_api_key';
const LANG_STORAGE = 'nexus_lang';

const translations = {
  ua: {
    title: 'GOG Skyrim Mod Checker',
    subtitle: 'Перевірка сумісності модів Nexus Mods із GOG-версією Skyrim SE',
    keyTitle: 'Потрібен API-ключ Nexus Mods',
    keyDesc: 'Цей сайт використовує <a href="https://www.nexusmods.com/skyrimspecialedition" target="_blank">Nexus Mods</a> API для пошуку та перевірки модів. Введіть ваш особистий API-ключ.',
    getKey: 'Отримати API-ключ →',
    keyPlaceholder: 'API-ключ Nexus Mods...',
    saveKey: 'Зберегти',
    keySaved: 'Ключ збережено ·',
    changeKey: 'Змінити ключ',
    searchPlaceholder: 'Назва мода або Nexus ID...',
    searchBtn: 'Перевірити',
    keyEmpty: 'Введіть API-ключ',
    keyInvalid: 'Схоже, це не схоже на API-ключ',
    keyExpired: 'Ключ недійсний. Введіть новий.',
    serverError: 'Помилка сервера',
    connectionError: 'Не вдалося з\'єднатися з сервером.',
    notFound: 'Нічого не знайдено',
    tryOther: 'Спробуйте іншу назву',
    footer: 'Дані з <a href="https://www.nexusmods.com/skyrimspecialedition" target="_blank">Nexus Mods</a>',
    statusYes: 'Сумісний',
    statusMaybe: 'Можливо',
    statusNo: 'Несумісний',
    statusUnknown: 'Невідомо',
    deps: 'Залежності:',
    versionDep: 'Версійно-залежний:',
    gogDeps: 'Залежить від GOG-сумісного:',
    by: 'від',
    id: 'ID',
  },
  en: {
    title: 'GOG Skyrim Mod Checker',
    subtitle: 'Check Nexus Mods compatibility with GOG version of Skyrim SE',
    keyTitle: 'Nexus Mods API Key Required',
    keyDesc: 'This site uses <a href="https://www.nexusmods.com/skyrimspecialedition" target="_blank">Nexus Mods</a> API to search and check mods. Enter your personal API key.',
    getKey: 'Get API key →',
    keyPlaceholder: 'Nexus Mods API key...',
    saveKey: 'Save',
    keySaved: 'Key saved ·',
    changeKey: 'Change key',
    searchPlaceholder: 'Mod name or Nexus ID...',
    searchBtn: 'Check',
    keyEmpty: 'Enter API key',
    keyInvalid: 'Doesn\'t look like an API key',
    keyExpired: 'Invalid key. Enter a new one.',
    serverError: 'Server error',
    connectionError: 'Could not connect to server.',
    notFound: 'Nothing found',
    tryOther: 'Try a different name',
    footer: 'Data from <a href="https://www.nexusmods.com/skyrimspecialedition" target="_blank">Nexus Mods</a>',
    statusYes: 'Compatible',
    statusMaybe: 'Possibly',
    statusNo: 'Incompatible',
    statusUnknown: 'Unknown',
    deps: 'Dependencies:',
    versionDep: 'Version-dependent:',
    gogDeps: 'Depends on GOG-compatible:',
    by: 'by',
    id: 'ID',
  },
};

let currentLang = localStorage.getItem(LANG_STORAGE) || 'ua';

function t(key) {
  return translations[currentLang][key] || translations['ua'][key] || key;
}

function switchLang() {
  currentLang = currentLang === 'ua' ? 'en' : 'ua';
  localStorage.setItem(LANG_STORAGE, currentLang);
  updateUI();
}

function updateUI() {
  document.getElementById('langBtn').textContent = currentLang === 'ua' ? 'EN' : 'UA';
  document.querySelector('header h1').textContent = t('title');
  document.querySelector('.subtitle').textContent = t('subtitle');
  document.querySelector('#keyView h2').textContent = t('keyTitle');
  document.querySelector('#keyView p').innerHTML = t('keyDesc');
  document.querySelector('.key-link').textContent = t('getKey');
  document.getElementById('keyInput').placeholder = t('keyPlaceholder');
  document.getElementById('keyBtn').textContent = t('saveKey');
  document.getElementById('searchInput').placeholder = t('searchPlaceholder');
  document.getElementById('searchBtn').textContent = t('searchBtn');
  document.querySelector('.key-info').innerHTML = t('keySaved') + ' <button id="changeKeyBtn">' + t('changeKey') + '</button>';
  document.getElementById('changeKeyBtn').addEventListener('click', showKeyForm);
  document.querySelector('footer p').innerHTML = t('footer');
}

document.addEventListener('DOMContentLoaded', function () {
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
  const langBtn = document.getElementById('langBtn');

  updateUI();

  const savedKey = localStorage.getItem(KEY_STORAGE);
  if (savedKey) showApp();

  keyBtn.addEventListener('click', saveKey);
  keyInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') saveKey();
  });
  changeKeyBtn.addEventListener('click', showKeyForm);
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSearch();
  });
  langBtn.addEventListener('click', switchLang);

  function saveKey() {
    const key = keyInput.value.trim();
    if (!key) {
      keyError.textContent = t('keyEmpty');
      keyError.classList.remove('hidden');
      return;
    }
    if (key.length < 10) {
      keyError.textContent = t('keyInvalid');
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

  async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    errorDiv.classList.add('hidden');
    resultsDiv.innerHTML = '<div class="spinner"></div>';
    searchBtn.disabled = true;

    try {
      const res = await fetch(WORKER_URL + '/check?name=' + encodeURIComponent(query), {
        headers: { 'APIKEY': localStorage.getItem(KEY_STORAGE) },
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem(KEY_STORAGE);
        showKeyForm();
        keyError.textContent = t('keyExpired');
        keyError.classList.remove('hidden');
        return;
      }

      if (!res.ok) {
        showError(data.error || t('serverError'));
        return;
      }

      renderResults(data);
    } catch (err) {
      showError(t('connectionError'));
    } finally {
      searchBtn.disabled = false;
    }
  }

  function renderResults(data) {
    if (data.results && data.results.length > 0) {
      resultsDiv.innerHTML = data.results.map(renderCard).join('');
    } else {
      resultsDiv.innerHTML =
        '<div class="empty-state"><h2>' + (data.message || t('notFound')) + '</h2><p>' + t('tryOther') + '</p></div>';
    }
  }

  function renderCard(mod) {
    const statusLabels = {
      yes: t('statusYes'),
      maybe: t('statusMaybe'),
      no: t('statusNo'),
      unknown: t('statusUnknown'),
    };

    const thumb = mod.picture_url
      ? '<img src="' + esc(mod.picture_url) + '" class="mod-thumb" onerror="this.outerHTML=\'<div class=\\\'mod-thumb-fallback\\\'>⚔</div>\'">'
      : '<div class="mod-thumb-fallback">⚔</div>';

    const tagsHtml = (mod.tags || []).length
      ? '<div class="mod-tags">' + mod.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>'
      : '';

    const notesHtml = (mod.notes || []).length
      ? '<div class="mod-notes">' + mod.notes.map(function (n) { return '<div class="note">' + esc(n) + '</div>'; }).join('') + '</div>'
      : '';

    return '<div class="mod-card card-' + esc(mod.status) + '">' +
      '<div class="card-left">' +
      thumb +
      '</div>' +
      '<div class="card-right">' +
      '<div class="mod-name"><a href="' + mod.url + '" target="_blank">' + esc(mod.name) + '</a></div>' +
      '<div class="mod-meta">' + esc(mod.author) + ' · ' + t('id') + ' ' + mod.id + '</div>' +
      '<div class="mod-summary">' + esc(mod.summary || '') + '</div>' +
      '<div class="compat-reason ' + esc(mod.status) + '">' + esc(mod.reason) + '</div>' +
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
});
