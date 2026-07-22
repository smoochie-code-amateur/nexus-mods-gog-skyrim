var WORKER_URL = 'https://nexus-api.nitanaredleaf.workers.dev';
var KEY_STORAGE = 'nexus_api_key';
var LANG_STORAGE = 'nexus_lang';
var VERSION_STORAGE = 'nexus_game_version';

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
    versionLabel: 'Версія Skyrim SE (GOG):',
    versionCurrent: '1.6.1179 (поточна)',
    versionOld: '1.6.659 (стара)',
    voteCompatible: 'Сумісний',
    voteIncompatible: 'Несумісний',
    communityVotes: 'Голоси спільноти:',
    voteSaved: 'Голос збережено',
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
    versionLabel: 'Skyrim SE version (GOG):',
    versionCurrent: '1.6.1179 (current)',
    versionOld: '1.6.659 (old)',
    voteCompatible: 'Compatible',
    voteIncompatible: 'Incompatible',
    communityVotes: 'Community votes:',
    voteSaved: 'Vote saved',
  },
};

var reasonMap = {
  'Ймовірно несумісний': { ua: 'Ймовірно несумісний', en: 'Likely incompatible' },
  'Підтверджено GOG-сумісність': { ua: 'Підтверджено GOG-сумісність', en: 'GOG compatibility confirmed' },
  'Версійно-залежний — платформа не вказана': { ua: 'Версійно-залежний — платформа не вказана', en: 'Version-dependent — platform not specified' },
  'Версійно-залежний — файли для іншої версії гри': { ua: 'Версійно-залежний — файли для іншої версії гри', en: 'Version-dependent — files for different game version' },
  'Можливо сумісний': { ua: 'Можливо сумісний', en: 'Possibly compatible' },
  'Можливо сумісний — через залежність': { ua: 'Можливо сумісний — через залежність', en: 'Possibly compatible — via dependency' },
  'Немає інформації про платформу': { ua: 'Немає інформації про платформу', en: 'No platform info' },
  'Сумісний — через залежність від GOG-сумісного моду': { ua: 'Сумісний — через залежність від GOG-сумісного моду', en: 'Compatible — via GOG-compatible dependency' },
};

var noteMap = {
  'Залежності:': { ua: 'Залежності:', en: 'Dependencies:' },
  'Версійно-залежний:': { ua: 'Версійно-залежний:', en: 'Version-dependent:' },
  'Залежить від GOG-сумісного:': { ua: 'Залежить від GOG-сумісного:', en: 'Depends on GOG-compatible:' },
  'Залежить від можливо сумісного:': { ua: 'Залежить від можливо сумісного:', en: 'Depends on possibly compatible:' },
};

var evidenceMap = [
  { prefix: 'Залежність згадує GOG:', en: 'Dependency mentions GOG:' },
  { prefix: 'Файл містить GOG у назві:', en: 'File contains GOG in name:' },
  { prefix: 'Знайдено', en: 'Found', suffix: 'у тексті мода', enSuffix: 'in mod text' },
  { prefix: 'Тег мода:', en: 'Mod tags:' },
  { prefix: 'Залежність', en: 'Dependency', suffix: 'сумісна з GOG', enSuffix: 'is GOG-compatible' },
  { prefix: 'Залежність', en: 'Dependency', suffix: 'можливо сумісна з GOG', enSuffix: 'is possibly GOG-compatible' },
  { prefix: 'SKSE-плагін не оновлювався', en: 'SKSE plugin not updated for', suffix: '(останнє оновлення:', enSuffix: '(last updated:' },
  { prefix: 'SKSE-плагін оновлено', en: 'SKSE plugin last updated' },
  { prefix: 'Файли призначені для версії', en: 'Files designed for version', suffix: '(поточна:', enSuffix: '(current:' },
];

var currentLang = localStorage.getItem(LANG_STORAGE);
if (currentLang !== 'ua' && currentLang !== 'en') currentLang = 'ua';
var lastResults = null;

