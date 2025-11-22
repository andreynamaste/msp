/**
 * Упрощенная библиотека расчетов на основе Swiss Ephemeris
 * С поддержкой Сурья Сиддханта аянамши
 */

// Константы
const AYANAMSHA = {
    SURYA_SIDDHANTA: 'SURYA_SIDDHANTA'
};

const PLANETS = {
    SUN: 'Sun',
    MOON: 'Moon',
    MERCURY: 'Mercury',
    VENUS: 'Venus',
    MARS: 'Mars',
    JUPITER: 'Jupiter',
    SATURN: 'Saturn',
    RAHU: 'Rahu',
    KETU: 'Ketu',
    ASCENDANT: 'Ascendant'
};

const ZODIAC_SIGNS = [
    'Овен (Меша)',
    'Телец (Вришабха)',
    'Близнецы (Митхуна)',
    'Рак (Карка)',
    'Лев (Симха)',
    'Дева (Канья)',
    'Весы (Тула)',
    'Скорпион (Вришчика)',
    'Стрелец (Дхану)',
    'Козерог (Макара)',
    'Водолей (Кумбха)',
    'Рыбы (Мина)'
];

const ZODIAC_SIGNS_EN = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const HOUSES = [
    '1-й дом (Лагна)', '2-й дом (Дхана)', '3-й дом (Бхратру)', '4-й дом (Матру)',
    '5-й дом (Путра)', '6-й дом (Шатру)', '7-й дом (Калатра)', '8-й дом (Рандхра)',
    '9-й дом (Дхарма)', '10-й дом (Карма)', '11-й дом (Лабха)', '12-й дом (Вьяя)'
];

/**
 * Расчет Юлианской даты
 */
function getJulianDay(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    
    let y = year;
    let m = month;
    
    if (month <= 2) {
        y = year - 1;
        m = month + 12;
    }
    
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    
    const jd = Math.floor(365.25 * (y + 4716)) + 
               Math.floor(30.6001 * (m + 1)) + 
               day + hour / 24 + b - 1524.5;
    
    return jd;
}

/**
 * Расчет времени T (в юлианских столетиях от J2000.0)
 */
function getJulianCentury(jd) {
    return (jd - 2451545.0) / 36525.0;
}

/**
 * Нормализация угла к диапазону 0-360
 */
