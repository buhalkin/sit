// Загрузка товаров для главной страницы
document.addEventListener('DOMContentLoaded', async () => {
    const list = document.querySelector('#index-catalog-list');
    if (!list) return;

    try {
        // Запрашиваем игры у нашего Python-сервера
        const response = await fetch('https://sit-rx6i.onrender.com');
        if (!response.ok) throw new Error('Ошибка сервера');
        
        const products = await response.json();

        // Скрываем игры, которые мы убрали из каталога
        const hiddenGames = ['Мачи Коро', 'Ужас Аркхэма'];
        const visibleProducts = products.filter(game => !hiddenGames.includes(game.name));

        // Берем первые 6 игр для главной страницы
        const topGames = visibleProducts.slice(0, 6);

        // Словарь картинок
        const gameImages = {
            'Азул': 'azul',
            'Колонизаторы': 'colonizers',
            'Каркассон': 'carcassonne',
            'Билет на поезд': 'ticket-to-ride',
            'Диксит': 'dixit',
            'Сплэндор': 'splendor',
            'Манчкин': 'munchkin',
            '7 Чудес': '7wonders',
            'Пандемия': 'pandemic',
            'Кодовые имена': 'codenames',
            'Мафия': 'mafia'
        };

        // Словарь ссылок
        const gameLinks = {
            'Азул': 'games/azul.html',
            'Колонизаторы': 'games/colonizers.html',
            'Каркассон': 'games/carcassonne.html',
            'Билет на поезд': 'games/ticket-to-ride.html',
            'Диксит': 'games/dixit.html',
            'Сплэндор': 'games/splendor.html',
            'Манчкин': 'games/munchkin.html',
            '7 Чудес': 'games/7wonders.html',
            'Пандемия': 'games/pandemic.html',
            'Кодовые имена': 'games/codenames.html',
            'Мафия': 'games/mafia.html'
        };

        topGames.forEach(game => {
            const article = document.createElement('article');
            article.className = 'card';
            
            const img = gameImages[game.name] || 'logo';
            const link = gameLinks[game.name] || '#';
            
            article.innerHTML = `
                <a href="${link}"><img src="images/${img}.jpg" alt="${game.name}" width="400" height="200" loading="lazy" onerror="this.src='images/logo.svg'; this.style.objectFit='contain'; this.style.padding='20px'; this.style.background='#f5f0eb';"></a>
                <div class="card-body">
                    <h3><a href="${link}">${game.name}</a></h3>
                    <p>${game.min_players}–${game.max_players} игроков • ${game.play_time} мин</p>
                    <div class="price">${game.price} ₽</div>
                </div>
            `;
            list.append(article);
        });

    } catch (error) {
        console.error('Не удалось загрузить игры:', error);
        list.innerHTML = '<p class="no-results" style="text-align: center; width: 100%; color: red;">Сервер недоступен. Убедитесь, что Python запущен.</p>';
    }
});
