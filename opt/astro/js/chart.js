/**
 * Модуль для отрисовки северной карты в виде большой 12-конечной звезды
 * Точная копия стиля с примера
 */

class NorthIndianChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.size = 700;
        this.center = this.size / 2;
        this.padding = 30;
        
        // Цветовая схема точно как на примере
        this.colors = {
            background: '#e8dfd0',
            border: '#000000',
            text: '#000000',
            planet: '#dd2222',
            ascendant: '#cc00cc',
            sign: '#8899bb',
            houseNum: '#aaaaaa'
        };
        
        // Устанавливаем размер canvas
        this.canvas.width = this.size;
        this.canvas.height = this.size;
    }
    
    /**
     * Отрисовка большой 12-конечной звезды
     */
    drawStar() {
        const cx = this.center;
        const cy = this.center;
        const outerRadius = this.size / 2 - this.padding;
        const innerRadius = outerRadius * 0.35;
        
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 1.5;
        
        // Рисуем 12 треугольников (12 домов)
        for (let i = 0; i < 12; i++) {
            const angle1 = (i * 30 - 90) * Math.PI / 180;
            const angle2 = ((i + 1) * 30 - 90) * Math.PI / 180;
            
            // Внешние точки
            const x1 = cx + outerRadius * Math.cos(angle1);
            const y1 = cy + outerRadius * Math.sin(angle1);
            const x2 = cx + outerRadius * Math.cos(angle2);
            const y2 = cy + outerRadius * Math.sin(angle2);
            
            // Треугольник от центра к внешним точкам
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy);
            this.ctx.lineTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.closePath();
            this.ctx.stroke();
            
            // Внутренние соединительные линии для создания звезды
            if (i < 12) {
                const nextAngle = ((i + 2) * 30 - 90) * Math.PI / 180;
                const nx = cx + outerRadius * Math.cos(nextAngle);
                const ny = cy + outerRadius * Math.sin(nextAngle);
                
                this.ctx.beginPath();
                this.ctx.moveTo(x2, y2);
                this.ctx.lineTo(nx, ny);
                this.ctx.stroke();
            }
        }
        
        // Внутренний круг (опционально для красоты)
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, innerRadius * 0.8, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * Получение позиций центров домов
     */
    getHousePositions() {
        const cx = this.center;
        const cy = this.center;
        const radius = (this.size / 2 - this.padding) * 0.6;
        
        const positions = {};
        
        // 12 домов расположены по кругу
        // 1-й дом снизу слева, затем против часовой стрелки
        const startAngle = 240; // Начинаем с нижнего левого
        
        for (let house = 1; house <= 12; house++) {
            const angle = (startAngle - (house - 1) * 30) * Math.PI / 180;
            positions[house] = {
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle)
            };
        }
        
        return positions;
    }
    
    /**
     * Получение дома для знака
     */
    getHouseForSign(signIndex, ascendantSignIndex) {
        let house = signIndex - ascendantSignIndex + 1;
        while (house <= 0) house += 12;
        while (house > 12) house -= 12;
        return house;
    }
    
    /**
     * Группировка планет по домам
     */
    groupPlanetsByHouse(chartData) {
        const planetsByHouse = {};
        const ascSign = chartData.planets.Ascendant.sign.index;
        
        for (const key in chartData.planets) {
            const planet = chartData.planets[key];
            if (key === 'Ascendant') continue;
            
            const signIndex = planet.sign.index;
            const house = this.getHouseForSign(signIndex, ascSign);
            
            if (!planetsByHouse[house]) {
                planetsByHouse[house] = [];
            }
            
            const shortNames = {
                'Sun': 'Su',
                'Moon': 'Mo',
                'Mercury': 'Me',
                'Venus': 'Ve',
                'Mars': 'Ma',
                'Jupiter': 'Ju',
                'Saturn': 'Sa',
                'Rahu': 'Ra',
                'Ketu': 'Ke'
            };
            
            planetsByHouse[house].push({
                shortName: shortNames[key] || key.substring(0, 2),
                degree: Math.floor(planet.sign.degree),
                fullName: planet.name
            });
        }
        
        return planetsByHouse;
    }
    
    /**
     * Отрисовка номеров домов
     */
    drawHouseNumbers() {
        const cx = this.center;
        const cy = this.center;
        const radius = (this.size / 2 - this.padding) * 0.35;
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = this.colors.houseNum;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const startAngle = 240;
        
        for (let house = 1; house <= 12; house++) {
            const angle = (startAngle - (house - 1) * 30) * Math.PI / 180;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            
            this.ctx.fillText(house.toString(), x, y);
        }
    }
    
    /**
     * Отрисовка знаков зодиака
     */
    drawZodiacSigns(chartData) {
        const cx = this.center;
        const cy = this.center;
        const radius = (this.size / 2 - this.padding) * 0.85;
        const ascSign = chartData.planets.Ascendant.sign.index;
        
        const signAbbr = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
        
        this.ctx.font = '13px Arial';
        this.ctx.fillStyle = this.colors.sign;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const startAngle = 240;
        
        for (let house = 1; house <= 12; house++) {
            const signIndex = (ascSign + house - 1) % 12;
            const angle = (startAngle - (house - 1) * 30) * Math.PI / 180;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            
            this.ctx.fillText(signAbbr[signIndex], x, y);
        }
    }
    
    /**
     * Отрисовка планет
     */
    drawPlanets(chartData) {
        const positions = this.getHousePositions();
        const planetsByHouse = this.groupPlanetsByHouse(chartData);
        
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let house = 1; house <= 12; house++) {
            const planets = planetsByHouse[house];
            if (!planets || planets.length === 0) continue;
            
            const pos = positions[house];
            
            if (planets.length === 1) {
                // Одна планета
                const planet = planets[0];
                this.ctx.font = 'bold 20px Arial';
                this.ctx.fillStyle = this.colors.planet;
                this.ctx.fillText(planet.shortName, pos.x, pos.y);
                
                // Градус
                this.ctx.font = '11px Arial';
                this.ctx.fillStyle = this.colors.houseNum;
                this.ctx.fillText(planet.degree + '°', pos.x, pos.y + 18);
            } else {
                // Несколько планет в скобках
                const planetNames = planets.map(p => p.shortName).join(',');
                this.ctx.font = 'bold 18px Arial';
                this.ctx.fillStyle = this.colors.planet;
                this.ctx.fillText('(' + planetNames + ')', pos.x, pos.y);
                
                // Градусы первой планеты
                this.ctx.font = '11px Arial';
                this.ctx.fillStyle = this.colors.houseNum;
                this.ctx.fillText(planets[0].degree + '°', pos.x, pos.y + 18);
            }
        }
    }
    
    /**
     * Отрисовка асцендента в центре
     */
    drawAscendant(chartData) {
        const ascDegree = Math.floor(chartData.planets.Ascendant.sign.degree);
        
        // Рисуем точку в центре
        this.ctx.fillStyle = this.colors.ascendant;
        this.ctx.beginPath();
        this.ctx.arc(this.center, this.center, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Рисуем крест через точку
        this.ctx.strokeStyle = this.colors.ascendant;
        this.ctx.lineWidth = 3;
        
        // Вертикальная линия
        this.ctx.beginPath();
        this.ctx.moveTo(this.center, this.center - 15);
        this.ctx.lineTo(this.center, this.center + 15);
        this.ctx.stroke();
        
        // Горизонтальная линия
        this.ctx.beginPath();
        this.ctx.moveTo(this.center - 15, this.center);
        this.ctx.lineTo(this.center + 15, this.center);
        this.ctx.stroke();
        
        // Градус асцендента под крестом
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillStyle = this.colors.ascendant;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(ascDegree + '°', this.center, this.center + 25);
    }
    
    /**
     * Отрисовка заголовков
     */
    drawTitle() {
        this.ctx.font = 'bold 22px Arial';
        this.ctx.fillStyle = this.colors.text;
        
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('Natal Chart', 40, 30);
        
        this.ctx.textAlign = 'right';
        this.ctx.font = 'bold 26px Arial';
        this.ctx.fillText('Rasi', this.size - 40, 30);
    }
    
    /**
     * Главная функция отрисовки
     */
    draw(chartData) {
        if (!this.ctx) return;
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.size, this.size);
        
        // Заливаем фон
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.size, this.size);
        
        // Рисуем элементы
        this.drawTitle();
        this.drawStar();
        this.drawZodiacSigns(chartData);
        this.drawHouseNumbers();
        this.drawPlanets(chartData);
        this.drawAscendant(chartData);
    }
}
