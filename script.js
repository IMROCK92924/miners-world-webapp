// Устанавливает уровень энергии от 0 до 10
function setEnergyLevel(level) {
  if (level < 0) level = 0;
  if (level > 10) level = 10;

  const energyBar = document.getElementById("energyBar");
  energyBar.src = `assets/energy/energy_${level}.png`;
}

// Открывает модалку по имени (например, "inventory" или "energy")
function openModal(name) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = "";

  const modal = document.createElement("div");
  modal.className = "modal";

  if (name === "energy") {
    // Вставляем input и кнопки
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

  // Закрытие по клику вне модалки
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modalContainer.appendChild(modal);

  // Обработка кнопок, если это модалка энергии
  if (name === "energy") {
    const input = document.getElementById("energyInput");

    // OK
    document.getElementById("energyConfirm").onclick = () => {
      const value = parseInt(input.value);
      if (!isNaN(value)) {
        setEnergyLevel(value);
        input.blur(); // скрываем клавиатуру
        modal.remove();
      } else {
        alert("Enter valid number (0–10)");
      }
    };

    // CANCEL
    document.getElementById("energyCancel").onclick = () => modal.remove();
  }
}

// После загрузки страницы
document.addEventListener("DOMContentLoaded", () => {
  // Назначение кнопок
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick = () => openModal("market");
  document.getElementById("mining").onclick = () => openModal("mining");
  document.getElementById("home").onclick = () => {
    document.getElementById("modal-container").innerHTML = "";
  };
  document.getElementById("plusButton").onclick = () => openModal("energy");

  // Устанавливаем стартовое значение энергии
  setEnergyLevel(3);

  // Масштабирование .game
  function scaleGame() {
    const designWidth = 720;
    const designHeight = 1480;

    const actualWidth = window.innerWidth;
    const actualHeight = window.innerHeight;

    const scaleX = actualWidth / designWidth;
    const scaleY = actualHeight / designHeight;
    const scale = Math.min(scaleX, scaleY);

    const game = document.querySelector(".game");
    game.style.transform = `scale(${scale})`;
    game.style.transformOrigin = "top left";

    // Центрирование
    const box = document.querySelector(".scale-box");
    box.style.left = `${(actualWidth - designWidth * scale) / 2}px`;
    box.style.top = `${(actualHeight - designHeight * scale) / 2}px`;
  }

  // Telegram WebApp expand
  if (window.Telegram?.WebApp?.expand) Telegram.WebApp.expand();

  scaleGame();
  window.addEventListener("resize", scaleGame);
});
