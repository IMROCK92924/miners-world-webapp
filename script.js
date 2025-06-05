console.log('script.js: Starting initialization');

// Константы
const ENERGY_MAX = 10;
const ENERGY_MIN = 0;
const DESIGN_WIDTH = 720;
const DESIGN_HEIGHT = 1480;

// Аудио эффекты
const sounds = {
  click: null,
  success: null,
  error: null
};

// Состояние игры
const gameState = {
  energy: 3,
  resources: {
    irid: 0,
    rubid: 0,
    fel: 0
  },
  settings: {
    soundEnabled: true
  }
};

// Глобальные настройки
const gameSettings = {
    language: 'ru',
    referralCount: 0
};

// Тексты для разных языков
const translations = {
    ru: {
        settings: 'Настройки',
        language: 'Язык',
        referrals: 'Рефералы',
        save: 'Сохранить',
        cancel: 'Отмена'
    },
    en: {
        settings: 'Settings',
        language: 'Language',
        referrals: 'Referrals',
        save: 'Save',
        cancel: 'Cancel'
    }
};

// Функция для получения текста
function getText(key) {
    return translations[gameSettings.language][key];
}

// Сброс данных пользователя
function resetUserData() {
  // Сбрасываем состояние игры
  gameState.energy = 3;
  gameState.resources = {
    irid: 0,
    rubid: 0,
    fel: 0
  };
  // Обновляем UI
  updateUI();
}

// Сохранение состояния
function saveGameState() {
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Загрузка состояния
async function loadGameState() {
  try {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(gameState, parsed);
    }
    updateUI();
  } catch (error) {
    console.error('Error loading game state:', error);
  }
}

// Обновление UI
function updateUI() {
  setEnergyLevel(gameState.energy);
  document.getElementById('irid').textContent = gameState.resources.irid;
  document.getElementById('rubid').textContent = gameState.resources.rubid;
  document.getElementById('fel').textContent = gameState.resources.fel;
}

function setEnergyLevel(level) {
  if (level < ENERGY_MIN) level = ENERGY_MIN;
  if (level > ENERGY_MAX) level = ENERGY_MAX;
  gameState.energy = level;
  document.getElementById("energyBar").src = `assets/energy/energy_${level}.png`;
  saveGameState();
}

// Воспроизведение звука
function playSound(soundName) {
  const sound = sounds[soundName];
  if (sound && gameState.settings.soundEnabled) {
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Audio playback failed:', err));
  }
}

