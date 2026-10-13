/* ===== Данные: единственный источник правды для карточек, поиска и карты ===== */
const COUNTRIES = [
  { name: 'Турция',     file: 'Turkey.html',      img: 'Turkey.jpeg',      lat: 39.0,  lon: 35.0,   alias: ['turkey', 'turkiye'] },
  { name: 'Египет',     file: 'Egypt.html',       img: 'Egypt.jpg',        lat: 26.8,  lon: 30.8,   alias: ['egypt'] },
  { name: 'ОАЭ',        file: 'OAE.html',         img: 'OAE.jpeg',         lat: 24.0,  lon: 54.0,   alias: ['uae', 'объединенные арабские эмираты', 'эмираты', 'дубай', 'оаэ'] },
  { name: 'Вьетнам',    file: 'Vethnam.html',     img: 'Vieham.jpeg',      lat: 16.0,  lon: 107.8,  alias: ['vietnam'] },
  { name: 'Франция',    file: 'France.html',      img: 'France.jpeg',      lat: 46.6,  lon: 2.4,    alias: ['france'] },
  { name: 'Таиланд',    file: 'Tailand.html',     img: 'Tailand.jpeg',     lat: 15.8,  lon: 100.8,  alias: ['тайланд', 'thailand'] },
  { name: 'Китай',      file: 'China.html',       img: 'China.jpeg',       lat: 35.0,  lon: 103.0,  alias: ['china'] },
  { name: 'Индия',      file: 'India.html',       img: 'India.jpeg',       lat: 20.6,  lon: 78.9,   alias: ['india'] },
  { name: 'Грузия',     file: 'Gruzia.html',      img: 'Gruzia.jpeg',      lat: 42.3,  lon: 43.4,   alias: ['georgia'] },
  { name: 'Мальдивы',   file: 'Maldivi.html',     img: 'Maldivi.jpeg',     lat: 3.2,   lon: 73.2,   alias: ['maldives'] },
  { name: 'Испания',    file: 'Spain.html',       img: 'Spain.jpeg',       lat: 40.2,  lon: -3.7,   alias: ['spain'] },
  { name: 'Германия',   file: 'german.html',      img: 'german.jpeg',      lat: 51.2,  lon: 10.4,   alias: ['germany', 'german'] },
  { name: 'Япония',     file: 'Japan.html',       img: 'japan.jpeg',       lat: 36.2,  lon: 138.3,  alias: ['japan'] },
  { name: 'Англия',     file: 'England.html',     img: 'England.jpeg',     lat: 52.5,  lon: -1.5,   alias: ['england', 'великобритания', 'британия', 'uk', 'united kingdom'] },
  { name: 'Америка',    file: 'America.html',     img: 'America.jpeg',     lat: 39.8,  lon: -98.6,  alias: ['usa', 'сша', 'america', 'united states'] },
  { name: 'Австралия',  file: 'Avstralia.html',   img: 'Avstralia.jpeg',   lat: -25.3, lon: 134.5,  alias: ['australia'] },
  { name: 'Италия',     file: 'Italy.html',       img: 'Italy.jpeg',       lat: 42.8,  lon: 12.5,   alias: ['italy'] },
  { name: 'Канада',     file: 'Canada.html',      img: 'Canada.jpeg',      lat: 56.1,  lon: -106.3, alias: ['canada'] },
  { name: 'Швейцария',  file: 'Switzerland.html', img: 'Switzerland.jpeg', lat: 46.8,  lon: 8.2,    alias: ['switzerland'] },
  { name: 'Гонконг',    file: 'Hongkong.html',    img: 'Hong Kong.jpeg',   lat: 22.3,  lon: 114.2,  alias: ['hong kong', 'hongkong'] }
];

/* Метка на карте только для Казахстана: страницы страны на сайте нет */
const EXTRA_MARKERS = [{ name: 'Казахстан', file: null, lat: 48.0, lon: 66.9, alias: ['kazakhstan'] }];

/* Данные о болезнях (из прежней карты). Для остальных стран — ссылка на страницу страны */
const HEALTH = {
  'Казахстан': { diseases: ['Грипп', 'ОРВИ', 'Туберкулёз', 'Гепатит A', 'Коронавирус'],
                 prevention: 'Мойте руки, пейте чистую воду, соблюдайте дистанцию.' },
  'Индия':     { diseases: ['Диарея', 'Малярия', 'Гепатит A', 'Денге', 'Тиф'],
                 prevention: 'Пейте бутилированную воду, избегайте уличной еды, используйте репелленты.' },
  'Египет':    { diseases: ['Гепатит A', 'Шистосомоз', 'Дизентерия', 'Корь', 'Грипп'],
                 prevention: 'Пейте чистую воду, избегайте купания в стоячих водоёмах, делайте прививки.' },
  'Таиланд':   { diseases: ['Денге', 'Гепатит A', 'Лихорадка чикунгунья', 'Диарея', 'Грипп'],
                 prevention: 'Используйте репелленты, избегайте заражённой воды и еды, делайте прививки.' }
};

