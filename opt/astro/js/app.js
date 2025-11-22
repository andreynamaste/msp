/**
 * Главный модуль приложения
 * Управление UI и интеграция всех модулей
 */

// Глобальные переменные
let currentChart = null;
let northChart = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Инициализация приложения
 */
function initializeApp() {
    // Инициализируем обработчики событий
    setupEventListeners();
    
    // Создаем экземпляр карты
    northChart = new NorthIndianChart('northChart');
    
    // Заполняем список стран
    populateCountries();
    
    // Заполняем список часовых поясов
    populateTimezones();
    
    // Устанавливаем текущую дату по умолчанию
    const today = new Date();
    const dateInput = document.getElementById('birthDate');
    const timeInput = document.getElementById('birthTime');
    
    dateInput.value = today.toISOString().split('T')[0];
    timeInput.value = '12:00';
    
    console.log('Приложение инициализировано');
}

/**
 * Заполнение списка стран
 */
function populateCountries() {
    const countrySelect = document.getElementById('countrySelect');
    
    // Получаем уникальный список стран
    const countries = [...new Set(CITIES_DATABASE.map(city => city.country))].sort();
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

/**
 * Заполнение списка городов для выбранной страны
 */
function populateCities(country) {
    const citySelect = document.getElementById('citySelect');
    citySelect.innerHTML = '<option value="">-- Выберите город --</option>';
    
    if (!country) {
        citySelect.disabled = true;
        return;
    }
    
    // Фильтруем города по стране
    const cities = CITIES_DATABASE.filter(city => city.country === country).sort((a, b) => 
        a.name.localeCompare(b.name, 'ru')
    );
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = JSON.stringify(city);
        option.textContent = city.name;
        citySelect.appendChild(option);
    });
    
    citySelect.disabled = false;
}

/**
 * Заполнение списка часовых поясов
 */
function populateTimezones() {
    const timezoneSelect = document.getElementById('timezoneSelect');
    
    // Создаем список часовых поясов от -12 до +14
    for (let tz = -12; tz <= 14; tz += 0.5) {
        const option = document.createElement('option');
        const sign = tz >= 0 ? '+' : '';
        option.value = tz;
        option.textContent = `UTC ${sign}${tz.toFixed(1)}`;
        timezoneSelect.appendChild(option);
    }
}

/**
 * Автоматическая установка часового пояса
 */
