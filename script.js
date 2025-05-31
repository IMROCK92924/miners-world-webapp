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

// Сохранение состояния
function saveGameState() {
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Загрузка состояния
function loadGameState() {
  try {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(gameState, parsed);
      updateUI();
    }
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

function openModal(name) {
  playSound('click');
  if (name === "energy") {
    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = "";
    const modal = document.createElement("div");
    modal.className = `modal ${name}`;
    
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
    
    modalContainer.appendChild(modal);
    
    const input = document.getElementById("energyInput");
    input.focus();
    
    document.getElementById("energyConfirm").onclick = () => {
      const value = parseInt(input.value);
      if (!isNaN(value) && value >= ENERGY_MIN && value <= ENERGY_MAX) {
        setEnergyLevel(value);
        playSound('success');
        document.activeElement.blur();
        modal.remove();
      } else {
        playSound('error');
        alert(`Введите число от ${ENERGY_MIN} до ${ENERGY_MAX}`);
      }
    };
    
    document.getElementById("energyCancel").onclick = () => modal.remove();
  } else if (name === "inventory") {
    window.inventoryManager.show();
  } else {
    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = "";
    const modal = document.createElement("div");
    modal.className = `modal ${name}`;
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;
    modalContainer.appendChild(modal);
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

// Инициализация игры
async function initGame() {
    console.log('Initializing game...');
    
    try {
        // Создаем экземпляр UserManager
        window.userManager = new UserManager();
        
        // TODO: Здесь будет реальная авторизация
        const userId = localStorage.getItem('userId') || 'test-user';
        
        // Авторизуем пользователя
        const loginSuccess = await window.userManager.login(userId);
        if (!loginSuccess) {
            throw new Error('Login failed');
        }

        // Загружаем сохраненное состояние
        loadGameState();
        
        // Инициализируем обработчики событий
        document.getElementById("inventory").onclick = () => openModal("inventory");
        document.getElementById("market").onclick = () => openModal("market");
        document.getElementById("mining").onclick = () => {
            playSound('click');
            if (window.miningModal) {
                window.miningModal.show();
            }
        };
        document.getElementById("home").onclick = () => {
            document.getElementById("modal-container").innerHTML = "";
        };
        document.getElementById("plusButton").onclick = () => openModal("energy");

        // Настраиваем масштабирование
        scaleGame();
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", scaleGame);
        }
        window.addEventListener("resize", handleResize);
        
        // Инициализируем загрузчик ресурсов
        initLoader(onResourcesLoaded);
        
    } catch (error) {
        console.error('Game initialization error:', error);
        alert('Failed to initialize game. Please refresh the page.');
    }
}

// Callback после загрузки ресурсов
function onResourcesLoaded(cache) {
    console.log('Resources loaded, starting game...');
    
    // Скрываем экран загрузки
    document.getElementById('loading-screen').style.display = 'none';
    document.querySelector('.wrapper').style.display = 'block';
    
    // Инициализируем менеджеры
    window.toolSlotManager = new ToolSlotManager();
    window.inventoryManager = new InventoryManager();
    
    // Обновляем отображение ресурсов
    updateResourceDisplay();
    
    // Запускаем автосохранение
    setInterval(() => {
        window.userManager.saveProgress();
    }, 60000); // Каждую минуту
}

// Обновление отображения ресурсов
function updateResourceDisplay() {
    const resources = window.userManager.userProgress.resources;
    
    document.getElementById('fel').textContent = resources.FEL;
    document.getElementById('irid').textContent = resources.MITHRIL;
    document.getElementById('rubid').textContent = resources.RUBIDIUM;
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