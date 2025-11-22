/**
 * Вспомогательные функции для расчетов и форматирования
 */

/**
 * Форматирование даты и времени
 */
function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return new Intl.DateTimeFormat('ru-RU', options).format(date);
}

/**
 * Форматирование градусов в формат градусы°минуты'секунды"
 */
function formatDegrees(decimal) {
    const degrees = Math.floor(decimal);
    const minutesDecimal = (decimal - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = Math.floor((minutesDecimal - minutes) * 60);
    
    return `${degrees}° ${minutes}' ${seconds}"`;
}

/**
 * Форматирование координат
 */
function formatCoordinate(value, isLatitude) {
    const direction = isLatitude 
        ? (value >= 0 ? 'N' : 'S')
        : (value >= 0 ? 'E' : 'W');
    
    const absValue = Math.abs(value);
    const degrees = Math.floor(absValue);
    const minutes = (absValue - degrees) * 60;
    
    return `${degrees}° ${minutes.toFixed(2)}' ${direction}`;
}

/**
 * Расчет разницы между датами
 */
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Получение названия планеты на санскрите
 */
function getPlanetSanskritName(planetKey) {
    const sanskritNames = {
        'Sun': 'Сурья',
        'Moon': 'Чандра',
        'Mercury': 'Буддха',
        'Venus': 'Шукра',
        'Mars': 'Мангала',
        'Jupiter': 'Гуру',
        'Saturn': 'Шани',
        'Rahu': 'Раху',
        'Ketu': 'Кету',
        'Ascendant': 'Лагна'
    };
    
    return sanskritNames[planetKey] || planetKey;
}

/**
 * Получение символа планеты
 */
function getPlanetSymbol(planetKey) {
    const symbols = {
        'Sun': '☉',
        'Moon': '☽',
        'Mercury': '☿',
        'Venus': '♀',
        'Mars': '♂',
        'Jupiter': '♃',
        'Saturn': '♄',
        'Rahu': '☊',
        'Ketu': '☋',
        'Ascendant': '↗'
    };
    
    return symbols[planetKey] || '';
}

/**
 * Определение силы планеты (бала)
 */
function getPlanetStrength(planet, chartData) {
    let strength = [];
    
    // Экзальтация
    const exaltations = {
        'Sun': 0,      // Овен
        'Moon': 1,     // Телец
        'Mars': 9,     // Козерог
        'Mercury': 5,  // Дева
        'Jupiter': 3,  // Рак
        'Venus': 11,   // Рыбы
        'Saturn': 6    // Весы
    };
    
    // Дебилитация (напротив экзальтации)
    const debilitations = {
        'Sun': 6,      // Весы
        'Moon': 7,     // Скорпион
        'Mars': 3,     // Рак
        'Mercury': 11, // Рыбы
        'Jupiter': 9,  // Козерог
        'Venus': 5,    // Дева
        'Saturn': 0    // Овен
    };
    
    // Собственные знаки
    const ownSigns = {
        'Sun': [4],         // Лев
        'Moon': [3],        // Рак
        'Mars': [0, 7],     // Овен, Скорпион
        'Mercury': [2, 5],  // Близнецы, Дева
        'Jupiter': [8, 11], // Стрелец, Рыбы
        'Venus': [1, 6],    // Телец, Весы
        'Saturn': [9, 10]   // Козерог, Водолей
    };
    
    const signIndex = planet.sign.index;
    const planetKey = Object.keys(chartData.planets).find(key => chartData.planets[key] === planet);
    
    // Проверяем экзальтацию
    if (exaltations[planetKey] === signIndex) {
        strength.push('В экзальтации (очень сильная)');
    }
    // Проверяем дебилитацию
    else if (debilitations[planetKey] === signIndex) {
        strength.push('В дебилитации (ослабленная)');
    }
    // Проверяем собственный знак
    else if (ownSigns[planetKey] && ownSigns[planetKey].includes(signIndex)) {
        strength.push('В своём знаке (сильная)');
    }
    else {
        strength.push('Нейтральное положение');
    }
    
    // Проверяем положение в домах
    const house = planet.house.index;
    if ([1, 4, 7, 10].includes(house)) {
        strength.push('В кендре (угловой дом - сила)');
    } else if ([5, 9].includes(house)) {
        strength.push('В триконе (благоприятный дом)');
    } else if ([3, 6, 11].includes(house)) {
        strength.push('В упачае (растущий дом)');
    } else if ([6, 8, 12].includes(house)) {
        strength.push('В дустхане (сложный дом)');
    }
    
    return strength.join(', ');
}

/**
 * Создание HTML для планетарных позиций
 */
function createPlanetaryPositionsHTML(chartData) {
    let html = '';
    
    const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    
    planetOrder.forEach(key => {
        const planet = chartData.planets[key];
        if (!planet) return;
        
        const symbol = getPlanetSymbol(key);
        const sanskritName = getPlanetSanskritName(key);
        const signName = planet.sign.name;
        const degree = planet.sign.degree.toFixed(2);
        const house = planet.house.name;
        const strength = getPlanetStrength(planet, chartData);
        
        html += `
            <div class="planet-item">
                <div class="planet-name">${symbol} ${sanskritName}</div>
                <div class="planet-position">
                    <div class="planet-sign">${signName} - ${degree}°</div>
                    <div class="planet-degree">${strength}</div>
                </div>
                <div class="planet-house">${house}</div>
            </div>
        `;
    });
    
    return html;
}

/**
 * Создание HTML для интерпретаций
 */
function createInterpretationsHTML(interpretations) {
    let html = '';
    
    // Заголовок о системе
    html += `
        <div class="interp-notice">
            <p><strong>📌 Система расчета:</strong> Сидерический зодиак (ведическая астрология) • Аянамша: Сурья Сиддханта (Lahiri)</p>
        </div>
    `;
    
    // 1. АСЦЕНДЕНТ (ЛАГНА) - САМОЕ ВАЖНОЕ
    const asc = interpretations.ascendant;
    html += `
        <div class="interp-section interp-primary">
            <h4>🔹 ${asc.title}</h4>
            <div class="interp-content">
                <p class="interp-intro"><strong>Лагна (асцендент)</strong> - восходящий знак в момент рождения. Это самая важная точка карты, определяющая вашу личность, внешность, здоровье и общий подход к жизни.</p>
                <p><strong>Описание:</strong> ${asc.description}</p>
                
                <div class="plusy-minusy">
                    <div class="plusy">
                        <h5>✅ Плюсы:</h5>
                        <ul>
                            ${asc.plusy.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="minusy">
                        <h5>⚠️ Минусы и вызовы:</h5>
                        <ul>
                            ${asc.minusy.map(m => `<li>${m}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="garmonizaciya">
                    <h5>🔮 Гармонизация:</h5>
                    <ul>
                        ${asc.garmonizaciya.map(g => `<li>${g}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // 2-10. ВСЕ 9 ПЛАНЕТ
    const planetSymbols = {
        'Sun': '☉',
        'Moon': '☽',
        'Mars': '♂',
        'Mercury': '☿',
        'Jupiter': '♃',
        'Venus': '♀',
        'Saturn': '♄',
        'Rahu': '☊',
        'Ketu': '☋'
    };
    
    const planetNames = {
        'Sun': 'Солнце (Сурья) - Душа',
        'Moon': 'Луна (Чандра) - Ум',
        'Mars': 'Марс (Мангала) - Энергия',
        'Mercury': 'Меркурий (Буддха) - Интеллект',
        'Jupiter': 'Юпитер (Гуру) - Мудрость',
        'Venus': 'Венера (Шукра) - Любовь',
        'Saturn': 'Сатурн (Шани) - Карма',
        'Rahu': 'Раху - Северный узел',
        'Ketu': 'Кету - Южный узел'
    };
    
    for (const [key, planet] of Object.entries(interpretations.planets)) {
        const symbol = planetSymbols[key];
        const name = planetNames[key];
        
        html += `
            <div class="interp-section planet-section">
                <h4>${symbol} ${name}</h4>
                <div class="interp-content">
                    <div class="planet-info">
                        <p><strong>Положение:</strong> ${planet.sign} (${planet.degree}) в ${planet.house}</p>
                        <p><strong>Сила планеты:</strong> ${planet.strength}</p>
                    </div>
                    
                    <div class="house-interpretation">
                        <p class="interp-intro">${planet.houseInterp}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ЙОГИ
    html += `
        <div class="interp-section">
            <h4>🌟 Планетарные йоги и особые комбинации</h4>
            <div class="interp-content">
                <p class="interp-intro">Йоги - особые комбинации планет, дающие определенные результаты в жизни.</p>
    `;
    
    interpretations.yogas.forEach(yoga => {
        html += `
                <div class="yoga-item">
                    <h5>${yoga.name}</h5>
                    <p>${yoga.description}</p>
                </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Валидация данных формы
 */
function validateBirthData(date, time, latitude, longitude, timezone) {
    const errors = [];
    
    if (!date) {
        errors.push('Укажите дату рождения');
    }
    
    if (!time) {
        errors.push('Укажите время рождения');
    }
    
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        errors.push('Укажите корректную широту (-90 до 90). Сначала выберите страну и город.');
    }
    
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        errors.push('Укажите корректную долготу (-180 до 180). Сначала выберите страну и город.');
    }
    
    if (isNaN(timezone) || timezone < -12 || timezone > 14) {
        errors.push('Укажите корректный часовой пояс (-12 до +14). Сначала выберите страну и город.');
    }
    
    return errors;
}

/**
 * Получение текущей геолокации пользователя
 */
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Геолокация не поддерживается вашим браузером'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            error => {
                reject(error);
            }
        );
    });
}

