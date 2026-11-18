const contactForm = document.querySelector('.contact-form');
const resultBox = document.querySelector('#form-result');
 
// Убрали 'phone', так как этого поля нет в HTML
const FIELD_NAMES = ['name', 'email', 'message'];
 
const RULES = {
  name: (value) => value.trim().length < 2 ? 'Введите имя (не меньше 2 символов)' : '',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Введите адрес в формате name@example.ru',
  message: (value) => value.trim().length < 10 ? 'Сообщение должно быть не короче 10 символов' : '',
};
 
function validateField(input) {
  // Защита: если поля нет или для него нет правила — считаем валидным
  const rule = RULES[input?.name]; 
  if (!rule) return true;

  const message = rule(input.value); 
  const errorBox = document.getElementById(`${input.name}-error`); 
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.hidden = message === '';          
  }
  input.setAttribute('aria-invalid', String(message !== ''));  
  return message === '';                     
}
 
function showResult(text, type) {
  if (!resultBox) return;
  resultBox.textContent = text;
  resultBox.className = `form-result is-${type}`; 
  resultBox.hidden = false;
}
 
contactForm.querySelectorAll('input, textarea').forEach((input) => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') {
      validateField(input);
    }
  });
});
 
contactForm.addEventListener('submit', async (event) => {
  event.preventDefault(); 

  const fields = FIELD_NAMES
    .map((name) => contactForm.elements[name])
    .filter(Boolean); // отсеиваем отсутствующие поля

  const isValid = fields.map(validateField).every(Boolean); 

  if (!isValid) {
    const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    showResult('Исправьте ошибки в форме.', 'error');
    return;
  }

  // Блокируем кнопку на время отправки (чтобы не спамили)
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
  }

  try {
    const response = await fetch('https://sit-rx6i.onrender.com/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: contactForm.elements.name.value.trim(),
        email: contactForm.elements.email.value.trim(),
        message: contactForm.elements.message.value.trim()
      })
    });

    if (!response.ok) throw new Error('Ошибка сервера');

    showResult(`Спасибо, ${contactForm.elements.name.value.trim()}! Сообщение сохранено в базе.`, 'success');
    contactForm.reset();
    
    // Очищаем статусы валидации после сброса формы
    contactForm.querySelectorAll('input, textarea').forEach(input => {
        input.removeAttribute('aria-invalid');
    });

  } catch (error) {
    console.error('Ошибка отправки:', error);
    showResult('Не удалось отправить сообщение. Сервер недоступен.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить сообщение';
    }
  }
});