// Debounce функция
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatTime(seconds) {
  if (seconds < 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function canClaim(tool) {
  if (!tool.lastHarvest) return true;
  const now = Date.now();
  const elapsed = Math.floor((now - tool.lastHarvest) / 1000);
  return elapsed >= tool.harvestTime;
}

function claimRewards(toolId) {
  const tool = gameState.tools.find(t => t.id === toolId);
  if (!tool || !canClaim(tool)) return;

  // Находим кнопку CLAIM для этого инструмента
  const toolElement = document.getElementById(`tool-${toolId}`);
  const claimButton = toolElement.querySelector('.claim-button');

  // Определяем тип ресурса на основе редкости
  let resourceType = 'fel'; // По умолчанию
  if (tool.rarity === 'epic') {
    resourceType = 'irid';
  } else if (tool.rarity === 'rare') {
    resourceType = 'rubid';
  }

  // Создаем эффект переноса ресурсов
  createResourceTransferEffect(claimButton, resourceType);

  // Начисляем награды в зависимости от редкости
  const rewards = {
    common: { irid: 1, rubid: 1, fel: 1 },
    uncommon: { irid: 2, rubid: 2, fel: 2 },
    rare: { irid: 3, rubid: 3, fel: 3 },
    epic: { irid: 5, rubid: 5, fel: 5 }
  };

  const reward = rewards[tool.rarity];
  gameState.resources.irid += reward.irid;
  gameState.resources.rubid += reward.rubid;
  gameState.resources.fel += reward.fel;

  // Обновляем время последнего сбора
  tool.lastHarvest = Date.now();
  
  // Уменьшаем прочность
  tool.durability.current = Math.max(0, tool.durability.current - 1);

  // Обновляем UI с небольшой задержкой, чтобы анимация успела проиграться
  setTimeout(() => {
    updateUI();
    updateMiningTools();
  }, 800);
  
  // Воспроизводим звук успеха
  playSound('success');
}

function updateMiningTools() {
  const tools = gameState.tools;
  tools.forEach(tool => {
    const toolElement = document.getElementById(`tool-${tool.id}`);
    if (toolElement) {
      const timeElement = toolElement.querySelector('.harvest-time');
      const claimButton = toolElement.querySelector('.claim-button');
      
      if (timeElement && claimButton) {
        if (tool.lastHarvest) {
          const now = Date.now();
          const elapsed = Math.floor((now - tool.lastHarvest) / 1000);
          const remaining = Math.max(0, tool.harvestTime - elapsed);
          
          timeElement.textContent = `⏱ Time: ${formatTime(remaining)}`;
          
          if (canClaim(tool)) {
            claimButton.disabled = false;
            claimButton.textContent = 'CLAIM';
          } else {
            claimButton.disabled = true;
            claimButton.textContent = 'WAIT';
          }
        } else {
          timeElement.textContent = `⏱ Time: Ready!`;
          claimButton.disabled = false;
          claimButton.textContent = 'CLAIM';
        }
      }
    }
  });
}

// Обновляем функцию openModal
function openModal(name) {
    playSound('click');
    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = "";
    const modal = document.createElement("div");
    modal.className = `modal ${name}`;

    if (name === "settings") {
        modal.innerHTML = `
            <h2 class="settings-header">${getText('settings')}</h2>
            
            <div class="settings-section">
                <div class="settings-section-title">
                    <i>🌍</i> ${getText('language')}
                </div>
                <div class="language-selector">
                    <button class="language-btn ${gameSettings.language === 'ru' ? 'active' : ''}" 
                            onclick="changeLanguage('ru')">Русский</button>
                    <button class="language-btn ${gameSettings.language === 'en' ? 'active' : ''}" 
                            onclick="changeLanguage('en')">English</button>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">
                    <i>👥</i> ${getText('referrals')}
                </div>
                <div class="referral-info">
                    <span class="referral-label">${getText('referrals')}:</span>
                    <span class="referral-count">${gameSettings.referralCount}</span>
                </div>
            </div>
            
            <div class="settings-footer">
                <button class="settings-btn settings-save" onclick="saveSettings()">${getText('save')}</button>
                <button class="settings-btn settings-cancel" onclick="closeModal()">${getText('cancel')}</button>
            </div>
        `;
    } else if (name === "energy") {
        modal.innerHTML = `
            <input id="energyInput" class="energy-input" type="number" 
                   min="${ENERGY_MIN}" max="${ENERGY_MAX}" 
                   placeholder="${ENERGY_MIN}–${ENERGY_MAX}"
                   value="${gameState.energy}">
            <div class="modal-buttons">
                <button id="energyConfirm">OK</button>
                <button id="energyCancel" class="cancel">CANCEL</button>
            </div>
        `;
        
        const input = document.getElementById("energyInput");
        input.focus();
        
        document.getElementById("energyConfirm").onclick = () => {
            const value = parseInt(input.value);
            if (!isNaN(value) && value >= ENERGY_MIN && value <= ENERGY_MAX) {
                setEnergyLevel(value);
                playSound('success');
                closeModal();
            } else {
                playSound('error');
                alert(`Введите число от ${ENERGY_MIN} до ${ENERGY_MAX}`);
            }
        };
        
        document.getElementById("energyCancel").onclick = closeModal;
    } else if (name === "inventory") {
        if (window.inventoryManager) {
            window.inventoryManager.show(true);
            return;
        }
    } else if (name === "market") {
        modal.style.backgroundImage = `url('assets/modal_${name}.png')`;
    }
    
    modalContainer.appendChild(modal);
}

// Функция закрытия модального окна
function closeModal() {
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.innerHTML = "";
    }
    playSound('click');
}

// Функция изменения языка
function changeLanguage(lang) {
    gameSettings.language = lang;
    // Перерисовываем модальное окно настроек
    openModal('settings');
}

// Функция сохранения настроек
function saveSettings() {
    // Сохраняем настройки в localStorage
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
    
    // Закрываем модальное окно
    closeModal();
    
    // Воспроизводим звук успеха
    playSound('success');
}

// Загрузка настроек при старте
function loadSettings() {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
        Object.assign(gameSettings, JSON.parse(savedSettings));
    }
}

let lastWidth = window.innerWidth;

function scaleGame() {
  const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const actualWidth = window.innerWidth;
  const scale = actualWidth / DESIGN_WIDTH;
  const scaledHeight = DESIGN_HEIGHT * scale;
  
  const game = document.querySelector('.game');
  game.style.transform = `scale(${scale})`;
  game.style.transformOrigin = 'top left';
  
  const box = document.querySelector('.scale-box');
  box.style.width = `${DESIGN_WIDTH}px`;
  box.style.height = `${DESIGN_HEIGHT}px`;
  box.style.left = '0px';
  box.style.top = `${(viewportHeight - scaledHeight) / 2}px`;
  
  const wrapper = document.querySelector('.wrapper');
  wrapper.style.background = 'url("assets/background.png") no-repeat center/cover';
}

