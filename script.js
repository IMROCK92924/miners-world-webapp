// Устанавливает значение энергии (0–10)
function setEnergyLevel(level) {
  if (level < 0) level = 0;
  if (level > 10) level = 10;
  document.getElementById("energyBar").src = `assets/energy/energy_${level}.png`;
}

// Открывает модалку по имени (inventory, market, energy)
function openModal(name) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = "";

  const modal = document.createElement("div");
  modal.className = "modal";

  if (name === "energy") {
    modal.classList.add("energy");

    // Вставляем поле + две кнопки
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

  // Закрытие при клике вне окна
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modalContainer.appendChild(modal);

  // Обработка кнопок energy-модалки
  if (name === "energy") {
    const input = () => parseInt(document.getElementById("energyInput").value);

    document.getElementById("energyConfirm").onclick = () => {
      const value = input();
      if (!isNaN(value)) {
        setEnergyLevel(value);
        modal.remove();
      } else {
        alert("Enter valid number (0–10)");
      }
    };

    document.getElementById("energyCancel").onclick = () => modal.remove();
  }
}

// После загрузки страницы — привязываем кнопки
document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("modal-container");

  // Кнопки
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick = () => openModal("market");
  document.getElementById("mining").onclick = () => openModal("mining");
  document.getElementById("home").onclick = () => modalContainer.innerHTML = "";
  document.getElementById("plusButton").onclick = () => openModal("energy");

  // Стартовое значение энергии
  setEnergyLevel(3);

  // Адаптивное масштабирование под экран
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
    box.style.top = `${(viewportHeight - designHeight * scale) / 2}px`;
  }

  if (window.Telegram?.WebApp?.expand) Telegram.WebApp.expand();
  scaleGame();
  window.addEventListener('resize', scaleGame);
});
