// База данных городов мира с координатами и часовыми поясами
const CITIES_DATABASE = [
    // Россия
    { name: "Москва", country: "Россия", lat: 55.7558, lon: 37.6173, tz: 3 },
    { name: "Санкт-Петербург", country: "Россия", lat: 59.9343, lon: 30.3351, tz: 3 },
    { name: "Новосибирск", country: "Россия", lat: 55.0084, lon: 82.9357, tz: 7 },
    { name: "Екатеринбург", country: "Россия", lat: 56.8389, lon: 60.6057, tz: 5 },
    { name: "Нижний Новгород", country: "Россия", lat: 56.2965, lon: 43.9361, tz: 3 },
    { name: "Казань", country: "Россия", lat: 55.8304, lon: 49.0661, tz: 3 },
    { name: "Челябинск", country: "Россия", lat: 55.1644, lon: 61.4368, tz: 5 },
    { name: "Омск", country: "Россия", lat: 54.9885, lon: 73.3242, tz: 6 },
    { name: "Самара", country: "Россия", lat: 53.2001, lon: 50.15, tz: 4 },
    { name: "Ростов-на-Дону", country: "Россия", lat: 47.2357, lon: 39.7015, tz: 3 },
    { name: "Уфа", country: "Россия", lat: 54.7388, lon: 55.9721, tz: 5 },
    { name: "Красноярск", country: "Россия", lat: 56.0153, lon: 92.8932, tz: 7 },
    { name: "Пермь", country: "Россия", lat: 58.0105, lon: 56.2502, tz: 5 },
    { name: "Воронеж", country: "Россия", lat: 51.6720, lon: 39.1843, tz: 3 },
    { name: "Волгоград", country: "Россия", lat: 48.7080, lon: 44.5133, tz: 3 },
    { name: "Краснодар", country: "Россия", lat: 45.0328, lon: 38.9769, tz: 3 },
    { name: "Саратов", country: "Россия", lat: 51.5924, lon: 46.0348, tz: 4 },
    { name: "Тюмень", country: "Россия", lat: 57.1534, lon: 65.5343, tz: 5 },
    { name: "Тольятти", country: "Россия", lat: 53.5303, lon: 49.3461, tz: 4 },
    { name: "Ижевск", country: "Россия", lat: 56.8498, lon: 53.2045, tz: 4 },
    { name: "Барнаул", country: "Россия", lat: 53.3480, lon: 83.7798, tz: 7 },
    { name: "Иркутск", country: "Россия", lat: 52.2869, lon: 104.3050, tz: 8 },
    { name: "Хабаровск", country: "Россия", lat: 48.4827, lon: 135.0838, tz: 10 },
    { name: "Владивосток", country: "Россия", lat: 43.1155, lon: 131.8855, tz: 10 },
    { name: "Ярославль", country: "Россия", lat: 57.6261, lon: 39.8845, tz: 3 },
    { name: "Владикавказ", country: "Россия", lat: 43.0307, lon: 44.6821, tz: 3 },
    { name: "Махачкала", country: "Россия", lat: 42.9849, lon: 47.5047, tz: 3 },
    { name: "Томск", country: "Россия", lat: 56.4977, lon: 84.9744, tz: 7 },
    { name: "Оренбург", country: "Россия", lat: 51.7727, lon: 55.0988, tz: 5 },
    { name: "Кемерово", country: "Россия", lat: 55.3333, lon: 86.0833, tz: 7 },
    { name: "Новокузнецк", country: "Россия", lat: 53.7596, lon: 87.1216, tz: 7 },
    { name: "Рязань", country: "Россия", lat: 54.6269, lon: 39.6916, tz: 3 },
    { name: "Астрахань", country: "Россия", lat: 46.3497, lon: 48.0408, tz: 4 },
    { name: "Пенза", country: "Россия", lat: 53.2007, lon: 45.0046, tz: 3 },
    { name: "Липецк", country: "Россия", lat: 52.6031, lon: 39.5708, tz: 3 },
    { name: "Киров", country: "Россия", lat: 58.6035, lon: 49.6679, tz: 3 },
    { name: "Чебоксары", country: "Россия", lat: 56.1439, lon: 47.2489, tz: 3 },
    { name: "Калининград", country: "Россия", lat: 54.7104, lon: 20.4522, tz: 2 },
    { name: "Тула", country: "Россия", lat: 54.1932, lon: 37.6173, tz: 3 },
    { name: "Сочи", country: "Россия", lat: 43.6028, lon: 39.7342, tz: 3 },
    
    // Индия
    { name: "Дели", country: "Индия", lat: 28.7041, lon: 77.1025, tz: 5.5 },
    { name: "Мумбаи", country: "Индия", lat: 19.0760, lon: 72.8777, tz: 5.5 },
    { name: "Калькутта", country: "Индия", lat: 22.5726, lon: 88.3639, tz: 5.5 },
    { name: "Ченнаи", country: "Индия", lat: 13.0827, lon: 80.2707, tz: 5.5 },
    { name: "Бангалор", country: "Индия", lat: 12.9716, lon: 77.5946, tz: 5.5 },
    { name: "Хайдарабад", country: "Индия", lat: 17.3850, lon: 78.4867, tz: 5.5 },
    { name: "Ахмадабад", country: "Индия", lat: 23.0225, lon: 72.5714, tz: 5.5 },
    { name: "Пуна", country: "Индия", lat: 18.5204, lon: 73.8567, tz: 5.5 },
    { name: "Сурат", country: "Индия", lat: 21.1702, lon: 72.8311, tz: 5.5 },
    { name: "Джайпур", country: "Индия", lat: 26.9124, lon: 75.7873, tz: 5.5 },
    { name: "Лакхнау", country: "Индия", lat: 26.8467, lon: 80.9462, tz: 5.5 },
    { name: "Канпур", country: "Индия", lat: 26.4499, lon: 80.3319, tz: 5.5 },
    { name: "Нагпур", country: "Индия", lat: 21.1458, lon: 79.0882, tz: 5.5 },
    { name: "Индор", country: "Индия", lat: 22.7196, lon: 75.8577, tz: 5.5 },
    { name: "Тхане", country: "Индия", lat: 19.2183, lon: 72.9781, tz: 5.5 },
    { name: "Бхопал", country: "Индия", lat: 23.2599, lon: 77.4126, tz: 5.5 },
    { name: "Патна", country: "Индия", lat: 25.5941, lon: 85.1376, tz: 5.5 },
    { name: "Варанаси", country: "Индия", lat: 25.3176, lon: 82.9739, tz: 5.5 },
    { name: "Агра", country: "Индия", lat: 27.1767, lon: 78.0081, tz: 5.5 },
    { name: "Мачилипатнам", country: "Индия", lat: 16.1877, lon: 81.1383, tz: 5.5 },
    { name: "Пондичерри", country: "Индия", lat: 11.9416, lon: 79.8083, tz: 5.5 },
    { name: "Путтапарти", country: "Индия", lat: 14.1656, lon: 77.8117, tz: 5.5 },
    
    // Украина
    { name: "Киев", country: "Украина", lat: 50.4501, lon: 30.5234, tz: 2 },
    { name: "Харьков", country: "Украина", lat: 49.9935, lon: 36.2304, tz: 2 },
    { name: "Одесса", country: "Украина", lat: 46.4825, lon: 30.7233, tz: 2 },
    { name: "Днепр", country: "Украина", lat: 48.4647, lon: 35.0462, tz: 2 },
    { name: "Львов", country: "Украина", lat: 49.8397, lon: 24.0297, tz: 2 },
    { name: "Донецк", country: "Украина", lat: 48.0159, lon: 37.8034, tz: 2 },
    { name: "Запорожье", country: "Украина", lat: 47.8388, lon: 35.1396, tz: 2 },
    { name: "Кривой Рог", country: "Украина", lat: 47.9088, lon: 33.3423, tz: 2 },
    { name: "Николаев", country: "Украина", lat: 46.9750, lon: 31.9946, tz: 2 },
    { name: "Мариуполь", country: "Украина", lat: 47.0971, lon: 37.5432, tz: 2 },
    { name: "Луганск", country: "Украина", lat: 48.5740, lon: 39.3078, tz: 2 },
    { name: "Винница", country: "Украина", lat: 49.2328, lon: 28.4810, tz: 2 },
    { name: "Симферополь", country: "Украина", lat: 44.9572, lon: 34.1108, tz: 2 },
    { name: "Херсон", country: "Украина", lat: 46.6354, lon: 32.6169, tz: 2 },
    { name: "Полтава", country: "Украина", lat: 49.5883, lon: 34.5514, tz: 2 },
    { name: "Чернигов", country: "Украина", lat: 51.4982, lon: 31.2893, tz: 2 },
    { name: "Черкассы", country: "Украина", lat: 49.4445, lon: 32.0598, tz: 2 },
    { name: "Житомир", country: "Украина", lat: 50.2547, lon: 28.6587, tz: 2 },
    { name: "Сумы", country: "Украина", lat: 50.9077, lon: 34.7981, tz: 2 },
    { name: "Хмельницкий", country: "Украина", lat: 49.4229, lon: 26.9871, tz: 2 },
    { name: "Черновцы", country: "Украина", lat: 48.2921, lon: 25.9358, tz: 2 },
    { name: "Ровно", country: "Украина", lat: 50.6199, lon: 26.2516, tz: 2 },
    { name: "Ивано-Франковск", country: "Украина", lat: 48.9226, lon: 24.7111, tz: 2 },
    { name: "Кропивницкий", country: "Украина", lat: 48.5132, lon: 32.2597, tz: 2 },
    { name: "Тернополь", country: "Украина", lat: 49.5535, lon: 25.5948, tz: 2 },
    { name: "Луцк", country: "Украина", lat: 50.7472, lon: 25.3254, tz: 2 },
    { name: "Ужгород", country: "Украина", lat: 48.6208, lon: 22.2879, tz: 2 },
    
    // Беларусь
    { name: "Минск", country: "Беларусь", lat: 53.9006, lon: 27.5590, tz: 3 },
    { name: "Гомель", country: "Беларусь", lat: 52.4345, lon: 30.9754, tz: 3 },
    { name: "Могилев", country: "Беларусь", lat: 53.9007, lon: 30.3313, tz: 3 },
    { name: "Витебск", country: "Беларусь", lat: 55.1904, lon: 30.2049, tz: 3 },
    { name: "Гродно", country: "Беларусь", lat: 53.6884, lon: 23.8258, tz: 3 },
    { name: "Брест", country: "Беларусь", lat: 52.0977, lon: 23.7340, tz: 3 },
    
    // Казахстан
    { name: "Алматы", country: "Казахстан", lat: 43.2220, lon: 76.8512, tz: 6 },
    { name: "Астана", country: "Казахстан", lat: 51.1694, lon: 71.4491, tz: 6 },
    { name: "Шымкент", country: "Казахстан", lat: 42.3000, lon: 69.6000, tz: 6 },
    { name: "Караганда", country: "Казахстан", lat: 49.8047, lon: 73.1094, tz: 6 },
    
    // США
    { name: "Нью-Йорк", country: "США", lat: 40.7128, lon: -74.0060, tz: -5 },
    { name: "Лос-Анджелес", country: "США", lat: 34.0522, lon: -118.2437, tz: -8 },
    { name: "Чикаго", country: "США", lat: 41.8781, lon: -87.6298, tz: -6 },
    { name: "Хьюстон", country: "США", lat: 29.7604, lon: -95.3698, tz: -6 },
    { name: "Филадельфия", country: "США", lat: 39.9526, lon: -75.1652, tz: -5 },
    { name: "Феникс", country: "США", lat: 33.4484, lon: -112.0740, tz: -7 },
    { name: "Сан-Антонио", country: "США", lat: 29.4241, lon: -98.4936, tz: -6 },
    { name: "Сан-Диего", country: "США", lat: 32.7157, lon: -117.1611, tz: -8 },
    { name: "Даллас", country: "США", lat: 32.7767, lon: -96.7970, tz: -6 },
    { name: "Сан-Хосе", country: "США", lat: 37.3382, lon: -121.8863, tz: -8 },
    
    // Канада
    { name: "Торонто", country: "Канада", lat: 43.6532, lon: -79.3832, tz: -5 },
    { name: "Монреаль", country: "Канада", lat: 45.5017, lon: -73.5673, tz: -5 },
    { name: "Ванкувер", country: "Канада", lat: 49.2827, lon: -123.1207, tz: -8 },
    { name: "Калгари", country: "Канада", lat: 51.0447, lon: -114.0719, tz: -7 },
    { name: "Эдмонтон", country: "Канада", lat: 53.5461, lon: -113.4938, tz: -7 },
    { name: "Оттава", country: "Канада", lat: 45.4215, lon: -75.6972, tz: -5 },
    
    // Великобритания
    { name: "Лондон", country: "Великобритания", lat: 51.5074, lon: -0.1278, tz: 0 },
    { name: "Манчестер", country: "Великобритания", lat: 53.4808, lon: -2.2426, tz: 0 },
    { name: "Бирмингем", country: "Великобритания", lat: 52.4862, lon: -1.8904, tz: 0 },
    { name: "Эдинбург", country: "Великобритания", lat: 55.9533, lon: -3.1883, tz: 0 },
    { name: "Ливерпуль", country: "Великобритания", lat: 53.4084, lon: -2.9916, tz: 0 },
    
    // Германия
    { name: "Берлин", country: "Германия", lat: 52.5200, lon: 13.4050, tz: 1 },
    { name: "Гамбург", country: "Германия", lat: 53.5511, lon: 9.9937, tz: 1 },
    { name: "Мюнхен", country: "Германия", lat: 48.1351, lon: 11.5820, tz: 1 },
    { name: "Кёльн", country: "Германия", lat: 50.9375, lon: 6.9603, tz: 1 },
    { name: "Франкфурт", country: "Германия", lat: 50.1109, lon: 8.6821, tz: 1 },
    
    // Франция
    { name: "Париж", country: "Франция", lat: 48.8566, lon: 2.3522, tz: 1 },
    { name: "Марсель", country: "Франция", lat: 43.2965, lon: 5.3698, tz: 1 },
    { name: "Лион", country: "Франция", lat: 45.7640, lon: 4.8357, tz: 1 },
    { name: "Тулуза", country: "Франция", lat: 43.6047, lon: 1.4442, tz: 1 },
    { name: "Ницца", country: "Франция", lat: 43.7102, lon: 7.2620, tz: 1 },
    
    // Италия
    { name: "Рим", country: "Италия", lat: 41.9028, lon: 12.4964, tz: 1 },
    { name: "Милан", country: "Италия", lat: 45.4642, lon: 9.1900, tz: 1 },
    { name: "Неаполь", country: "Италия", lat: 40.8518, lon: 14.2681, tz: 1 },
    { name: "Турин", country: "Италия", lat: 45.0703, lon: 7.6869, tz: 1 },
    { name: "Флоренция", country: "Италия", lat: 43.7696, lon: 11.2558, tz: 1 },
    
    // Испания
    { name: "Мадрид", country: "Испания", lat: 40.4168, lon: -3.7038, tz: 1 },
    { name: "Барселона", country: "Испания", lat: 41.3851, lon: 2.1734, tz: 1 },
    { name: "Валенсия", country: "Испания", lat: 39.4699, lon: -0.3763, tz: 1 },
    { name: "Севилья", country: "Испания", lat: 37.3891, lon: -5.9845, tz: 1 },
    
    // Китай
    { name: "Пекин", country: "Китай", lat: 39.9042, lon: 116.4074, tz: 8 },
    { name: "Шанхай", country: "Китай", lat: 31.2304, lon: 121.4737, tz: 8 },
    { name: "Гуанчжоу", country: "Китай", lat: 23.1291, lon: 113.2644, tz: 8 },
    { name: "Шэньчжэнь", country: "Китай", lat: 22.5431, lon: 114.0579, tz: 8 },
    { name: "Тяньцзинь", country: "Китай", lat: 39.3434, lon: 117.3616, tz: 8 },
    
    // Япония
    { name: "Токио", country: "Япония", lat: 35.6762, lon: 139.6503, tz: 9 },
    { name: "Осака", country: "Япония", lat: 34.6937, lon: 135.5023, tz: 9 },
    { name: "Киото", country: "Япония", lat: 35.0116, lon: 135.7681, tz: 9 },
    { name: "Нагоя", country: "Япония", lat: 35.1815, lon: 136.9066, tz: 9 },
    
    // Австралия
    { name: "Сидней", country: "Австралия", lat: -33.8688, lon: 151.2093, tz: 10 },
    { name: "Мельбурн", country: "Австралия", lat: -37.8136, lon: 144.9631, tz: 10 },
    { name: "Брисбен", country: "Австралия", lat: -27.4698, lon: 153.0251, tz: 10 },
    { name: "Перт", country: "Австралия", lat: -31.9505, lon: 115.8605, tz: 8 },
    
    // Бразилия
    { name: "Сан-Паулу", country: "Бразилия", lat: -23.5505, lon: -46.6333, tz: -3 },
    { name: "Рио-де-Жанейро", country: "Бразилия", lat: -22.9068, lon: -43.1729, tz: -3 },
    { name: "Бразилиа", country: "Бразилия", lat: -15.8267, lon: -47.9218, tz: -3 },
    
    // Аргентина
    { name: "Буэнос-Айрес", country: "Аргентина", lat: -34.6037, lon: -58.3816, tz: -3 },
    
    // Мексика
    { name: "Мехико", country: "Мексика", lat: 19.4326, lon: -99.1332, tz: -6 },
    
    // Турция
    { name: "Стамбул", country: "Турция", lat: 41.0082, lon: 28.9784, tz: 3 },
    { name: "Анкара", country: "Турция", lat: 39.9334, lon: 32.8597, tz: 3 },
    
    // ОАЭ
    { name: "Дубай", country: "ОАЭ", lat: 25.2048, lon: 55.2708, tz: 4 },
    { name: "Абу-Даби", country: "ОАЭ", lat: 24.4539, lon: 54.3773, tz: 4 },
    
    // Египет
    { name: "Каир", country: "Египет", lat: 30.0444, lon: 31.2357, tz: 2 },
    
    // ЮАР
    { name: "Йоханнесбург", country: "ЮАР", lat: -26.2041, lon: 28.0473, tz: 2 },
    { name: "Кейптаун", country: "ЮАР", lat: -33.9249, lon: 18.4241, tz: 2 },
];

// Функция поиска городов
function searchCities(query) {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return CITIES_DATABASE.filter(city => 
        city.name.toLowerCase().includes(lowerQuery) ||
        city.country.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Ограничиваем до 10 результатов
}

// Функция получения города по точному совпадению
function getCityByName(name) {
    return CITIES_DATABASE.find(city => 
        city.name.toLowerCase() === name.toLowerCase()
    );
}

