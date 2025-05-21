function showScreen(name) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => (screen.style.display = 'none'));
  const target = document.getElementById(name);
  if (target) {
    target.style.display = 'block';
  }
}
