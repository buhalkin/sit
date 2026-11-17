// Находим нужные элементы страницы
const filterForm = document.querySelector('#catalog-filter');
const list = document.querySelector('#catalog-list');
const countBox = document.querySelector('#results-count');
const noResultsBox = document.querySelector('#no-results');
const ratesStatus = document.querySelector('#rates-status');
const retryRatesBtn = document.querySelector('#rates-retry');
const searchInput = document.querySelector('#search-input'); // <-- НОВОЕ: Поле поиска

let cards = []; 

const TIME_FILTERS = {
  30: (minutes) => minutes <= 30,
  60: (minutes) => minutes > 30 && minutes <= 60,
  90: (minutes) => minutes > 60,
};
 
const SORTERS = {
  name: (a, b) => (a.dataset.name || '').localeCompare(b.dataset.name || '', 'ru'),
  'price-asc': (a, b) => Number(a.dataset.price || 0) - Number(b.dataset.price || 0),
  'price-desc': (a, b) => Number(b.dataset.price || 0) - Number(a.dataset.price || 0),
};
 
// ФУНКЦИЯ ФИЛЬТРАЦИИ (добавлено условие поиска по тексту)
function matchesFilters(card, players, time, searchQuery) {
  const minPlayers = Number(card.dataset.minPlayers);
  const maxPlayers = Number(card.dataset.maxPlayers);
  const playersOk = players === 0 || (players === 5 ? maxPlayers >= 5 : players >= minPlayers && players <= maxPlayers);
  const timeOk = time === 0 || TIME_FILTERS[time](Number(card.dataset.time));
  
  // Проверка по поиску (если введено что-то)
  const name = (card.dataset.name || '').toLowerCase();
  const searchOk = searchQuery === '' || name.includes(searchQuery);
  
  return playersOk && timeOk && searchOk;
}
 
function applyFilters() {
  if (!filterForm) return;
  const data = new FormData(filterForm);
  const players = Number(data.get('players'));
  const time = Number(data.get('time'));
  const sortType = data.get('sort') || 'name';
  
  // Получаем текст поиска
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
 
  const visible = cards
    .filter((card) => matchesFilters(card, players, time, searchQuery))
    .sort(SORTERS[sortType]);
 
  cards.forEach((card) => (card.hidden = true));
  visible.forEach((card) => {
    card.hidden = false;
    list.append(card);
  });
 
  if (countBox) countBox.textContent = `Найдено игр: ${visible.length}`;
  if (noResultsBox) noResultsBox.hidden = visible.length > 0;
}
 
async function showRates() {
  // ... этот блок у вас работает, оставляем без изменений ...
  if (!ratesStatus) return;
  ratesStatus.textContent = 'Загружаем курсы ЦБ РФ…';
  ratesStatus.hidden = false;
  if (retryRatesBtn) retryRatesBtn.hidden = false;
 
  try {
    const { USD, EUR } = await fetchRates(); 
    cards.forEach((card) => {
      const rubles = Number(card.dataset.price);
      const altPrice = card.querySelector('.price-alt');
      if (altPrice) {
        altPrice.textContent = `≈ ${convertRubles(rubles, USD)} $ · ${convertRubles(rubles, EUR)} €`;
        altPrice.hidden = false;
      }
    });
    ratesStatus.textContent = `Курс ЦБ: 1 $ = ${USD.toFixed(2)} ₽, 1 € = ${EUR.toFixed(2)} ₽`;
  } catch (error) {
    console.error('Не удалось загрузить курсы валют:', error);
    ratesStatus.textContent = 'Курсы ЦБ временно недоступны. Цены указаны в рублях.';
  }
}

async function loadCatalog() {
  try {
    const response = await fetch('https://sit-rx6i.onrender.com/api/products');
    if (!response.ok) throw new Error('Ошибка сервера');
    const products = await response.json();
    
    list.innerHTML = ''; 

    const hiddenGames = ['Мачи Коро', 'Ужас Аркхэма'];

    const gameImages = {
      'Азул': 'azul',
      'Колонизаторы': 'colonizers',
      'Каркассон': 'carcassonne',
      'Билет на поезд': 'ticket-to-ride',
      'Диксит': 'dixit',
      'Сплэндор': 'splendor',
      'Манчкин': 'munchkin',
      'Эволюция': 'evolution',
      'Имаджинариум': 'imaginarium',
      '7 Чудес': '7wonders',
      'Пандемия': 'pandemic',
      'Древний Ужас': 'eldritch',
      'Кодовые имена': 'codenames',
      'Гномы-вредители': 'gnomes',
      'Мафия': 'mafia'
    };

    const gameLinks = {
      'Азул': 'azul.html',
      'Колонизаторы': 'colonizers.html',
      'Каркассон': 'carcassonne.html',
      'Билет на поезд': 'ticket-to-ride.html',
      'Диксит': 'dixit.html',
      'Сплэндор': 'splendor.html',
      'Манчкин': 'munchkin.html',
      'Эволюция': 'evolution.html',
      'Имаджинариум': 'imaginarium.html',
      '7 Чудес': '7wonders.html',
      'Пандемия': 'pandemic.html',
      'Древний Ужас': 'eldritch.html',
      'Кодовые имена': 'codenames.html',
      'Гномы-вредители': 'gnomes.html',
      'Мафия': 'mafia.html'
    };

    products.forEach((game) => {
      if (hiddenGames.includes(game.name)) return;

      const article = document.createElement('article');
      article.className = 'card';
      
      article.dataset.name = game.name || '';
      article.dataset.price = game.price || 0;
      article.dataset.minPlayers = game.min_players || 0;
      article.dataset.maxPlayers = game.max_players || 0;
      article.dataset.time = game.play_time || 0;
      
      const imgName = gameImages[game.name] || 'logo'; 
      const link = gameLinks[game.name] || null;
      
      let imgHTML = `<img src="images/${imgName}.jpg" alt="${game.name}" width="400" height="200" loading="lazy" onerror="this.src='images/logo.svg'; this.style.objectFit='contain'; this.style.padding='20px'; this.style.background='#f5f0eb';">`;

      if (link) {
        imgHTML = `<a href="games/${link}">${imgHTML}</a>`;
      }

      const titleHTML = link ? `<a href="games/${link}">${game.name}</a>` : game.name;

      article.innerHTML = `
        ${imgHTML}
        <div class="card-body">
          <h3>${titleHTML}</h3>
          <p>${game.min_players}–${game.max_players} игроков • ${game.play_time} мин</p>
          <div class="price">${game.price} ₽</div>
          <p class="price-alt" hidden></p>
          <button type="button" class="btn add-to-cart" data-add-to-cart data-id="${game.id}" data-name="${game.name}" data-price="${game.price}">В корзину</button>
        </div>
      `;
      list.append(article);
    });

    cards = [...list.querySelectorAll('.card')]; 
    applyFilters(); 
    showRates();    
    
  } catch (error) {
    console.error('Не удалось загрузить каталог:', error);
    list.innerHTML = '<p class="no-results">Сервер недоступен. Убедитесь, что Python запущен.</p>';
  }
}
 
if (filterForm) filterForm.addEventListener('change', applyFilters); 
if (filterForm) filterForm.addEventListener('submit', (event) => event.preventDefault()); 
if (retryRatesBtn) retryRatesBtn.addEventListener('click', showRates); 

// ДОБАВЛЯЕМ ОБРАБОТЧИК ВВОДА В ПОИСК (чтобы искало при каждом нажатии клавиши)
if (searchInput) searchInput.addEventListener('input', applyFilters);
 
loadCatalog();
