const g = document.getElementById("g"),
      sp = document.getElementById("sp"),
      clr = document.getElementById("clr");

let sz = 20,
    c = Math.floor(window.innerWidth / sz),
    r = Math.floor(window.innerHeight / sz),
    cells = [],
    run = false,
    mouse = false,
    isSelecting = false,
    isDragging = false,
    selection = { start: null, end: null },
    selectedCells = new Set(),
    creativeMode = false;

// Добавляем в начало файла после объявления переменных
const achievementSystem = new AchievementSystem();

g.style.gridTemplateColumns = `repeat(${c}, 1fr)`;

for (let i = 0; i < r * c; i++) {
  const cell = document.createElement("div");
  cell.className = "c";
  cell.addEventListener("mousedown", (e) => {
    if (e.metaKey) { // Command/Meta key
      if (selectedCells.size > 0 && isInSelection(i)) {
        isDragging = true;
        createDragPreview();
      } else {
        isSelecting = true;
        selection.start = i;
        cells.forEach(cell => cell.classList.remove("selected", "selecting"));
        selectedCells.clear();
        updateSelection();
      }
    } else {
      mouse = true;
      cell.classList.toggle("a");
      handleCellClick(i % c, Math.floor(i / c));
    }
  });
  cell.addEventListener("mouseover", () => {
    if (mouse) cell.classList.add("a");
    if (isSelecting) {
      selection.end = i;
      cells.forEach(cell => cell.classList.remove("selecting"));
      updateSelection(true);
    }
    if (isDragging) {
      updateDragPreview(i);
    }
  });
  g.appendChild(cell);
  cells.push(cell);
}

document.addEventListener("mouseup", () => {
  mouse = false;
  if (isSelecting) {
    isSelecting = false;
  }
  if (isDragging) {
    isDragging = false;
    applyDraggedPattern();
    removeDragPreview();
  }
});

// Обновляем функцию toggleGame
function toggleGame() {
  run = !run;
  sp.textContent = run ? "⏸" : "▶";
  if (run) {
    cells.forEach(cell => cell.classList.remove("selected"));
    selectedCells.clear();
    selection.start = null;
    selection.end = null;
    step();
  }
}

// Обновляем обработчик клавиатуры
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    toggleGame();
  } else if (e.code === "KeyQ") {
    e.preventDefault();
    clear();
  } else if (e.code === "KeyC") {
    e.preventDefault();
    creativeMode = !creativeMode;
    
    achievementSystem.notification.textContent = creativeMode ? 
        "🎨 Режим креатива включен" : 
        "🎨 Режим креатива выключен";
    achievementSystem.notification.classList.add('show');
    
    achievementSystem.updateCreativeMode(creativeMode);
    
    setTimeout(() => {
        achievementSystem.notification.classList.remove('show');
    }, 3000);
  } else if (e.code === "Digit1") {
    e.preventDefault();
    if (!creativeMode && !achievementSystem.achievements.has('glider')) {
        showLockMessage('глайдер');
        return;
    }
    placePatternAtMouse(placeGlider);
  } else if (e.code === "Digit2") {
    e.preventDefault();
    if (!creativeMode && !achievementSystem.achievements.has('gun')) {
        showLockMessage('глайдерное ружье');
        return;
    }
    placePatternAtMouse(placeGun);
  } else if (e.code === "Digit3") {
    e.preventDefault();
    if (!creativeMode && !achievementSystem.achievements.has('lwss')) {
        showLockMessage('LWSS');
        return;
    }
    placePatternAtMouse(placeLWSS);
  } else if (e.code === "Digit4") {
    e.preventDefault();
    if (!creativeMode && !achievementSystem.achievements.has('pulsar')) {
        showLockMessage('пульсар');
        return;
    }
    placePatternAtMouse(placePulsar);
  } else if (e.code === "Digit5") {
    e.preventDefault();
    if (!creativeMode && !achievementSystem.achievements.has('pentadecathlon')) {
        showLockMessage('пентадекатлон');
        return;
    }
    placePatternAtMouse(placePentadecathlon);
  } else if (e.code === "Backspace" && selectedCells.size > 0) {
    e.preventDefault();
    selectedCells.forEach(index => {
      cells[index].classList.remove("a");
    });
    selectedCells.clear();
    cells.forEach(cell => cell.classList.remove("selected"));
  } else if (e.metaKey) {
    g.style.cursor = selectedCells.size > 0 ? "move" : "crosshair";
  } else if (e.code === "BracketRight") { // Клавиша ]
    e.preventDefault();
    // Сбрасываем достижения
    achievementSystem.resetAchievements();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "MetaLeft" || e.code === "MetaRight") {
    g.style.cursor = "default";
  }
});

