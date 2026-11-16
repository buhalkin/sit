// ===== Курсы валют ЦБ РФ (внешний источник данных, ПР 2) =====
 
// Адрес внешнего API ---
// Адрес ежедневных курсов в формате JSON. Ключ не нужен.
const CBR_URL = 'https://www.cbr-xml-daily.ru/daily_json.js';
 
// Загрузка курсов по сети ---
// Загружает курсы и возвращает { USD: рублей за 1 доллар, EUR: рублей за 1 евро }.
// Функция асинхронная: fetch возвращает Promise, поэтому используем await.
async function fetchRates() {
  const response = await fetch(CBR_URL); // отправляем запрос и ждём ответ; сетевая ошибка бросит исключение сама
 
  // fetch НЕ выдаёт ошибку при коде 404 или 500 — статус проверяем сами
  if (!response.ok) {
    throw new Error(`ЦБ ответил кодом ${response.status}`); // ошибку поймает catch в catalog.js
  }
 
  const data = await response.json(); // превращаем тело ответа из текста JSON в объект JavaScript
 
  // У некоторых валют курс дан за 10 или 100 единиц (Nominal), делим на номинал
  return {
    USD: data.Valute.USD.Value / data.Valute.USD.Nominal, // рублей за один доллар
    EUR: data.Valute.EUR.Value / data.Valute.EUR.Nominal, // рублей за один евро
  };
}
 
// Пересчёт рублей в другую валюту ---
// Переводит сумму в рублях в другую валюту и округляет до сотых
function convertRubles(rubles, ratePerUnit) {
  return (rubles / ratePerUnit).toFixed(2); // toFixed возвращает строку вида "27.35"
}
