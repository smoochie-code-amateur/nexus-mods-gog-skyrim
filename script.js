var WORKER_URL = 'https://nexus-api.nitanaredleaf.workers.dev';
var KEY_STORAGE = 'nexus_api_key';
var LANG_STORAGE = 'nexus_lang';

var translations = {
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
  },
};

var reasonMap = {
  'Ймовірно несумісний': { ua: 'Ймовірно несумісний', en: 'Likely incompatible' },
  'Підтверджено GOG-сумісність': { ua: 'Підтверджено GOG-сумісність', en: 'GOG compatibility confirmed' },
  'Версійно-залежний — платформа не вказана': { ua: 'Версійно-залежний — платформа не вказана', en: 'Version-dependent — platform not specified' },
  'Можливо сумісний': { ua: 'Можливо сумісний', en: 'Possibly compatible' },
  'Немає інформації про платформу': { ua: 'Немає інформації про платформу', en: 'No platform info' },
  'Сумісний — через залежність від GOG-сумісного моду': { ua: 'Сумісний — через залежність від GOG-сумісного моду', en: 'Compatible — via GOG-compatible dependency' },
};

var noteMap = {
  'Залежності:': { ua: 'Залежності:', en: 'Dependencies:' },
  'Версійно-залежний:': { ua: 'Версійно-залежний:', en: 'Version-dependent:' },
  'Залежить від GOG-сумісного:': { ua: 'Залежить від GOG-сумісного:', en: 'Depends on GOG-compatible:' },
};

var currentLang = localStorage.getItem(LANG_STORAGE) || 'ua';
var lastResults = null;