function t(key) {
  var lang = translations[currentLang] ? currentLang : 'ua';
  return (translations[lang] && translations[lang][key]) || translations['ua'][key] || key;
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

function translateEvidence(text) {
  if (currentLang === 'ua') return text;
  for (var i = 0; i < evidenceMap.length; i++) {
    var rule = evidenceMap[i];
    if (rule.suffix) {
      var prefixIdx = text.indexOf(rule.prefix);
      var suffixIdx = text.indexOf(rule.suffix);
      if (prefixIdx === 0 && suffixIdx > rule.prefix.length) {
        var dynamicPart = text.substring(rule.prefix.length, suffixIdx);
        return rule.en + dynamicPart + rule.enSuffix;
      }
    } else {
      if (text.indexOf(rule.prefix) === 0) {
        return rule.en + text.substring(rule.prefix.length);
      }
    }
  }
  return text;
}

function renderCard(mod) {
  var thumb = mod.picture_url
    ? '<img src="' + esc(mod.picture_url) + '" class="mod-thumb" data-fallback="true"><div class="mod-thumb-fallback" style="display:none">⚔</div>'
    : '<div class="mod-thumb-fallback">⚔</div>';

  var evidenceHtml = '';
  if (mod.evidence && mod.evidence.length) {
    evidenceHtml = '<div class="compat-evidence">';
    for (var i = 0; i < mod.evidence.length; i++) {
      evidenceHtml += '<div class="compat-evidence-item">• ' + esc(translateEvidence(mod.evidence[i])) + '</div>';
    }
    evidenceHtml += '</div>';
  }

  var notesHtml = '';
  if (mod.notes && mod.notes.length) {
    notesHtml = '<div class="compat-notes">';
    for (var j = 0; j < mod.notes.length; j++) {
      notesHtml += '<div class="compat-note">' + esc(translateNote(mod.notes[j])) + '</div>';
    }
    notesHtml += '</div>';
  }

  var votes = mod.userVotes || { compatible: 0, incompatible: 0 };
  var voteHtml = '<div class="vote-section">' +
    '<div class="vote-buttons">' +
    '<button class="vote-btn vote-yes" data-mod-id="' + mod.id + '" data-vote="1" title="' + esc(t('voteCompatible')) + '">' +
      '👍 <span class="vote-count">' + votes.compatible + '</span>' +
    '</button>' +
    '<button class="vote-btn vote-no" data-mod-id="' + mod.id + '" data-vote="-1" title="' + esc(t('voteIncompatible')) + '">' +
      '👎 <span class="vote-count">' + votes.incompatible + '</span>' +
    '</button>' +
    '</div>' +
    '</div>';

  return '<div class="mod-card card-' + esc(mod.status) + '" data-mod-id="' + mod.id + '">' +
    '<div class="card-left">' + thumb + '</div>' +
    '<div class="card-right">' +
    '<div class="mod-name"><a href="' + mod.url + '" target="_blank">' + esc(mod.name) + '</a></div>' +
    '<div class="mod-meta">' + esc(mod.author) + ' · ID ' + mod.id + '</div>' +
    '<div class="mod-summary">' + esc(mod.summary || '') + '</div>' +
    '<div class="compat-reason ' + esc(mod.status) + '">' +
      '<span class="compat-reason-text">' + esc(translateReason(mod.reason)) + '</span>' +
      '<span class="compat-expand-hint">▼</span>' +
    '</div>' +
    voteHtml +
    '<div class="compat-details">' +
      evidenceHtml +
      notesHtml +
    '</div>' +
      '</div></div>';
}

function submitVote(modId, vote, btnEl) {
  var apiKey = localStorage.getItem(KEY_STORAGE);
  if (!apiKey) return;

  var version = document.getElementById('versionSelect').value;
  var card = btnEl.closest('.mod-card');
  var btns = card.querySelectorAll('.vote-btn');

  btns.forEach(function (b) { b.classList.remove('vote-active'); });
  btnEl.classList.add('vote-active');

  fetch(WORKER_URL + '/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'APIKEY': apiKey },
    body: JSON.stringify({ modId: modId, vote: vote, version: version }),
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var yesBtn = card.querySelector('.vote-yes .vote-count');
      var noBtn = card.querySelector('.vote-no .vote-count');
      if (yesBtn) yesBtn.textContent = data.compatible || 0;
      if (noBtn) noBtn.textContent = data.incompatible || 0;
    })
    .catch(function () {
      btnEl.classList.remove('vote-active');
    });
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
  document.getElementById('versionLabel').textContent = t('versionLabel');
  var vSelect = document.getElementById('versionSelect');
  vSelect.options[0].text = t('versionCurrent');
  vSelect.options[1].text = t('versionOld');
  if (lastResults) renderResults(lastResults);
}

document.addEventListener('DOMContentLoaded', function () {
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

  var savedVersion = localStorage.getItem(VERSION_STORAGE);
  if (savedVersion) {
    document.getElementById('versionSelect').value = savedVersion;
  }

  document.getElementById('results').addEventListener('click', function (e) {
    var voteBtn = e.target.closest('.vote-btn');
    if (voteBtn) {
      submitVote(parseInt(voteBtn.dataset.modId, 10), parseInt(voteBtn.dataset.vote, 10), voteBtn);
      return;
    }
    var reasonEl = e.target.closest('.compat-reason');
    if (reasonEl) {
      reasonEl.parentElement.parentElement.classList.toggle('show-details');
    }
  });

  document.getElementById('results').addEventListener('error', function (e) {
    if (e.target.tagName === 'IMG' && e.target.dataset.fallback) {
      e.target.style.display = 'none';
      var fb = e.target.nextElementSibling;
      if (fb) fb.style.display = 'flex';
    }
  }, true);

  try { updateUI(); } catch (e) { console.error('updateUI failed:', e); }

  var savedKey = localStorage.getItem(KEY_STORAGE);
  if (savedKey) showApp();

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

    var version = document.getElementById('versionSelect').value;
    localStorage.setItem(VERSION_STORAGE, version);

    fetch(WORKER_URL + '/check?name=' + encodeURIComponent(query) + '&version=' + encodeURIComponent(version), {
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
