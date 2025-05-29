// Управление звуками
class SoundManager {
    constructor() {
        this.sounds = {
            buttonClick: new Audio('assets/sounds/button-click.mp3')
        };
        
        // Предзагрузка звуков
        Object.values(this.sounds).forEach(audio => {
            audio.load();
        });
    }

    playButtonClick() {
        this.sounds.buttonClick.currentTime = 0; // Сброс времени для возможности быстрого повторного воспроизведения
        this.sounds.buttonClick.play().catch(error => {
            console.log('Error playing sound:', error);
        });
    }
}

// Создаем экземпляр менеджера звуков
const soundManager = new SoundManager();

// Добавляем обработчики на все кнопки
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            soundManager.playButtonClick();
        });
    });
}); 