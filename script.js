document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("modal-container");

  function openModal(name) {
    modalContainer.innerHTML = "";
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.backgroundImage = `url('assets/modal_${name}.png')`;
    modal.onclick = () => modal.remove();
    modalContainer.appendChild(modal);
  }

  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick = () => openModal("market");
  document.getElementById("mining").onclick = () => openModal("mining");

  // HOME — просто закрывает модалку
  document.getElementById("home").onclick = () => {
    modalContainer.innerHTML = "";
  };
});