const handleResize = debounce(() => {
  if (window.innerWidth === lastWidth) return;
  lastWidth = window.innerWidth;
  scaleGame();
}, 250);

// Обновляем функцию initGame
async function initGame() {
    console.log('Initializing game...');
    
    try {
        // Загружаем настройки и состояние
        loadSettings();
        await loadGameState();
        
        // Инициализируем менеджеры
        window.toolSlotManager = new ToolSlotManager();
        window.inventoryManager = new InventoryManager();
        window.soundManager = new SoundManager();
        
        // Инициализируем обработчики событий
        initializeEventHandlers();
        
        // Настраиваем масштабирование
        scaleGame();
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", scaleGame);
        }
        window.addEventListener("resize", handleResize);
        
        // Показываем игру
        const wrapper = document.querySelector('.wrapper');
        if (wrapper) {
            wrapper.style.display = 'block';
            wrapper.style.opacity = '1';
            wrapper.style.visibility = 'visible';
        }
        
        // Обновляем отображение
        updateUI();
        
    } catch (error) {
        console.error('Game initialization error:', error);
    }
}

// Выносим инициализацию обработчиков событий в отдельную функцию
function initializeEventHandlers() {
    document.getElementById("inventory").onclick = () => openModal("inventory");
    document.getElementById("market").onclick = () => openModal("market");
    document.getElementById("mining").onclick = () => openModal("settings");
    document.getElementById("home").onclick = closeModal;
    document.getElementById("plusButton").onclick = () => openModal("energy");
}

// Callback после загрузки ресурсов
function onResourcesLoaded(cache) {
    console.log('Resources loaded, starting game...');
    
    // Скрываем экран загрузки
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Показываем основной контент
            const wrapper = document.querySelector('.wrapper');
            if (wrapper) {
                wrapper.style.display = 'block';
                wrapper.style.opacity = '1';
                wrapper.style.visibility = 'visible';
            }
        }, 300); // Ждем завершения анимации
    }
    
    // Инициализируем менеджеры
    window.toolSlotManager = new ToolSlotManager();
    window.inventoryManager = new InventoryManager();
    
    // Обновляем отображение ресурсов
    updateResourceDisplay();
    
    // Запускаем автосохранение
    setInterval(() => {
        saveGameState();
    }, 60000); // Каждую минуту
}

// Обновление отображения ресурсов
function updateResourceDisplay() {
    try {
        const resources = gameState.resources || {
            fel: 0,
            irid: 0,
            rubid: 0
        };
        
        document.getElementById('fel').textContent = resources.fel || 0;
        document.getElementById('irid').textContent = resources.irid || 0;
        document.getElementById('rubid').textContent = resources.rubid || 0;
    } catch (error) {
        console.error('Error updating resource display:', error);
    }
}

// Запускаем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);

// Глобальная функция для создания эффекта переноса ресурсов
window.createResourceTransferEffect = function(button, resourceType) {
  const buttonRect = button.getBoundingClientRect();
  const resourceElement = document.getElementById(resourceType);
  const resourceRect = resourceElement.getBoundingClientRect();

  // Создаем несколько частиц
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'resource-particle';
      
      // Начальная позиция (кнопка CLAIM)
      particle.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
      particle.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
      
      // Рассчитываем расстояние для перемещения
      const flyX = resourceRect.left - buttonRect.left;
      const flyY = resourceRect.top - buttonRect.top;
      
      // Устанавливаем CSS переменные для анимации
      particle.style.setProperty('--fly-x', `${flyX}px`);
      particle.style.setProperty('--fly-y', `${flyY}px`);
      
      document.body.appendChild(particle);
      
      // Удаляем частицу после завершения анимации
      particle.addEventListener('animationend', () => {
        particle.remove();
        if (i === 4) { // Последняя частица
          resourceElement.classList.add('highlight');
          setTimeout(() => {
            resourceElement.classList.remove('highlight');
          }, 500);
        }
      });
    }, i * 100); // Задержка между частицами
  }
}

// Удаляем старый обработчик кнопок CLAIM, так как теперь эффект вызывается из claimRewards
document.removeEventListener('DOMContentLoaded', () => {
  const claimButtons = document.querySelectorAll('.claim-button');
  claimButtons.forEach(button => {
    button.removeEventListener('click', (e) => {
      const miningTool = e.target.closest('.mining-tool');
      if (!miningTool) return;
      
      let resourceType = 'fel';
      if (miningTool.classList.contains('rarity-epic')) {
        resourceType = 'irid';
      } else if (miningTool.classList.contains('rarity-rare')) {
        resourceType = 'rubid';
      }
      
      createResourceTransferEffect(button, resourceType);
    });
  });
});