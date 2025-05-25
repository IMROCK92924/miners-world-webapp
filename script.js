function setEnergyLevel(level) {
  if (level < 0) level = 0;
  if (level > 10) level = 10;
  document.getElementById("energyBar").src = `assets/energy/energy_${level}.png`;
}

function openModal(name) {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = "";

  const modal = document.createElement("div");
  modal.className = "modal";

  if (name === "energy") {
    // ✅ Убираем лишние экранирования `\` в шаблонной строке
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

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modalContainer.appendChild(modal);

  if (name === "energy") {
    document.getElementById("energyConfirm").onclick = () => {
      const value = parseInt(document.getElementById("energyInput").value);
      if (!isNaN(value)) {
        setEnergyLevel(value);
        document.activeElement.blur();
        modal.remove();
      } else {
        alert("Enter valid number (0–10)");
      }
    };
    document.getElementById("energyCancel").onclick = () => modal.remove();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("inventory").onclick = () => openModal("inventory");
  document.getElementById("market").onclick = () => openModal("market");
  document.getElementById("mining").onclick = () => openModal("mining");
  document.getElementById("home").onclick = () => {
    document.getElementById("modal-container").innerHTML = "";
  };
  document.getElementById("plusButton").onclick = () => openModal("energy");

  setEnergyLevel(3);

  function scaleGame() {
    const designWidth = 720;
    const designHeight = 1480;
    const viewportHeight = window.innerHeight;
    const actualWidth = window.innerWidth;
    const scaleX = actualWidth / designWidth;
    const scaleY = viewportHeight / designHeight;
    const scale = Math.min(scaleX, scaleY);

    const game = document.querySelector('.game');
    game.style.transform = `scale(${scale})`;
    game.style.transformOrigin = 'top left';
  }

  if (window.Telegram?.WebApp?.expand) Telegram.WebApp.expand();

  scaleGame();
  window.addEventListener('resize', scaleGame);
});
