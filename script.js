// Выполняем скрипт, когда весь HTML загружен
document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("modal-container");

  // === МОДАЛКИ ===

  /**
   * Открывает модальное окно по имени (market, inventory, mining)
   * @param {string} name - имя модалки (для загрузки соответствующего изображения)
   */
  function openModal(name) {
    // Удаляем предыдущее окно, если оно было
    modalContainer.innerHTML = "";

    // Создаём div и задаём стили
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;

    // Закрытие модалки по клику
    modal.onclick = () => modal.remove();

    // Вставляем модалку в контейнер
    modalContainer.appendChild(modal);
  }

  // === ПРИВЯЗКА КНОПОК ===

  // Кнопки, открывающие модалки
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick   = () => openModal("market");
  document.getElementById("mining").onclick   = () => openModal("mining");

  // Кнопка "домой" — закрывает модалку
  document.getElementById("home").onclick = () => {
    modalContainer.innerHTML = "";
  };

  // === МАСШТАБИРОВАНИЕ ===

  /**
   * Масштабирует игру под размер Telegram WebView
   */
  function scaleGame() {
    const designWidth = 390;   // ширина макета
    const designHeight = 844;  // высота макета

    // Получаем высоту экрана (стабильную) или fallback на окно
    const viewportHeight = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--tg-viewport-stable-height')
    ) || window.innerHeight;

    const actualWidth = window.innerWidth;

    // Вычисляем масштаб по ширине и высоте
    const scaleX = actualWidth / designWidth;
    const scaleY = viewportHeight / designHeight;
    const scale = Math.min(scaleX, scaleY); // Берём наименьший масштаб, чтобы всё поместилось

    const box = document.querySelector('.scale-box');
    box.style.transform = `scale(${scale})`;

    // Центрируем .scale-box по экрану
    box.style.left = `${(actualWidth - designWidth * scale) / 2}px`;
    box.style.top  = `${(viewportHeight - designHeight * scale) / 2}px`;
  }

  // Масштабируем при загрузке
  if (window.Telegram?.WebApp?.expand) {
    Telegram.WebApp.expand(); // Telegram растягивает WebView
  }

  scaleGame(); // Первый вызов

  // При изменении размера окна — масштабируем заново
  window.addEventListener('resize', scaleGame);
});
