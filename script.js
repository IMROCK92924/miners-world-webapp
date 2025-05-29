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

function openModal(name) {
  playSound('click');
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = "";
  const modal = document.createElement("div");
  modal.className = `modal ${name}`;
  
  if (name === "energy") {
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
  } else {
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;
  }

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modalContainer.appendChild(modal);
  
  if (name === "energy") {
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
function initGame(resourceCache) {
  // Инициализируем звуки
  sounds.click = resourceCache.sounds['assets/sounds/click.mp3'];
  sounds.success = resourceCache.sounds['assets/sounds/success.mp3'];
  sounds.error = resourceCache.sounds['assets/sounds/error.mp3'];

  // Скрываем экран загрузки и показываем игру
  document.getElementById('loading-screen').style.display = 'none';
  document.querySelector('.wrapper').style.display = 'block';

  // Загружаем сохраненное состояние
  loadGameState();
  
  // Инициализируем обработчики событий
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick = () => openModal("market");
  document.getElementById("mining").onclick = () => openModal("mining");
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
  
  // Интеграция с Telegram WebApp
  if (window.Telegram?.WebApp?.expand) {
    Telegram.WebApp.expand();
    setTimeout(scaleGame, 200);
  }
}

// Запускаем загрузку ресурсов при загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
  window.initLoader(initGame);
});