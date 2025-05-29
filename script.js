// === Управление энергией ===
function setEnergyLevel(level) {
  // Ограничение уровня энергии от 0 до 10
  if (level < 0) level = 0;
  if (level > 10) level = 10;
  document.getElementById("energyBar").src = `assets/energy/energy_${level}.png`;
}

// === Управление модальными окнами ===
function openModal(name) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = ""; // Очистка предыдущих модалок
  const modal = document.createElement("div");
  modal.className = `modal ${name}`;

  // Настройка содержимого модалки
  if (name === "energy") {
    modal.innerHTML = `
      <input id="energyInput" class="energy-input" type="number" min="0" max="10" placeholder="0–10">
      <div class="modal-buttons">
        <button id="energyConfirm">OK</button>
        <button id="energyCancel" class="cancel">CANCEL</button>
      </div>
    `;
  } else {
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;
  }

  // Закрытие модалки при клике на фон
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modalContainer.appendChild(modal);

  // Обработчики для модалки энергии
  if (name === "energy") {
    document.getElementById("energyConfirm").onclick = () => {
      const value = parseInt(document.getElementById("energyInput").value);
      if (!isNaN(value)) {
        setEnergyLevel(value);
        document.activeElement.blur(); // Скрыть клавиатуру
        modal.remove();
      } else {
        alert("Enter valid number (0–10)");
      }
    };
    document.getElementById("energyCancel").onclick = () => modal.remove();
  }
}

// === Масштабирование игровой сцены ===
let lastWidth; // Последняя ширина для обработки клавиатуры

function scaleGame() {
  // Базовые параметры дизайна
  const designWidth = 360;
  const designHeight = 740;
  
  // Получаем размеры экрана
  const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const actualWidth = window.innerWidth;
  
  // Расчет масштаба по ширине
  const scale = actualWidth / designWidth;
  const scaledHeight = designHeight * scale;
  
  // Применение масштабирования
  const game = document.querySelector('.game');
  game.style.transform = `scale(${scale})`;
  game.style.transformOrigin = 'top left';
  
  const box = document.querySelector('.scale-box');
  box.style.width = `${designWidth}px`;
  box.style.height = `${designHeight}px`;
  box.style.left = '0px';
  box.style.top = `${(viewportHeight - scaledHeight) / 2}px`;
  
  // Логи для отладки
  console.log(`Width: ${actualWidth}px, Height: ${viewportHeight}px, Scale: ${scale}, ScaledHeight: ${scaledHeight}px`);
}

function handleResize() {
  // Пропускаем обработку, если ширина не изменилась (например, открыта клавиатура)
  if (window.innerWidth === lastWidth) {
    return;
  }
  lastWidth = window.innerWidth;
  scaleGame();
}

// === Инициализация приложения ===
function initializeApp() {
  // Установка начального уровня энергии
  setEnergyLevel(3);
  
  // Обработчики кнопок
  document.getElementById("inventory").addEventListener("click", () => openModal("inventory"));
  document.getElementById("market").addEventListener("click", () => openModal("market"));
  document.getElementById("mining").addEventListener("click", () => openModal("mining"));
  document.getElementById("home").addEventListener("click", () => {
    document.getElementById("modal-container").innerHTML = "";
  });
  document.getElementById("plusButton").addEventListener("click", () => openModal("energy"));
  
  // Начальное масштабирование
  lastWidth = window.innerWidth;
  scaleGame();
  
  // Обработчики изменения размера окна
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scaleGame);
  }
  window.addEventListener("resize", handleResize);
  
  // Инициализация Telegram WebApp
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.expand(); // Развернуть приложение
    setTimeout(scaleGame, 100); // Задержка для корректной инициализации
  }
}

// Запуск приложения после загрузки
document.addEventListener("DOMContentLoaded", initializeApp);