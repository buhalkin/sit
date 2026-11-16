(() => {
  'use strict'; 

  const STORAGE_KEY = 'board-games-cart-v1'; 
  const money = new Intl.NumberFormat('ru-RU', { 
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  });

  function readCart() { 
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); 
      if (!Array.isArray(value)) return []; 
      return value.filter((item) => 
        item && typeof item.id === 'string' && typeof item.name === 'string' && Number.isFinite(Number(item.price)) && Number(item.price) >= 0 && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0
      ).map((item) => ({ 
        id: item.id, name: item.name, price: Number(item.price), quantity: Number(item.quantity),
      }));
    } catch (error) { 
      console.error('Не удалось прочитать корзину:', error);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); 
    } catch (error) { 
      console.error('Не удалось сохранить корзину в браузере:', error);
      alert('Не удалось сохранить корзину. Проверьте настройки браузера.');
    }
  }

  function makeId(name) { 
    return name.toLocaleLowerCase('ru-RU').trim().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, ''); 
  }

  function parsePrice(value) { 
    const normalized = String(value ?? '').replace(/[\s\u00a0₽]/g, '').replace(',', '.'); 
    const price = Number(normalized);
    return Number.isFinite(price) && price >= 0 ? price : NaN; 
  }

  function productFromButton(button) { 
    const card = button.closest('.card, [data-product]'); 
    const nameElement = card?.querySelector('h2, h3, .card-title'); 
    const name = String(button.dataset.name || card?.dataset.name || nameElement?.textContent || '').trim();
    const priceValue = button.dataset.price ?? card?.dataset.price; 
    const price = parsePrice(priceValue); 
    const id = String(button.dataset.id || card?.dataset.id || makeId(name)).trim(); 

    if (!name || !id || !Number.isFinite(price)) { 
      console.error('Не удалось добавить игру: у кнопки или карточки должны быть указаны название и цена.', { button, name, priceValue });
      alert('Не удалось добавить игру. Проверьте название и цену в карточке товара.');
      return null;
    }
    return { id, name, price };
  }

  function addProduct(product) { 
    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id); 
    if (existing) { 
      existing.quantity += 1;
      existing.name = product.name;
      existing.price = product.price;
    } else { 
      cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    renderCart();
  }

  function createButton(text, label, attributes = {}) { 
    const button = document.createElement('button');
    button.type = 'button'; 
    button.textContent = text; 
    button.setAttribute('aria-label', label); 
    Object.entries(attributes).forEach(([key, value]) => button.setAttribute(key, value)); 
    return button;
  }

  function renderCart() { 
    const cart = readCart();
    const body = document.querySelector('#cart-items, .cart-table tbody'); 
    const totalCell = document.querySelector('#cart-total, .cart-table tfoot td:last-child'); 
    const count = cart.reduce((sum, item) => sum + item.quantity, 0); 

    document.querySelectorAll('[data-cart-count]').forEach((element) => { 
      element.textContent = String(count);
      element.hidden = false;
    });

    if (!body) return; 

    body.replaceChildren(); 

    if (cart.length === 0) { 
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4; 
      cell.textContent = 'В корзине пока нет игр.';
      row.append(cell);
      body.append(row);
      if (totalCell) totalCell.textContent = money.format(0);
      return;
    }

    let total = 0; 

    cart.forEach((item) => {
      const row = document.createElement('tr');
      const itemTotal = item.price * item.quantity; 
      total += itemTotal;

      const nameCell = document.createElement('th');
      nameCell.scope = 'row'; 
      nameCell.textContent = item.name;
      const removeButton = createButton('Удалить', `Удалить ${item.name} из корзины`, { 
        'data-cart-action': 'remove', 'data-id': item.id, 
      });
      removeButton.classList.add('cart-remove');
      nameCell.append(' ', removeButton);

      const quantityCell = document.createElement('td');
      quantityCell.className = 'num';
      quantityCell.dataset.label = 'Количество'; 
      const decreaseButton = createButton('-', `Уменьшить количество: ${item.name}`, { 
        'data-cart-action': 'decrease', 'data-id': item.id, 
      });
      const quantityText = document.createElement('span');
      quantityText.textContent = ` ${item.quantity} `;
      const increaseButton = createButton('+', `Увеличить количество: ${item.name}`, { 
        'data-cart-action': 'increase', 'data-id': item.id, 
      });
      quantityCell.append(decreaseButton, quantityText, increaseButton);

      const priceCell = document.createElement('td');
      priceCell.className = 'num';
      priceCell.dataset.label = 'Цена';
      priceCell.textContent = money.format(item.price);

      const sumCell = document.createElement('td');
      sumCell.className = 'num';
      sumCell.dataset.label = 'Сумма';
      sumCell.textContent = money.format(itemTotal);

      row.append(nameCell, quantityCell, priceCell, sumCell);
      body.append(row);
    });

    if (totalCell) totalCell.textContent = money.format(total); 
  }

  document.addEventListener('click', (event) => { 
    const addButton = event.target.closest('[data-add-to-cart], .add-to-cart'); 
    if (addButton) {
      event.preventDefault();
      const product = productFromButton(addButton);
      if (product) addProduct(product);
      return;
    }

    const actionButton = event.target.closest('[data-cart-action]'); 
    if (!actionButton) return; 

    event.preventDefault();
    const { cartAction: action, id } = actionButton.dataset; 
    const cart = readCart();
    const index = cart.findIndex((item) => item.id === id); 
    if (index === -1) return;

    if (action === 'remove') { 
      cart.splice(index, 1);
    } else if (action === 'increase') { 
      cart[index].quantity += 1;
    } else if (action === 'decrease') { 
      cart[index].quantity -= 1;
      if (cart[index].quantity <= 0) cart.splice(index, 1);
    } else { 
      return;
    }
    saveCart(cart);
    renderCart();
  });

  // --- АВТОРИЗАЦИЯ И ПРОФИЛЬ ---
  // --- АВТОРИЗАЦИЯ И ПРОФИЛЬ ---
  function checkAuth() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const authBlock = document.querySelector('#auth-block');
    const profileBlock = document.querySelector('#profile-block');

    if (token && username) {
      if (authBlock) authBlock.style.display = 'none';
      if (profileBlock) {
        profileBlock.style.display = 'block';
        document.querySelector('#profile-username').textContent = username;
        loadMyOrders(); // Загружаем историю заказов
      }
    } else {
      if (authBlock) authBlock.style.display = 'flex'; // Показываем обе формы
      if (profileBlock) profileBlock.style.display = 'none';
    }
  }

  // Функция загрузки истории заказов
  async function loadMyOrders() {
    const token = localStorage.getItem('token');
    const list = document.querySelector('#my-orders-list');
    if (!list) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Ошибка загрузки');
      
      const orders = await response.json();
      list.innerHTML = ''; 

      if (orders.length === 0) {
        list.innerHTML = '<li>У вас пока нет заказов.</li>';
        return;
      }

      orders.forEach(order => {
        const li = document.createElement('li');
        li.textContent = `${order.product_name} — ${order.quantity} шт.`;
        list.append(li);
      });
    } catch (error) {
      list.innerHTML = '<li>Не удалось загрузить заказы.</li>';
    }
  }

  // Вход
  document.querySelector('#login-btn')?.addEventListener('click', async () => {
    const usernameInput = document.querySelector('#login-username').value.trim();
    const passwordInput = document.querySelector('#login-password').value;
    const errorBlock = document.querySelector('#auth-error');
    
    if (!usernameInput || !passwordInput) return;

    try {
      const formData = new URLSearchParams();
      formData.append('username', usernameInput);
      formData.append('password', passwordInput);

      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Неверный логин или пароль');
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', usernameInput);
      
      checkAuth();
      if (errorBlock) errorBlock.style.display = 'none';
      
    } catch (error) {
      if (errorBlock) { errorBlock.textContent = error.message; errorBlock.style.display = 'block'; }
    }
  });

  // Регистрация
  document.querySelector('#register-btn')?.addEventListener('click', async () => {
    const usernameInput = document.querySelector('#reg-username').value.trim();
    const passwordInput = document.querySelector('#reg-password').value;
    const errorBlock = document.querySelector('#auth-error');
    
    if (!usernameInput || !passwordInput) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      if (!response.ok) throw new Error('Логин уже занят или ошибка сервера');
      
      alert('Регистрация успешна! Теперь вы можете войти.');
      document.querySelector('#reg-username').value = '';
      document.querySelector('#reg-password').value = '';
      
    } catch (error) {
      if (errorBlock) { errorBlock.textContent = error.message; errorBlock.style.display = 'block'; }
    }
  });

  // Выход
  document.querySelector('#logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    checkAuth();
  });

  document.querySelector('#login-btn')?.addEventListener('click', async () => {
    const usernameInput = document.querySelector('#login-username').value.trim();
    const passwordInput = document.querySelector('#login-password').value;
    const loginError = document.querySelector('#login-error');
    
    if (!usernameInput || !passwordInput) return;

    try {
      const formData = new URLSearchParams();
      formData.append('username', usernameInput);
      formData.append('password', passwordInput);

      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Неверный логин или пароль');
      
      const data = await response.json();
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', usernameInput);
      
      checkAuth();
      if (loginError) loginError.style.display = 'none';
      
    } catch (error) {
      if (loginError) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
      }
    }
  });

  document.querySelector('#logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    checkAuth();
  });

  // --- ОФОРМЛЕНИЕ ЗАКАЗА ---
  document.querySelector('#checkout-btn')?.addEventListener('click', async () => {
    const cart = readCart();
    if (cart.length === 0) return alert('Корзина пуста');
    
    const token = localStorage.getItem('token');
    if (!token) return alert('Для оформления заказа нужно войти (логин: test, пароль: 123)');

    try {
        for (const item of cart) {
            await fetch('http://127.0.0.1:8000/api/orders', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ product_id: Number(item.id), quantity: item.quantity })
            });
        }
        localStorage.removeItem(STORAGE_KEY); 
        renderCart();
        alert('Заказы успешно отправлены в базу данных!');
    } catch (e) {
        alert('Ошибка при оформлении заказа');
    }
  });

  // Запуск
  renderCart();
  checkAuth();
})();