const COUNTRIES_DIR = 'Counrties/';

/* ===== Поиск (чистые функции, без DOM) ===== */
function normalize(s) {
  return String(s).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function keysOf(c) {
  return [c.name].concat(c.alias || []).map(normalize);
}

function findMatches(query) {
  const q = normalize(query);
  if (!q) return [];
  const list = COUNTRIES.filter(c => c.file);
  const exact = list.filter(c => keysOf(c).includes(q));
  if (exact.length) return exact;
  const starts = list.filter(c => keysOf(c).some(k => k.startsWith(q)));
  if (starts.length) return starts;
  return q.length >= 2 ? list.filter(c => keysOf(c).some(k => k.includes(q))) : [];
}

/* ===== Интерфейс ===== */
function initUI() {
  const $ = id => document.getElementById(id);

  // Карточки и подсказки поиска
  $('cities').innerHTML = COUNTRIES.map(c => {
    const href = COUNTRIES_DIR + c.file;
    const src = 'Images/' + encodeURIComponent(c.img);
    return '<div class="city"><a href="' + href + '">' +
      '<img src="' + src + '" alt="' + c.name + '" loading="lazy">' +
      '<div class="city__name">' + c.name + '</div></a></div>';
  }).join('');
  $('countriesList').innerHTML = COUNTRIES.map(c => '<option value="' + c.name + '">').join('');

  // Поиск
  const result = $('search-result');
  $('search-form').addEventListener('submit', e => {
    e.preventDefault();
    const raw = $('searchBox').value;
    const found = findMatches(raw);
    if (found.length === 1) {
      window.location.href = COUNTRIES_DIR + found[0].file;
    } else if (found.length > 1) {
      result.innerHTML = 'Найдено несколько стран: ' + found.map(c =>
        '<a href="' + COUNTRIES_DIR + c.file + '">' + c.name + '</a>').join('');
    } else {
      result.innerHTML = '<span class="error">' +
        (raw.trim() ? 'Страна «' + raw.trim().replace(/[<>&]/g, '') + '» не найдена. Попробуйте другое название.' : 'Введите название страны.') +
        '</span>';
    }
  });
  $('searchBox').addEventListener('input', () => { result.innerHTML = ''; });

  // Бургер-меню
  const burger = $('burger'), menu = $('menu');
  const setMenu = open => { menu.hidden = !open; burger.setAttribute('aria-expanded', String(open)); };
  burger.addEventListener('click', e => { e.stopPropagation(); setMenu(menu.hidden); });
  menu.addEventListener('click', () => setMenu(false));
  document.addEventListener('click', e => { if (!menu.contains(e.target)) setMenu(false); });

  // Модальное окно
  const modal = $('modal');
  const closeModal = () => { modal.hidden = true; };
  $('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); setMenu(false); } });

  function showDetails(c) {
    $('country-name').textContent = c.name;
    const data = HEALTH[c.name];
    let html = '';
    if (data) {
      html += '<h3>Наиболее частые заболевания:</h3><ul>' + data.diseases.map(d => '<li>' + d + '</li>').join('') + '</ul>' +
              '<h3>Рекомендации:</h3><p>' + data.prevention + '</p>';
    } else {
      html += '<p>Краткая сводка для этой страны пока не добавлена на карту.</p>';
    }
    if (c.file) html += '<a class="modal__link" href="' + COUNTRIES_DIR + c.file + '">Страница страны →</a>';
    $('modal-body').innerHTML = html;
    modal.hidden = false;
  }

  // Карта
  if (typeof L === 'undefined') {
    $('map').textContent = 'Не удалось загрузить карту. Проверьте подключение к интернету.';
    return;
  }
  const map = L.map('map', { worldCopyJump: true }).setView([25, 20], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '&copy; участники <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  COUNTRIES.concat(EXTRA_MARKERS).forEach(c => {
    const box = document.createElement('div');
    const title = document.createElement('b');
    title.textContent = c.name;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'popup-btn'; btn.textContent = 'Подробнее';
    btn.addEventListener('click', () => showDetails(c));
    box.append(title, document.createElement('br'), btn);
    L.marker([c.lat, c.lon], { title: c.name }).addTo(map).bindPopup(box);
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initUI);
}
if (typeof module !== 'undefined') {
  module.exports = { findMatches, normalize, COUNTRIES };
}
