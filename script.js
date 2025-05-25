// === Установка уровня энергии ===
// Принимает число от 0 до 10 и обновляет картинку энерго-бара
function setEnergyLevel(level) {
  if (level < 0) level = 0;
  if (level > 10) level = 10;

  const energyBar = document.getElementById("energyBar");
  energyBar.src = `assets/energy/energy_${level}.png`;
}

// === Функция открытия модального окна ===
function openModal(name) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = ""; // очищаем предыдущие модалки

  const modal = document.createElement("div");
  modal.className = "modal";

  // === Если это модалка пополнения энергии, вставим внутрь HTML ===
  if (name === "energy") {
    modal.classList.add("energy");
modal.style.backgroundImage = `url('assets/modal_energy.png')`;

    modal.innerHTML = `
      <div class="modal-energy-content">
        <div class="modal-energy-header">
          <img src="assets/ui/lightning.png" class="icon">
          <span>Пополнить энергию?</span>
        </div>
        <input type="number" id="energyInput" class="energy-input" min="1" max="10" placeholder="Введите число">
        <div class="modal-buttons">
          <button id="confirmEnergy" class="btn-confirm">ДА</button>
          <button id="cancelEnergy" class="btn-cancel">ОТМЕНА</button>
        </div>
      </div>
    `;
  } else {
    // Для обычных модалок — просто фон-картинка
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;
  }

  // Закрытие по клику на фон
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modalContainer.appendChild(modal);

  // === Поведение кнопок внутри модалки энергии ===
  if (name === "energy") {
    document.getElementById("confirmEnergy").onclick = () => {
      const value = parseInt(document.getElementById("energyInput").value);

      if (!isNaN(value)) {
        setEnergyLevel(value);
        alert(`Энергия пополнена на ${value}`);
        modal.remove();
      } else {
        alert("Введите корректное число!");
      }
    };

    document.getElementById("cancelEnergy").onclick = () => modal.remove();
  }
}

// === Основной запуск после загрузки страницы ===
document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("modal-container");

  // Привязываем кнопки к модалкам
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick    = () => openModal("market");
  document.getElementById("mining").onclick    = () => openModal("mining");
  document.getElementById("home").onclick      = () => modalContainer.innerHTML = "";
  document.getElementById("plusButton").onclick = () => openModal("energy"); // кнопка "+"

  // Стартовый уровень энергии
  setEnergyLevel(3); // 30%

  // === Масштабирование под экран ===
  function scaleGame() {
    const designWidth = 720;
    const designHeight = 1480;

    const viewportHeight = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--tg-viewport-stable-height')
    ) || window.innerHeight;

    const actualWidth = window.innerWidth;

    const scaleX = actualWidth / designWidth;
    const scaleY = viewportHeight / designHeight;
    const scale = Math.min(scaleX, scaleY);

    const box = document.querySelector('.scale-box');
    box.style.transform = `scale(${scale})`;
    box.style.left = `${(actualWidth - designWidth * scale) / 2}px`;
    box.style.top  = `${(viewportHeight - designHeight * scale) / 2}px`;
  }

  // Telegram WebApp авторазворачивание
  if (window.Telegram?.WebApp?.expand) Telegram.WebApp.expand();

  // Запускаем масштабирование и подписываемся на ресайз
  scaleGame();
  window.addEventListener('resize', scaleGame);
});
