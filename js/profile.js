// --- ПЕРЕКЛЮЧЕНИЕ ФОРМ ---
const loginContainer = document.querySelector('#login-form-container');
const registerContainer = document.querySelector('#register-form-container');
const showRegisterBtn = document.querySelector('#show-register');
const showLoginBtn = document.querySelector('#show-login');
const errorBlock = document.querySelector('#auth-error');

showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
    if (errorBlock) errorBlock.style.display = 'none'; // Скрываем ошибку при переходе
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
    if (errorBlock) errorBlock.style.display = 'none'; // Скрываем ошибку при переходе
});

// --- ВАЛИДАЦИЯ В РЕАЛЬНОМ ВРЕМЕНИ (чтобы писать про мало символов) ---
const regUsernameInput = document.querySelector('#reg-username');
const regPasswordInput = document.querySelector('#reg-password');

function validateInputs() {
    if (!regUsernameInput || !regPasswordInput) return;
    
    const userLen = regUsernameInput.value.trim().length;
    const passLen = regPasswordInput.value.length;

    if (userLen > 0 && userLen < 3) {
        if (errorBlock) {
            errorBlock.textContent = 'Логин должен быть не менее 3 символов';
            errorBlock.style.display = 'block';
            errorBlock.style.color = 'red';
        }
    } else if (passLen > 0 && passLen < 6) {
        if (errorBlock) {
            errorBlock.textContent = 'Пароль должен быть не менее 6 символов';
            errorBlock.style.display = 'block';
            errorBlock.style.color = 'red';
        }
    } else {
        // Если всё в порядке, скрываем ошибку, пока пользователь печатает
        if (errorBlock) errorBlock.style.display = 'none';
    }
}

regUsernameInput?.addEventListener('input', validateInputs);
regPasswordInput?.addEventListener('input', validateInputs);

// --- ПРОВЕРКА АВТОРИЗАЦИИ ---
function checkAuth() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const authSection = document.querySelector('#auth-section');
  const profileSection = document.querySelector('#profile-section');

  if (token && username) {
    if (authSection) authSection.style.display = 'none';
    if (profileSection) {
      profileSection.style.display = 'block';
      document.querySelector('#profile-username').textContent = username;
      loadMyOrders(); 
    }
  } else {
    if (authSection) authSection.style.display = 'block';
    if (profileSection) profileSection.style.display = 'none';
  }
}

// --- ЗАГРУЗКА ЗАКАЗОВ ---
async function loadMyOrders() {
  const token = localStorage.getItem('token');
  const list = document.querySelector('#my-orders-list');
  if (!list) return;

  try {
    const response = await fetch('https://sit-rx6i.onrender.com/api/my-orders', {
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

// --- ВХОД ---
document.querySelector('#login-btn')?.addEventListener('click', async () => {
  const usernameInput = document.querySelector('#login-username').value.trim();
  const passwordInput = document.querySelector('#login-password').value;
  
  if (!usernameInput || !passwordInput) return;

  try {
    const formData = new URLSearchParams();
    formData.append('username', usernameInput);
    formData.append('password', passwordInput);

    const response = await fetch('https://sit-rx6i.onrender.com/api/login', {
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
    if (errorBlock) { 
        errorBlock.textContent = error.message; 
        errorBlock.style.color = 'red';
        errorBlock.style.display = 'block'; 
    }
  }
});

// --- РЕГИСТРАЦИЯ ---
document.querySelector('#register-btn')?.addEventListener('click', async () => {
  const usernameInput = document.querySelector('#reg-username').value.trim();
  const passwordInput = document.querySelector('#reg-password').value;
  
  // Финальная проверка перед отправкой
  if (usernameInput.length < 3) {
    if (errorBlock) { 
        errorBlock.textContent = 'Логин должен быть не менее 3 символов'; 
        errorBlock.style.color = 'red';
        errorBlock.style.display = 'block'; 
    }
    return;
  }
  if (passwordInput.length < 6) {
    if (errorBlock) { 
        errorBlock.textContent = 'Пароль должен быть не менее 6 символов'; 
        errorBlock.style.color = 'red';
        errorBlock.style.display = 'block'; 
    }
    return;
  }

  try {
    const response = await fetch('https://sit-rx6i.onrender.com/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    });

    // Если сервер вернул ошибку
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ошибка при регистрации');
    }
    
    // УСПЕХ: очищаем поля и скрываем ошибку
    alert('Регистрация успешна! Теперь вы можете войти.');
    
    document.querySelector('#reg-username').value = '';
    document.querySelector('#reg-password').value = '';
    document.querySelector('#login-username').value = usernameInput;
    
    // ПЕРЕКЛЮЧАЕМ ФОРМЫ И ПРЯЧЕМ ОШИБКУ
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
    if (errorBlock) {
        errorBlock.style.display = 'none';
        errorBlock.textContent = '';       // Очищаем текст ошибки
    }
    
  } catch (error) {
    if (errorBlock) { 
        errorBlock.textContent = error.message; 
        errorBlock.style.color = 'red';
        errorBlock.style.display = 'block'; 
    }
  }
});

// --- ВЫХОД ---
document.querySelector('#logout-btn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  checkAuth();
});

checkAuth();
