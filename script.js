document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("modal-container");

  function openModal(name) {
    // Удаляем старое окно
    modalContainer.innerHTML = "";

    // Создаём новое модальное окно
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;

    // Закрытие по клику
    modal.onclick = () => modal.remove();

    // Добавляем в контейнер
    modalContainer.appendChild(modal);
  }

  // Привязка к кнопкам
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick = () => openModal("market");
  document.getElementById("mining").onclick = () => openModal("mining");

  // Кнопка HOME — закрывает модалку
  document.getElementById("home").onclick = () => {
    modalContainer.innerHTML = "";
  };
});
