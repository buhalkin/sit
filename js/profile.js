// --- УТИЛИТЫ ---
const errorBlock = document.querySelector('#auth-error');

function showError(message) {
    if (!errorBlock) return;
    errorBlock.textContent = message;
    errorBlock.hidden = false;
}

function clearError() {
    if (!errorBlock) return;
    errorBlock.textContent = '';
    errorBlock.hidden = true;
}

// Сброс поля + «отвязка» автозаполнения браузера для паролей
function resetField(input) {
    if (!input) return;
    input.value = '';
    if (input.type === 'password') {
        input.type = 'text';
        input.type = 'password';
    }
}

// --- ПЕРЕКЛЮЧЕНИЕ ФОРМ ---
const loginContainer = document.querySelector('#login-form-container');
const registerContainer = document.querySelector('#register-form-container');
const showRegisterBtn = document.querySelector('#show-register');
const showLoginBtn = document.querySelector('#show-login');

showRegisterBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    clearError();
    resetField(document.querySelector('#reg-username'));
    resetField(document.querySelector('#reg-password'));
    loginContainer.hidden = true;
    registerContainer.hidden = false;
});

showLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    clearError();
    resetField(document.querySelector('#login-username'));
    resetField(document.querySelector('#login-password'));
    registerContainer.hidden = true;
    loginContainer.hidden = false;
});

// --- ВАЛИДАЦИЯ В РЕАЛЬНОМ ВРЕМЕНИ ---
const regUsernameInput = document.querySelector('#reg-username');
const regPasswordInput = document.querySelector('#reg-password');

function validateInputs() {
    if (!regUsernameInput || !regPasswordInput) return;

    const userLen = regUsernameInput.value.trim().length;
    const passLen = regPasswordInput.value.length;

    if (userLen > 0 && userLen < 3) {
        showError('Логин должен быть не менее 3 символов');
    } else if (passLen > 0 && passLen < 6) {
        showError('Пароль должен быть не менее 6 символов');
    } else {
        clearError();
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
        if (authSection) authSection.hidden = true;
        if (profileSection) {
            profileSection.hidden = false;
            const nameEl = document.querySelector('#profile-username');
            if (nameEl) nameEl.textContent = username;
            loadMyOrders();
        }
    } else {
        if (authSection) authSection.hidden = false;
        if (profileSection) profileSection.hidden = true;
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

        // чистим поля, чтобы старый пароль не «залип» при следующем визите
        resetField(document.querySelector('#login-username'));
        resetField(document.querySelector('#login-password'));

        clearError();
        checkAuth();
    } catch (error) {
        showError(error.message);
    }
});

// --- РЕГИСТРАЦИЯ ---
const registerBtn = document.querySelector('#register-btn');

if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        const usernameInput = document.querySelector('#reg-username').value.trim();
        const passwordInput = document.querySelector('#reg-password').value;

        if (usernameInput.length < 3) {
            showError('Логин должен быть не менее 3 символов');
            return;
        }
        if (passwordInput.length < 6) {
            showError('Пароль должен быть не менее 6 символов');
            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = 'Отправка...';
        clearError();

        try {
            const response = await fetch('https://sit-rx6i.onrender.com/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Ошибка при регистрации');
            }

            alert('Регистрация успешна! Теперь вы можете войти.');

            // чистим поля регистрации (важно: resetField снимает автозаполнение)
            resetField(document.querySelector('#reg-username'));
            resetField(document.querySelector('#reg-password'));

            // подставляем логин во вход, пароль оставляем пустым
            const loginUser = document.querySelector('#login-username');
            if (loginUser) loginUser.value = usernameInput;
            resetField(document.querySelector('#login-password'));

            loginContainer.hidden = false;
            registerContainer.hidden = true;
            clearError();
        } catch (error) {
            showError(error.message);
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = 'Зарегистрироваться';
        }
    });
}

// --- ВЫХОД ---
document.querySelector('#logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    checkAuth();
});

checkAuth();
