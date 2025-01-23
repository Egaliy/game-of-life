class AchievementSystem {
    constructor() {
        this.achievements = new Set(
            JSON.parse(localStorage.getItem('achievements')) || []
        );
        
        this.patterns = {
            glider: {
                pattern: [
                    [0, 1, 0],
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                emoji: '🛸' // НЛО для глайдера
            },
            gun: {
                pattern: [
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                ],
                emoji: '🔫' // Пистолет для ружья
            },
            lwss: {
                pattern: [
                    [0, 1, 1, 1, 1],
                    [1, 0, 0, 0, 1],
                    [0, 0, 0, 0, 1],
                    [1, 0, 0, 1, 0]
                ],
                emoji: '🚀'
            },
            pulsar: {
                pattern: [
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
                ],
                emoji: '🌟'
            },
            pentadecathlon: {
                pattern: [
                    [0, 0, 1, 0, 0],
                    [0, 1, 0, 1, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 1, 0, 1, 0],
                    [0, 0, 1, 0, 0]
                ],
                emoji: '🎭'
            }
        };
        
        this.notification = document.createElement('div');
        this.notification.className = 'achievement-notification';
        document.body.appendChild(this.notification);

        this.createPatternsMenu();

        // Проверяем, первый ли это визит
        if (!localStorage.getItem('hasVisited')) {
            this.showInstructions();
            localStorage.setItem('hasVisited', 'true');
        }
    }

    createPatternsMenu() {
        this.patternsMenu = document.createElement('div');
        this.patternsMenu.className = 'patterns-menu';
        
        const patterns = [
            { id: 'glider', key: '1' },
            { id: 'gun', key: '2' },
            { id: 'lwss', key: '3' },
            { id: 'pulsar', key: '4' },
            { id: 'pentadecathlon', key: '5' }
        ];
        
        patterns.forEach(({ id, key }) => {
            const item = this.createPatternItem(id, key);
            this[`${id}Item`] = item;
        });
        
        document.body.appendChild(this.patternsMenu);
    }

    createPatternItem(id, key) {
        const item = document.createElement('div');
        item.className = 'pattern-item locked';
        item.innerHTML = this.createPatternItemContent(id, key);
        this.patternsMenu.appendChild(item);
        return item;
    }

    createPatternItemContent(id, key) {
        return `
            <div class="pattern-emoji">${this.patterns[id].emoji}</div>
            <div class="key">${key}</div>
        `;
    }

    updateUnlockedPatterns() {
        if (this.achievements.has('glider')) this.gliderItem.classList.remove('locked');
        if (this.achievements.has('gun')) this.gunItem.classList.remove('locked');
        if (this.achievements.has('lwss')) this.lwssItem.classList.remove('locked');
        if (this.achievements.has('pulsar')) this.pulsarItem.classList.remove('locked');
        if (this.achievements.has('pentadecathlon')) this.pentadecathlonItem.classList.remove('locked');
    }

    updateCreativeMode(isCreative) {
        if (isCreative) {
            this.gliderItem.classList.remove('locked');
            this.gunItem.classList.remove('locked');
            this.lwssItem.classList.remove('locked');
            this.pulsarItem.classList.remove('locked');
            this.pentadecathlonItem.classList.remove('locked');
            this.patternsMenu.classList.add('creative-mode');
        } else {
            this.updateUnlockedPatterns();
            this.patternsMenu.classList.remove('creative-mode');
        }
    }

    unlockAchievement(id, message) {
        if (this.achievements.has(id)) return;
        
        this.achievements.add(id);
        localStorage.setItem('achievements', 
            JSON.stringify(Array.from(this.achievements))
        );
        
        this.notification.textContent = `🏆 Достижение разблокировано: ${message}`;
        this.notification.classList.add('show');
        
        if (id === 'glider') {
            this.gliderItem.classList.remove('locked');
        } else if (id === 'gun') {
            this.gunItem.classList.remove('locked');
        } else if (id === 'lwss') {
            this.lwssItem.classList.remove('locked');
        } else if (id === 'pulsar') {
            this.pulsarItem.classList.remove('locked');
        } else if (id === 'pentadecathlon') {
            this.pentadecathlonItem.classList.remove('locked');
        }
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    // Функция для поворота паттерна на 90 градусов по часовой стрелке
    rotatePattern(pattern) {
        const rows = pattern.length;
        const cols = pattern[0].length;
        let result = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                result[j][rows - 1 - i] = pattern[i][j];
            }
        }
        return result;
    }

    // Функция для отражения паттерна по горизонтали
    flipHorizontal(pattern) {
        return pattern.map(row => [...row].reverse());
    }

    // Функция для отражения паттерна по вертикали
    flipVertical(pattern) {
        return [...pattern].reverse();
    }

    // Функция получения всех возможных вариаций паттерна
    getAllPatternVariations(pattern) {
        let variations = [];
        let current = pattern;

        // Добавляем все 4 поворота
        for (let i = 0; i < 4; i++) {
            variations.push(current);
            current = this.rotatePattern(current);
        }

        // Отражаем по горизонтали и добавляем еще 4 поворота
        current = this.flipHorizontal(pattern);
        for (let i = 0; i < 4; i++) {
            variations.push(current);
            current = this.rotatePattern(current);
        }

        // Отражаем по вертикали и добавляем еще 4 поворота
        current = this.flipVertical(pattern);
        for (let i = 0; i < 4; i++) {
            variations.push(current);
            current = this.rotatePattern(current);
        }

        // Удаляем дубликаты (преобразуем каждый паттерн в строку для сравнения)
        return variations.filter((pattern, index, self) => 
            index === self.findIndex(p => 
                JSON.stringify(p) === JSON.stringify(pattern)
            )
        );
    }

    // Обновляем функцию проверки паттерна
    checkPattern(cells, columns, rows) {
        Object.entries(this.patterns).forEach(([id, {pattern}]) => {
            const variations = this.getAllPatternVariations(pattern);
            const height = pattern.length;
            const width = pattern[0].length;
            
            // Убедимся, что не выходим за пределы поля
            for (let y = 0; y < rows - height + 1; y++) {
                for (let x = 0; x < columns - width + 1; x++) {
                    if (variations.some(p => this.matchPattern(cells, x, y, columns, p))) {
                        let message;
                        switch(id) {
                            case 'glider': message = 'Создан глайдер!'; break;
                            case 'gun': message = 'Создано глайдерное ружье!'; break;
                            case 'lwss': message = 'Создан LWSS!'; break;
                            case 'pulsar': message = 'Создан пульсар!'; break;
                            case 'pentadecathlon': message = 'Создан пентадекатлон!'; break;
                            default: message = `Создан ${id}!`;
                        }
                        this.unlockAchievement(id, message);
                    }
                }
            }
        });
    }

    matchPattern(cells, startX, startY, columns, pattern) {
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[0].length; x++) {
                const cellIndex = (startY + y) * columns + (startX + x);
                const isAlive = cells[cellIndex].classList.contains('a');
                if (isAlive !== Boolean(pattern[y][x])) {
                    return false;
                }
            }
        }
        return true;
    }

    hasAchievement(id) {
        return this.achievements.has(id) || creativeMode;
    }

    resetAchievements() {
        // Очищаем все достижения
        this.achievements.clear();
        
        // Очищаем localStorage
        localStorage.removeItem('achievements');
        
        // Обновляем отображение меню
        this.gliderItem.classList.add('locked');
        this.gunItem.classList.add('locked');
        this.lwssItem.classList.add('locked');
        this.pulsarItem.classList.add('locked');
        this.pentadecathlonItem.classList.add('locked');
        
        // Показываем уведомление с новым эмодзи
        this.notification.textContent = "🔄 Достижения сброшены";
        this.notification.classList.add('show');
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    showInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'instructions-modal';
        instructions.innerHTML = `
            <div class="instructions-content">
                <h2>🎮 Управление игрой</h2>
                <ul>
                    <li><strong>Пробел</strong> - запуск/пауза симуляции</li>
                    <li><strong>Q</strong> - очистить поле</li>
                    <li><strong>C</strong> - включить/выключить режим креатива</li>
                    <li><strong>]</strong> - сбросить все достижения</li>
                </ul>

                <h2>🏗️ Конструкции</h2>
                <ul>
                    <li><strong>1</strong> - разместить глайдер 🛸</li>
                    <li><strong>2</strong> - разместить ружье 🔫</li>
                    <li><strong>3</strong> - разместить LWSS 🚀</li>
                    <li><strong>4</strong> - разместить пульсар 🌟</li>
                    <li><strong>5</strong> - разместить пентадекатлон 🎭</li>
                </ul>

                <h2>🎯 Как играть</h2>
                <p>Нажимайте на клетки, чтобы создавать живые клетки. Создавайте известные конструкции, чтобы разблокировать их для быстрого размещения. Или включите режим креатива (C), чтобы получить доступ ко всем конструкциям сразу!</p>

                <button class="close-instructions">Понятно!</button>
            </div>
        `;

        document.body.appendChild(instructions);

        const closeButton = instructions.querySelector('.close-instructions');
        closeButton.addEventListener('click', () => {
            instructions.classList.add('fade-out');
            setTimeout(() => instructions.remove(), 300);
        });
    }
}