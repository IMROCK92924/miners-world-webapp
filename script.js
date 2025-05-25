document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("modal-container");

  // === МОДАЛКИ ===
  function openModal(name) {
    modalContainer.innerHTML = "";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;

    modal.onclick = () => modal.remove();
    modalContainer.appendChild(modal);
  }

  // Привязка кнопок
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick    = () => openModal("market");
  document.getElementById("mining").onclick    = () => openModal("mining");
  document.getElementById("home").onclick      = () => modalContainer.innerHTML = "";

  // === АДАПТИВНОЕ МАСШТАБИРОВАНИЕ ===
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

function setEnergyLevel(level) {
  if (level < 0) level = 0;
  if (level > 10) level = 10;

  const energyBar = document.getElementById("energyBar");
  energyBar.src = `assets/energy/energy_${level}.png`;
}

// пример:
setEnergyLevel(3); // 30% энергии

document.getElementById("plusButton").addEventListener("click", () => {
  // Открыть модалку
  openModal("energy");

  // showEnergyModal(); — если модалка уже есть
});