function clear() {
  cells.forEach(c => c.classList.remove("a"));
}

function step() {
  if (!run) return;

  const n = [];
  for (let i = 0; i < r * c; i++) {
    let alive = 0;
    const x = i % c;
    const y = Math.floor(i / c);

    // Проверяем соседей
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = (x + dx + c) % c;
        const ny = (y + dy + r) % r;
        if (cells[ny * c + nx].classList.contains('a')) alive++;
      }
    }

    // Применяем правила игры
    if (cells[i].classList.contains('a')) {
      n[i] = alive === 2 || alive === 3;
    } else {
      n[i] = alive === 3;
    }
  }

  // Обновляем состояние клеток
  cells.forEach((cell, i) => cell.classList.toggle('a', n[i]));
  
  // Проверяем достижения после каждого шага
  achievementSystem.checkPattern(cells, c, r);
  
  // Запускаем следующий шаг через requestAnimationFrame
  if (run) {
    requestAnimationFrame(() => {
      setTimeout(step, 100); // Добавляем задержку 100мс между шагами
    });
  }
}

// Обновляем обработчик кнопки sp
sp.onclick = toggleGame;

clr.onclick = clear;

// Добавляем функцию обновления выделения
function updateSelection(isSelecting = false) {
  cells.forEach(cell => cell.classList.remove(isSelecting ? "selecting" : "selected"));
  selectedCells.clear();
  
  if (selection.start === null || selection.end === null) return;
  
  const startX = selection.start % c;
  const startY = Math.floor(selection.start / c);
  const endX = selection.end % c;
  const endY = Math.floor(selection.end / c);
  
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);
  
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const index = y * c + x;
      cells[index].classList.add(isSelecting ? "selecting" : "selected");
      selectedCells.add(index);
    }
  }
}

// Добавляем новые функции
function isInSelection(index) {
  return selectedCells.has(index);
}

function createDragPreview() {
  // Очищаем старое выделение перед началом перетаскивания
  cells.forEach(cell => cell.classList.remove("selected"));
  
  const preview = document.createElement("div");
  preview.id = "dragPreview";
  preview.style.position = "absolute";
  preview.style.pointerEvents = "none";
  preview.style.opacity = "0.5";
  document.body.appendChild(preview);
  
  // Создаем сетку нужного размера
  const startX = Math.min(...Array.from(selectedCells).map(i => i % c));
  const endX = Math.max(...Array.from(selectedCells).map(i => i % c));
  const startY = Math.min(...Array.from(selectedCells).map(i => Math.floor(i / c)));
  const endY = Math.max(...Array.from(selectedCells).map(i => Math.floor(i / c)));
  
  const width = endX - startX + 1;
  const height = endY - startY + 1;
  
  const pattern = document.createElement("div");
  pattern.style.display = "grid";
  pattern.style.gridTemplateColumns = `repeat(${width}, ${sz}px)`;
  
  // Копируем только выделенные клетки в правильном порядке
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const index = y * c + x;
      const cell = document.createElement("div");
      cell.className = "c";
      if (cells[index].classList.contains("a")) {
        cell.classList.add("a");
      }
      pattern.appendChild(cell);
    }
  }
  preview.appendChild(pattern);
  
  // Сохраняем размеры паттерна для использования при вставке
  preview.dataset.width = width;
  preview.dataset.height = height;
  preview.dataset.startX = startX;
  preview.dataset.startY = startY;
}

function updateDragPreview(currentIndex) {
  const preview = document.getElementById("dragPreview");
  if (!preview) return;
  
  const currentX = (currentIndex % c) * sz;
  const currentY = Math.floor(currentIndex / c) * sz;
  preview.style.left = `${currentX}px`;
  preview.style.top = `${currentY}px`;
}