function t(key) {
  return translations[currentLang][key] || translations['ua'][key] || key;
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function translateReason(reason) {
  if (reasonMap[reason]) return reasonMap[reason][currentLang] || reason;
  return reason;
}

function translateNote(note) {
  for (var key in noteMap) {
    if (note.indexOf(key) === 0) {
      return noteMap[key][currentLang] + note.substring(key.length);
    }
  }
  return note;
}

function renderCard(mod) {
  var thumb = mod.picture_url
    ? '<img src="' + esc(mod.picture_url) + '" class="mod-thumb" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="mod-thumb-fallback" style="display:none">⚔</div>'
    : '<div class="mod-thumb-fallback">⚔</div>';

  var tagsHtml = '';
  if (mod.tags && mod.tags.length) {
    tagsHtml = '<div class="mod-tags">';
    for (var i = 0; i < mod.tags.length; i++) {
      tagsHtml += '<span class="tag">' + esc(mod.tags[i]) + '</span>';
    }
    tagsHtml += '</div>';
  }

  var notesHtml = '';
  if (mod.notes && mod.notes.length) {
    notesHtml = '<div class="mod-notes">';
    for (var j = 0; j < mod.notes.length; j++) {
      notesHtml += '<div class="note">' + esc(translateNote(mod.notes[j])) + '</div>';
    }
    notesHtml += '</div>';
  }

  return '<div class="mod-card card-' + esc(mod.status) + '">' +
    '<div class="card-left">' + thumb + '</div>' +
    '<div class="card-right">' +
    '<div class="mod-name"><a href="' + mod.url + '" target="_blank">' + esc(mod.name) + '</a></div>' +
    '<div class="mod-meta">' + esc(mod.author) + ' · ID ' + mod.id + '</div>' +
    '<div class="mod-summary">' + esc(mod.summary || '') + '</div>' +
    '<div class="compat-reason ' + esc(mod.status) + '">' + esc(translateReason(mod.reason)) + '</div>' +
    tagsHtml + notesHtml +
    '</div></div>';
}

function renderResults(data) {
  lastResults = data;
  var el = document.getElementById('results');
  if (!el) return;
  if (data.results && data.results.length > 0) {
    el.innerHTML = data.results.map(renderCard).join('');
  } else {
    el.innerHTML =
      '<div class="empty-state"><h2>' + (data.message || t('notFound')) + '</h2><p>' + t('tryOther') + '</p></div>';
  }
}

function showError(msg) {
  var el = document.getElementById('error');
  var res = document.getElementById('results');
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  if (res) res.innerHTML = '';
}

function updateUI() {
  document.getElementById('langBtn').textContent = currentLang === 'ua' ? 'EN' : 'UA';
  document.getElementById('mainTitle').textContent = t('title');
  document.getElementById('mainSubtitle').textContent = t('subtitle');
  document.getElementById('keyTitle').textContent = t('keyTitle');
  document.getElementById('keyDesc').innerHTML = t('keyDesc');
  document.getElementById('keyLink').textContent = t('getKey');
  document.getElementById('keyInput').placeholder = t('keyPlaceholder');
  document.getElementById('keyBtn').textContent = t('saveKey');
  document.getElementById('changeKeyBtn').textContent = t('changeKey');
  document.getElementById('keySavedText').textContent = t('keySaved');
  document.getElementById('searchInput').placeholder = t('searchPlaceholder');
  document.getElementById('searchBtn').textContent = t('searchBtn');
  document.getElementById('footerText').innerHTML = t('footer');
  if (lastResults) renderResults(lastResults);
}

document.addEventListener('DOMContentLoaded', function () {
  updateUI();

  var savedKey = localStorage.getItem(KEY_STORAGE);
  if (savedKey) showApp();

  document.getElementById('langBtn').addEventListener('click', function () {
    currentLang = currentLang === 'ua' ? 'en' : 'ua';
    localStorage.setItem(LANG_STORAGE, currentLang);
    updateUI();
  });

  document.getElementById('keyBtn').addEventListener('click', function () {
    var key = document.getElementById('keyInput').value.trim();
    var errEl = document.getElementById('keyError');
    if (!key) {
      errEl.textContent = t('keyEmpty');
      errEl.classList.remove('hidden');
      return;
    }
    if (key.length < 10) {
      errEl.textContent = t('keyInvalid');
      errEl.classList.remove('hidden');
      return;
    }
    localStorage.setItem(KEY_STORAGE, key);
    errEl.classList.add('hidden');
    showApp();
  });

  document.getElementById('keyInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('keyBtn').click();
  });

  document.getElementById('changeKeyBtn').addEventListener('click', function () {
    document.getElementById('appView').classList.add('hidden');
    document.getElementById('keyView').classList.remove('hidden');
    document.getElementById('keyInput').value = localStorage.getItem(KEY_STORAGE) || '';
    document.getElementById('keyError').classList.add('hidden');
  });

  document.getElementById('searchBtn').addEventListener('click', handleSearch);

  document.getElementById('searchInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSearch();
  });

  function showApp() {
    document.getElementById('keyView').classList.add('hidden');
    document.getElementById('appView').classList.remove('hidden');
    document.getElementById('results').innerHTML = '';
    document.getElementById('error').classList.add('hidden');
    document.getElementById('searchInput').focus();
  }

  function handleSearch() {
    var query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    document.getElementById('error').classList.add('hidden');
    document.getElementById('results').innerHTML = '<div class="spinner"></div>';
    document.getElementById('searchBtn').disabled = true;

    fetch(WORKER_URL + '/check?name=' + encodeURIComponent(query), {
      headers: { 'APIKEY': localStorage.getItem(KEY_STORAGE) },
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (result.status === 401) {
          localStorage.removeItem(KEY_STORAGE);
          document.getElementById('appView').classList.add('hidden');
          document.getElementById('keyView').classList.remove('hidden');
          document.getElementById('keyInput').value = '';
          var errEl = document.getElementById('keyError');
          errEl.textContent = t('keyExpired');
          errEl.classList.remove('hidden');
          return;
        }

        if (!result.ok) {
          showError(result.data.error || t('serverError'));
          return;
        }

        renderResults(result.data);
      })
      .catch(function () {
        showError(t('connectionError'));
      })
      .finally(function () {
        document.getElementById('searchBtn').disabled = false;
      });
  }
});
