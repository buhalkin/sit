const contactForm = document.querySelector('.contact-form');
const resultBox = document.querySelector('#form-result');
 
const FIELD_NAMES = ['name', 'email', 'phone', 'message'];
 
const RULES = {
  name: (value) => value.trim().length < 2 ? 'Введите имя (не меньше 2 символов)' : '',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Введите адрес в формате name@example.ru',
  phone: (value) => value === '' || /^[+\d\s()-]{10,}$/.test(value) ? '' : 'Введите телефон, например +7 999 123-45-67',
  message: (value) => value.trim().length < 10 ? 'Сообщение должно быть не короче 10 символов' : '',
};
 
function validateField(input) {
  const message = RULES[input.name](input.value); 
  const errorBox = document.getElementById(`${input.name}-error`); 
  errorBox.textContent = message;
  errorBox.hidden = message === '';          
  input.setAttribute('aria-invalid', String(message !== ''));  
  return message === '';                     
}
 
function showResult(text, type) {
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

  const fields = FIELD_NAMES.map((name) => contactForm.elements[name]); 
  const isValid = fields.map(validateField).every(Boolean); 

  if (!isValid) {
    contactForm.querySelector('[aria-invalid="true"]').focus();
    showResult('Исправьте ошибки в форме.', 'error');
    return;
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
  } catch (error) {
    console.error('Ошибка отправки:', error);
    showResult('Не удалось отправить сообщение. Сервер недоступен.', 'error');
  }
});