function autoSetTimezone(tz) {
    console.log('autoSetTimezone вызвана с tz =', tz);
    
    const timezoneSelect = document.getElementById('timezoneSelect');
    const timezoneInput = document.getElementById('timezone');
    const manualCheckbox = document.getElementById('manualTimezone');
    
    console.log('Manual checkbox checked:', manualCheckbox.checked);
    
    if (!manualCheckbox.checked) {
        // Автоматически ставим часовой пояс
        timezoneSelect.value = tz;
        timezoneInput.value = tz;
        
        console.log('Часовой пояс установлен:', tz);
        console.log('timezoneSelect.value:', timezoneSelect.value);
        console.log('timezoneInput.value:', timezoneInput.value);
    } else {
        console.log('Ручной ввод активен, автоматическая установка пропущена');
    }
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners() {
    // Форма рождения
    const form = document.getElementById('birthDataForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Кнопка сброса
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', handleReset);
    
    // Кнопка "Назад"
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', handleBack);
    
    // Выбор страны
    const countrySelect = document.getElementById('countrySelect');
    countrySelect.addEventListener('change', function() {
        const country = this.value;
        populateCities(country);
        
        // Сбрасываем координаты и часовой пояс
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        document.getElementById('timezoneSelect').value = '';
        document.getElementById('timezone').value = '';
    });
    
    // Выбор города
    const citySelect = document.getElementById('citySelect');
    citySelect.addEventListener('change', function() {
        if (!this.value) return;
        
        const city = JSON.parse(this.value);
        
        // Заполняем координаты
        document.getElementById('latitude').value = city.lat.toFixed(4);
        document.getElementById('longitude').value = city.lon.toFixed(4);
        
        // Автоматически определяем часовой пояс
        autoSetTimezone(city.tz);
    });
    
    // Ручной ввод часового пояса
    const manualTimezoneCheckbox = document.getElementById('manualTimezone');
    const timezoneSelect = document.getElementById('timezoneSelect');
    const timezoneInput = document.getElementById('timezone');
    
    manualTimezoneCheckbox.addEventListener('change', function() {
        if (this.checked) {
            timezoneSelect.style.display = 'none';
            timezoneInput.style.display = 'block';
            timezoneInput.value = timezoneSelect.value || '';
            timezoneInput.focus();
        } else {
            timezoneSelect.style.display = 'block';
            timezoneInput.style.display = 'none';
            timezoneSelect.value = timezoneInput.value || '';
        }
    });
    
    // Синхронизация select и input для часового пояса
    timezoneSelect.addEventListener('change', function() {
        timezoneInput.value = this.value;
    });
}

/**
 * Обработка отправки формы
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        console.log('=== НАЧАЛО РАСЧЕТА КАРТЫ ===');
        
        // Получаем данные из формы
        const dateStr = document.getElementById('birthDate').value;
        const timeStr = document.getElementById('birthTime').value;
        const latitude = parseFloat(document.getElementById('latitude').value);
        const longitude = parseFloat(document.getElementById('longitude').value);
        
        console.log('Дата:', dateStr);
        console.log('Время:', timeStr);
        console.log('Широта:', latitude);
        console.log('Долгота:', longitude);
        
        // Получаем часовой пояс
        const manualTimezone = document.getElementById('manualTimezone').checked;
        const timezone = manualTimezone 
            ? parseFloat(document.getElementById('timezone').value)
            : parseFloat(document.getElementById('timezoneSelect').value);
        
        console.log('Часовой пояс:', timezone);
        console.log('Ручной ввод:', manualTimezone);
        
        // Валидация
        const errors = validateBirthData(dateStr, timeStr, latitude, longitude, timezone);
        if (errors.length > 0) {
            console.error('Ошибки валидации:', errors);
            alert('Ошибка валидации:\n' + errors.join('\n'));
            return;
        }
        
        // Создаем объект Date
        const birthDate = new Date(`${dateStr}T${timeStr}`);
        console.log('Объект Date создан:', birthDate);
        
        // Показываем индикатор загрузки
        showLoading();
        
        // Рассчитываем натальную карту
        console.log('Вызываем calculateNatalChart...');
        currentChart = await calculateNatalChart(birthDate, latitude, longitude, timezone);
        console.log('Карта рассчитана успешно:', currentChart);
        
        console.log('Натальная карта рассчитана:', currentChart);
        
        // Отображаем результаты
        const country = document.getElementById('countrySelect').value;
        const citySelect = document.getElementById('citySelect');
        const cityName = citySelect.options[citySelect.selectedIndex].text;
        
        displayResults(birthDate, latitude, longitude, timezone, country, cityName);
        
        // Скрываем индикатор загрузки
        hideLoading();
        
    } catch (error) {
        console.error('=== ОШИБКА ПРИ РАСЧЕТЕ КАРТЫ ===');
        console.error('Тип ошибки:', error.name);
        console.error('Сообщение:', error.message);
        console.error('Стек:', error.stack);
        
        alert('Произошла ошибка при расчете карты:\n\n' + error.message + '\n\nПожалуйста, проверьте введенные данные и откройте консоль браузера (F12) для деталей.');
        hideLoading();
    }
}

/**
 * Отображение результатов
 */
function displayResults(birthDate, latitude, longitude, timezone, country, cityName) {
    // Скрываем форму ввода
    document.getElementById('inputSection').style.display = 'none';
    
    // Показываем результаты
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    // Заполняем заголовок
    const dateStr = formatDateTime(birthDate);
    const age = calculateAge(birthDate);
    
    document.getElementById('resultTitle').textContent = 'Натальная карта';
    document.getElementById('resultDetails').innerHTML = `
        <strong>Дата рождения:</strong> ${dateStr} • 
        <strong>Место:</strong> ${cityName}, ${country} (${formatCoordinate(latitude, true)}, ${formatCoordinate(longitude, false)}) • 
        <strong>Возраст:</strong> ${age} лет • 
        <strong>Аянамша:</strong> ${currentChart.ayanamshaType} (${currentChart.ayanamsha.toFixed(2)}°)
    `;
    
    // Рисуем карту
    northChart.draw(currentChart);
    
    // Отображаем позиции планет
    const planetaryPositionsDiv = document.getElementById('planetaryPositions');
    planetaryPositionsDiv.innerHTML = createPlanetaryPositionsHTML(currentChart);
    
    // Генерируем и отображаем интерпретации
    const interpretations = generateInterpretations(currentChart);
    const interpretationsDiv = document.getElementById('interpretations');
    interpretationsDiv.innerHTML = createInterpretationsHTML(interpretations);
    
    // Прокручиваем к результатам
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Обработка кнопки "Назад"
 */
function handleBack() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('inputSection').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Обработка кнопки "Сброс"
 */
function handleReset() {
    const form = document.getElementById('birthDataForm');
    form.reset();
    
    // Сбрасываем дополнительные поля
    document.getElementById('countrySelect').value = '';
    document.getElementById('citySelect').innerHTML = '<option value="">-- Сначала выберите страну --</option>';
    document.getElementById('citySelect').disabled = true;
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('timezoneSelect').value = '';
    document.getElementById('timezone').value = '';
    
    // Снимаем чекбокс ручного ввода
    const manualTimezoneCheckbox = document.getElementById('manualTimezone');
    manualTimezoneCheckbox.checked = false;
    document.getElementById('timezoneSelect').style.display = 'block';
    document.getElementById('timezone').style.display = 'none';
    
    // Устанавливаем текущую дату
    const today = new Date();
    document.getElementById('birthDate').value = today.toISOString().split('T')[0];
    document.getElementById('birthTime').value = '12:00';
}

/**
 * Показ индикатора загрузки
 */
function showLoading() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg class="btn-icon loading" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke-width="2"/>
        </svg>
        Расчет карты...
    `;
}

/**
 * Скрытие индикатора загрузки
 */
function hideLoading() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke-width="2"/>
        </svg>
        Построить карту
    `;
}

/**
 * Обработка ошибок
 */
window.addEventListener('error', function(e) {
    console.error('Глобальная ошибка:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Необработанное отклонение Promise:', e.reason);
});

// Экспорт для использования в консоли (отладка)
window.astroApp = {
    currentChart,
    northChart,
    calculateNatalChart,
    CITIES_DATABASE
};

console.log('%cВедическая Астрология - Приложение загружено', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('Для отладки используйте: window.astroApp');
