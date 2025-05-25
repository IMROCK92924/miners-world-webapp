// === МОДАЛКИ ===
function openModal(name) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = "";

  const modal = document.createElement("div");
  modal.className = "modal";

  // Добавим доп.класс для energy
  if (name === "energy") {
    modal.classList.add("energy");
  }

  modal.style.backgroundImage = `url('assets/modal_${name}.png')`;

  // Закрытие по клику
  modal.onclick = () => modal.remove();

  modalContainer.appendChild(modal);
}

// === Установка энергии ===
function setEnergyLevel(level) {
  if (level < 0) level = 0;
  if (level > 10) level = 10;

  const energyBar = document.getElementById("energyBar");
  energyBar.src = `assets/energy/energy_${level}.png`;
}

// === Основной запуск ===
document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("modal-container");

  // Привязка кнопок к модалкам
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick    = () => openModal("market");
  document.getElementById("mining").onclick    = () => openModal("mining");
  document.getElementById("home").onclick      = () => modalContainer.innerHTML = "";
  document.getElementById("plusButton").onclick = () => openModal("energy");

  // Пример стартового уровня энергии
  setEnergyLevel(3); // 30%

  // === Адаптивное масштабирование ===
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
    const scale = Math.min(scaleX, scaleY); // минимальный масштаб

    const box = document.querySelector('.scale-box');
    box.style.transform = `scale(${scale})`;
    box.style.left = `${(actualWidth - designWidth * scale) / 2}px`;
    box.style.top  = `${(viewportHeight - designHeight * scale) / 2}px`;
  }

  if (window.Telegram?.WebApp?.expand) Telegram.WebApp.expand();
  scaleGame();
  window.addEventListener('resize', scaleGame);
});