function applyDraggedPattern() {
  const preview = document.getElementById("dragPreview");
  if (!preview) return;
  
  cells.forEach(cell => cell.classList.remove("selected"));
  selectedCells.clear();
  selection.start = null;
  selection.end = null;
  
  const width = parseInt(preview.dataset.width);
  const height = parseInt(preview.dataset.height);
  const sourceStartX = parseInt(preview.dataset.startX);
  const sourceStartY = parseInt(preview.dataset.startY);
  
  // Получаем позицию курсора мыши как целевую позицию для вставки
  const targetIndex = Array.from(cells).findIndex(cell => 
    cell.matches(':hover')
  );
  if (targetIndex === -1) return;
  
  const targetStartX = targetIndex % c;
  const targetStartY = Math.floor(targetIndex / c);
  
  // Сначала очищаем целевую область
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const targetX = (targetStartX + x + c) % c;
      const targetY = (targetStartY + y + r) % r;
      const targetIndex = targetY * c + targetX;
      cells[targetIndex].classList.remove("a");
    }
  }
  
  // Затем копируем паттерн на новое место и добавляем новые клетки в выделение
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceIndex = (sourceStartY + y) * c + (sourceStartX    + x);
      const targetX = (targetStartX + x + c) % c;
      const targetY = (targetStartY + y + r) % r;
      const targetIndex = targetY * c + targetX;
      
      if (cells[sourceIndex].classList.contains("a")) {
        cells[targetIndex].classList.add("a");
      }
    }
  }
  
  // После копирования паттерна добавляем выделение на новое место
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const targetX = (targetStartX + x + c) % c;
      const targetY = (targetStartY + y + r) % r;
      const targetIndex = targetY * c + targetX;
      
      cells[targetIndex].classList.add("selected");
      selectedCells.add(targetIndex);
    }
  }
  
  // Обновляем начальную и конечную точки выделения
  selection.start = targetStartY * c + targetStartX;
  selection.end = ((targetStartY + height - 1) * c) + (targetStartX + width - 1);
}

function removeDragPreview() {
  const preview = document.getElementById("dragPreview");
  if (!preview) return;
  preview.remove();
}

// Убираем проверку достижений из handleCellClick
function handleCellClick(x, y) {
    achievementSystem.checkPattern(cells, c, r);
}

// Убираем проверку достижений из placeGlider
function placeGlider(startX, startY) {
    const glider = [
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 1]
    ];
    
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            const cellIndex = ((startY + y + r) % r) * c + ((startX + x + c) % c);
            if (glider[y][x]) {
                cells[cellIndex].classList.add('a');
            } else {
                cells[cellIndex].classList.remove('a');
            }
        }
    }
    // Убираем проверку достижений здесь
}

// Добавляем функцию для размещения ружья
function placeGun(startX, startY) {
    const gunPattern = achievementSystem.patterns.gun.pattern;
    
    for (let y = 0; y < gunPattern.length; y++) {
        for (let x = 0; x < gunPattern[0].length; x++) {
            const cellIndex = ((startY + y + r) % r) * c + ((startX + x + c) % c);
            if (gunPattern[y][x]) {
                cells[cellIndex].classList.add('a');
            } else {
                cells[cellIndex].classList.remove('a');
            }
        }
    }
}

// Добавляем функции размещения новых паттернов
function placeLWSS(startX, startY) {
    placePattern(startX, startY, achievementSystem.patterns.lwss.pattern);
}

function placePulsar(startX, startY) {
    placePattern(startX, startY, achievementSystem.patterns.pulsar.pattern);
}

function placePentadecathlon(startX, startY) {
    placePattern(startX, startY, achievementSystem.patterns.pentadecathlon.pattern);
}

// Общая функция для размещения паттерна
function placePattern(startX, startY, pattern) {
    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[0].length; x++) {
            const cellIndex = ((startY + y + r) % r) * c + ((startX + x + c) % c);
            if (pattern[y][x]) {
                cells[cellIndex].classList.add('a');
            } else {
                cells[cellIndex].classList.remove('a');
            }
        }
    }
}

// Вспомогательная функция для размещения паттерна под курсором
function placePatternAtMouse(placeFunction) {
    const hoveredCell = Array.from(cells).findIndex(cell => 
        cell.matches(':hover')
    );
    if (hoveredCell !== -1) {
        const x = hoveredCell % c;
        const y = Math.floor(hoveredCell / c);
        placeFunction(x, y);
    }
}

// Вспомогательная функция для показа сообщения о блокировке
function showLockMessage(patternName) {
    achievementSystem.notification.textContent = 
        `🔒 Создайте ${patternName} вручную или включите режим креатива (C)`;
    achievementSystem.notification.classList.add('show');
    setTimeout(() => {
        achievementSystem.notification.classList.remove('show');
    }, 3000);
}

