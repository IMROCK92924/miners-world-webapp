// Управление звуками
class SoundManager {
    constructor() {
        // Инициализируем звуки в глобальном объекте
        window.sounds = {
            click: new Audio('assets/sounds/button-click.mp3'),
            success: new Audio('assets/sounds/success.mp3'),
            error: new Audio('assets/sounds/error.mp3')
        };
        
        // Предзагрузка звуков
        Object.values(window.sounds).forEach(audio => {
            audio.load();
        });
    }

    playSound(soundName) {
        const sound = window.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.log('Error playing sound:', error);
            });
        }
    }
}

// Создаем глобальный экземпляр менеджера звуков
window.soundManager = new SoundManager();

// Добавляем обработчики на все кнопки
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            window.soundManager.playSound('click');
        });
    });
}); 