function normalizeAngle(angle) {
    angle = angle % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Расчет Сурья Сиддханта аянамши (Lahiri)
 * Используется традиционная формула ведической астрологии
 */
function calculateSuryaSiddhantaAyanamsha(jd) {
    // Базовая точка: 1 января 1900, 0:00 UT
    // JD для 1 января 1900 = 2415020.0
    const epoch_1900 = 2415020.0;
    
    // Аянамша на 1 января 1900 = 22° 27' 37.76" = 22.4604889°
    // (Это стандартное значение Lahiri/Chitrapaksha)
    const ayanamsha_1900 = 22.4604889;
    
    // Прецессия: 50.2388475" в год (стандартное значение)
    // В градусах: 50.2388475 / 3600 = 0.013955235417 градусов в год
    const precession_per_year = 50.2388475 / 3600;
    
    // Вычисляем количество лет от эпохи 1900
    const years_from_1900 = (jd - epoch_1900) / 365.25;
    
    // Вычисляем аянамшу
    const ayanamsha = ayanamsha_1900 + (precession_per_year * years_from_1900);
    
    return ayanamsha;
}

/**
 * Расчет средней долготы Солнца
 */
function getSunMeanLongitude(T) {
    return normalizeAngle(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
}

/**
 * Расчет средней аномалии Солнца
 */
function getSunMeanAnomaly(T) {
    return normalizeAngle(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
}

/**
 * Расчет эксцентриситета орбиты Земли
 */
function getEarthEccentricity(T) {
    return 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
}

/**
 * Расчет истинной долготы Солнца
 */
function getSunTrueLongitude(jd) {
    const T = getJulianCentury(jd);
    const L0 = getSunMeanLongitude(T);
    const M = getSunMeanAnomaly(T) * Math.PI / 180;
    const e = getEarthEccentricity(T);
    
    // Уравнение центра
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
              0.000289 * Math.sin(3 * M);
    
    const trueLon = L0 + C;
    return normalizeAngle(trueLon);
}

/**
 * Расчет средней долготы Луны
 */
function getMoonMeanLongitude(T) {
    return normalizeAngle(218.3164477 + 481267.88123421 * T - 
                         0.0015786 * T * T + T * T * T / 538841.0 - 
                         T * T * T * T / 65194000.0);
}

/**
 * Расчет средней элонгации Луны
 */
function getMoonMeanElongation(T) {
    return normalizeAngle(297.8501921 + 445267.1114034 * T - 
                         0.0018819 * T * T + T * T * T / 545868.0 - 
                         T * T * T * T / 113065000.0);
}

/**
 * Расчет средней аномалии Луны
 */
function getMoonMeanAnomaly(T) {
    return normalizeAngle(134.9633964 + 477198.8675055 * T + 
                         0.0087414 * T * T + T * T * T / 69699.0 - 
                         T * T * T * T / 14712000.0);
}

/**
 * Расчет аргумента широты Луны
 */
function getMoonArgumentOfLatitude(T) {
    return normalizeAngle(93.2720950 + 483202.0175233 * T - 
                         0.0036539 * T * T - T * T * T / 3526000.0 + 
                         T * T * T * T / 863310000.0);
}

/**
 * Расчет истинной долготы Луны (упрощенная формула)
 */
function getMoonTrueLongitude(jd) {
    const T = getJulianCentury(jd);
    const L = getMoonMeanLongitude(T);
    const M = getMoonMeanAnomaly(T) * Math.PI / 180;
    const F = getMoonArgumentOfLatitude(T) * Math.PI / 180;
    
    // Упрощенные главные периодические члены
    const correction = 6.288774 * Math.sin(M) +
                      1.274027 * Math.sin(2 * (L * Math.PI / 180) - M) +
                      0.658314 * Math.sin(2 * (L * Math.PI / 180)) +
                      0.213618 * Math.sin(2 * M) -
                      0.185116 * Math.sin(getSunMeanAnomaly(T) * Math.PI / 180) -
                      0.114332 * Math.sin(2 * F);
    
    return normalizeAngle(L + correction);
}

/**
 * Упрощенный расчет позиций планет (используем средние элементы орбит)
 */
function getPlanetPosition(planet, jd) {
    const T = getJulianCentury(jd);
    
    // Средние элементы орбит планет для эпохи J2000.0
    const orbitalElements = {
        Mercury: { L0: 252.25032350, dL: 149472.67411175, a: 0.38709927, e: 0.20563593, i: 7.00497902 },
        Venus:   { L0: 181.97909950, dL: 58517.81538729, a: 0.72333566, e: 0.00677672, i: 3.39467605 },
        Mars:    { L0: 355.43299958, dL: 19140.30268499, a: 1.52371034, e: 0.09339410, i: 1.84969142 },
        Jupiter: { L0: 34.39644051, dL: 3034.74612775, a: 5.20288700, e: 0.04838624, i: 1.30439695 },
        Saturn:  { L0: 49.95424423, dL: 1222.49362201, a: 9.53667594, e: 0.05386179, i: 2.48599187 }
    };
    
    if (!orbitalElements[planet]) {
        console.error('Unknown planet:', planet);
        return 0;
    }
    
    const elem = orbitalElements[planet];
    const L = elem.L0 + elem.dL * T;
    
    return normalizeAngle(L);
}

/**
 * Расчет позиций Раху и Кету (лунные узлы)
 */
function getRahuKetuPosition(jd) {
    const T = getJulianCentury(jd);
    
    // Средняя долгота восходящего узла Луны
    const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000.0;
    
    const rahu = normalizeAngle(omega);
    const ketu = normalizeAngle(rahu + 180);
    
    return { rahu, ketu };
}

/**
 * Расчет асцендента (Лагны)
 */
function calculateAscendant(jd, latitude, longitude) {
    const T = getJulianCentury(jd);
    
    // Вычисляем местное звездное время (LST)
    const ut = (jd - Math.floor(jd) - 0.5) * 24; // UT в часах
    const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                0.000387933 * T * T - T * T * T / 38710000.0;
    const lst = normalizeAngle(gmst + longitude);
    
    // Угол наклона эклиптики
    const epsilon = 23.439291 - 0.0130042 * T;
    const epsilonRad = epsilon * Math.PI / 180;
    
    // RAMC (Right Ascension of Medium Coeli)
    const ramc = lst;
    const ramcRad = ramc * Math.PI / 180;
    
    // Вычисляем асцендент
    const latRad = latitude * Math.PI / 180;
    const y = Math.sin(ramcRad);
    const x = Math.cos(ramcRad) * Math.cos(epsilonRad) + 
              Math.tan(latRad) * Math.sin(epsilonRad);
    
    let ascendant = Math.atan2(y, x) * 180 / Math.PI;
    ascendant = normalizeAngle(ascendant);
    
    return ascendant;
}

/**
 * Преобразование тропической долготы в сидерическую
 */
function tropicalToSidereal(tropicalLon, jd) {
    const ayanamsha = calculateSuryaSiddhantaAyanamsha(jd);
    let sidereal = tropicalLon - ayanamsha;
    
    // Нормализуем в диапазон 0-360
    while (sidereal < 0) sidereal += 360;
    while (sidereal >= 360) sidereal -= 360;
    
    return sidereal;
}

/**
 * Получение знака зодиака по долготе
 */
function getZodiacSign(longitude) {
    const signIndex = Math.floor(longitude / 30);
    return {
        index: signIndex,
        name: ZODIAC_SIGNS[signIndex],
        nameEn: ZODIAC_SIGNS_EN[signIndex],
        degree: longitude % 30
    };
}

/**
 * Получение дома по долготе относительно асцендента
 */
function getHouse(planetLon, ascendant) {
    let diff = planetLon - ascendant;
    if (diff < 0) diff += 360;
    
    const houseIndex = Math.floor(diff / 30);
    return {
        index: houseIndex + 1,
        name: HOUSES[houseIndex]
    };
}

/**
 * Главная функция: расчет натальной карты
 */
async function calculateNatalChart(birthDate, latitude, longitude, timezone) {
    try {
        // birthDate приходит как локальное время браузера
        // Нужно пересчитать его с учетом часового пояса места рождения
        
        // Получаем компоненты даты
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth(); // 0-11
        const day = birthDate.getDate();
        const hours = birthDate.getHours();
        const minutes = birthDate.getMinutes();
        const seconds = birthDate.getSeconds();
        
        // Создаем UTC дату: локальное время минус часовой пояс
        // Если timezone = +3, то UTC = местное время - 3 часа
        const utcDate = new Date(Date.UTC(
            year, month, day, hours, minutes, seconds
        ));
        
        // Корректируем на часовой пояс
        utcDate.setTime(utcDate.getTime() - timezone * 60 * 60 * 1000);
        
        // Получаем юлианский день
        const jd = getJulianDay(utcDate);
        
        // Рассчитываем асцендент (тропический)
        const tropicalAscendant = calculateAscendant(jd, latitude, longitude);
        
        // Получаем аянамшу
        const ayanamsha = calculateSuryaSiddhantaAyanamsha(jd);
        
        // Преобразуем в сидерический
        const siderealAscendant = tropicalToSidereal(tropicalAscendant, jd);
        
        // Отладочная информация
        console.log('=== РАСЧЕТ АСЦЕНДЕНТА ===');
        console.log('JD:', jd);
        console.log('Дата UTC:', utcDate);
        console.log('Координаты:', latitude, longitude);
        console.log('Аянамша (Сурья Сиддханта):', ayanamsha.toFixed(4) + '°');
        console.log('Тропический асцендент:', tropicalAscendant.toFixed(4) + '°');
        console.log('Сидерический асцендент:', siderealAscendant.toFixed(4) + '°');
        console.log('Знак асцендента:', Math.floor(siderealAscendant / 30), ZODIAC_SIGNS[Math.floor(siderealAscendant / 30)]);
        
        // Рассчитываем позиции планет (тропические)
        const tropicalSun = getSunTrueLongitude(jd);
        const tropicalMoon = getMoonTrueLongitude(jd);
        const tropicalMercury = getPlanetPosition('Mercury', jd);
        const tropicalVenus = getPlanetPosition('Venus', jd);
        const tropicalMars = getPlanetPosition('Mars', jd);
        const tropicalJupiter = getPlanetPosition('Jupiter', jd);
        const tropicalSaturn = getPlanetPosition('Saturn', jd);
        
        // Преобразуем все в сидерические
        const planets = {
            [PLANETS.ASCENDANT]: {
                name: 'Лагна (Асцендент)',
                tropicalLon: tropicalAscendant,
                siderealLon: siderealAscendant,
                sign: getZodiacSign(siderealAscendant),
                house: { index: 1, name: '1-й дом (Лагна)' }
            },
            [PLANETS.SUN]: {
                name: 'Сурья (Солнце)',
                tropicalLon: tropicalSun,
                siderealLon: tropicalToSidereal(tropicalSun, jd),
                sign: null,
                house: null
            },
            [PLANETS.MOON]: {
                name: 'Чандра (Луна)',
                tropicalLon: tropicalMoon,
                siderealLon: tropicalToSidereal(tropicalMoon, jd),
                sign: null,
                house: null
            },
            [PLANETS.MERCURY]: {
                name: 'Буддха (Меркурий)',
                tropicalLon: tropicalMercury,
                siderealLon: tropicalToSidereal(tropicalMercury, jd),
                sign: null,
                house: null
            },
            [PLANETS.VENUS]: {
                name: 'Шукра (Венера)',
                tropicalLon: tropicalVenus,
                siderealLon: tropicalToSidereal(tropicalVenus, jd),
                sign: null,
                house: null
            },
            [PLANETS.MARS]: {
                name: 'Мангала (Марс)',
                tropicalLon: tropicalMars,
                siderealLon: tropicalToSidereal(tropicalMars, jd),
                sign: null,
                house: null
            },
            [PLANETS.JUPITER]: {
                name: 'Гуру (Юпитер)',
                tropicalLon: tropicalJupiter,
                siderealLon: tropicalToSidereal(tropicalJupiter, jd),
                sign: null,
                house: null
            },
            [PLANETS.SATURN]: {
                name: 'Шани (Сатурн)',
                tropicalLon: tropicalSaturn,
                siderealLon: tropicalToSidereal(tropicalSaturn, jd),
                sign: null,
                house: null
            }
        };
        
        // Рассчитываем Раху и Кету
        const nodes = getRahuKetuPosition(jd);
        const siderealRahu = tropicalToSidereal(nodes.rahu, jd);
        const siderealKetu = tropicalToSidereal(nodes.ketu, jd);
        
        planets[PLANETS.RAHU] = {
            name: 'Раху (Северный узел)',
            tropicalLon: nodes.rahu,
            siderealLon: siderealRahu,
            sign: null,
            house: null
        };
        
        planets[PLANETS.KETU] = {
            name: 'Кету (Южный узел)',
            tropicalLon: nodes.ketu,
            siderealLon: siderealKetu,
            sign: null,
            house: null
        };
        
        // Добавляем знаки и дома для всех планет
        for (const key in planets) {
            if (key !== PLANETS.ASCENDANT) {
                const planet = planets[key];
                planet.sign = getZodiacSign(planet.siderealLon);
                planet.house = getHouse(planet.siderealLon, siderealAscendant);
            }
        }
        
        // Вычисляем аянамшу
        const ayanamsha = calculateSuryaSiddhantaAyanamsha(jd);
        
        return {
            jd,
            ayanamsha,
            ayanamshaType: 'Сурья Сиддханта',
            planets,
            birthDate: utcDate,
            latitude,
            longitude,
            timezone
        };
        
    } catch (error) {
        console.error('Error calculating natal chart:', error);
        throw error;
    }
}

