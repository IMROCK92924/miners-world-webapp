// Выполняем код после полной загрузки HTML-документа
document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("modal-container");

  // === МОДАЛЬНЫЕ ОКНА ===

  /**
   * Открывает модальное окно (по имени: market, inventory, mining)
   * @param {string} name - имя окна
   */
  function openModal(name) {
    // Удаляем старое окно
    modalContainer.innerHTML = "";

    // Создаём новое окно
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;

    // Закрытие при клике
    modal.onclick = () => modal.remove();

    // Добавляем модалку в контейнер
    modalContainer.appendChild(modal);
  }

  // === КНОПКИ ===

  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick    = () => openModal("market");
  document.getElementById("mining").onclick    = () => openModal("mining");

  // Кнопка "домой" — закрывает все модалки
  document.getElementById("home").onclick = () => {
    modalContainer.innerHTML = "";
  };

  // === МАСШТАБИРОВАНИЕ ===

  /**
   * Масштабирует .scale-box под размер Telegram WebView
   */
  function scaleGame() {
    const designWidth = 752;    // 👈 ширина под Telegram Desktop
    const designHeight = 1360;  // 👈 высота под Telegram Desktop

    const viewportHeight = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--tg-viewport-stable-height')
    ) || window.innerHeight;

    const actualWidth = window.innerWidth;

    const scaleX = actualWidth / designWidth;
    const scaleY = viewportHeight / designHeight;
    const scale = Math.min(scaleX, scaleY); // Чтобы вся сцена влезла

    const box = document.querySelector('.scale-box');
    box.style.transform = `scale(${scale})`;

    // Центровка .scale-box по центру
    box.style.left = `${(actualWidth - designWidth * scale) / 2}px`;
    box.style.top  = `${(viewportHeight - designHeight * scale) / 2}px`;
  }

  // Растягиваем WebView в Telegram, если возможно
  if (window.Telegram?.WebApp?.expand) {
    Telegram.WebApp.expand();
  }

  // Масштабируем при загрузке и изменении размеров окна
  scaleGame();
  window.addEventListener('resize', scaleGame);
});
