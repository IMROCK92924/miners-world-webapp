console.log('loading.js: Starting initialization');

// Категории ресурсов
const RESOURCE_CATEGORIES = {
  interface: ['btn_', 'modal_'],
  graphics: ['background', 'energy_'],
  sounds: ['.mp3', '.wav']
};

// Ресурсы для предзагрузки
const RESOURCES = {
  images: [
    'assets/background.png',
    'assets/ui/plus.png',
    'assets/btn_home.png',
    'assets/btn_inventory.png',
    'assets/btn_market.png',
    'assets/btn_mining.png',
    'assets/modal_energy.png',
    'assets/modal_inventory.png',
    'assets/modal_market.png',
    'assets/modal_mining.png',
    ...Array.from({length: 11}, (_, i) => `assets/energy/energy_${i}.png`)
  ],
  sounds: []
};

// Загрузчик ресурсов
class ResourceLoader {
  constructor(onComplete) {
    this.totalResources = RESOURCES.images.length + RESOURCES.sounds.length;
    this.loadedResources = 0;
    this.currentCategory = '';
    this.cache = {
      images: {},
      sounds: {}
    };
    this.onComplete = onComplete;
    console.log('Инициализация загрузчика. Всего ресурсов:', this.totalResources);
  }

  getResourceCategory(src) {
    for (const [category, patterns] of Object.entries(RESOURCE_CATEGORIES)) {
      if (patterns.some(pattern => src.includes(pattern))) {
        return category;
      }
    }
    return 'graphics'; // По умолчанию
  }

  updateLoadingDetails(src) {
    const details = document.getElementById('loading-details');
    if (details) {
      const fileName = src.split('/').pop();
      details.textContent = `Загрузка: ${fileName}`;
    }

    const category = this.getResourceCategory(src);
    if (category !== this.currentCategory) {
      // Обновляем активную категорию
      document.querySelectorAll('.loading-category').forEach(el => {
        el.classList.remove('active');
      });
      const categoryEl = document.getElementById(`cat-${category}`);
      if (categoryEl) {
        categoryEl.classList.add('active');
      }
      this.currentCategory = category;
    }
  }

  updateProgress() {
    const progress = Math.round((this.loadedResources / this.totalResources) * 100);
    console.log('Прогресс загрузки:', progress + '%');
    
    const progressElement = document.getElementById('loading-progress');
    const barElement = document.querySelector('.loading-bar');
    
    if (progressElement && barElement) {
      progressElement.textContent = `${progress}%`;
      barElement.style.width = `${progress}%`;
    } else {
      console.error('Не найдены элементы прогресса загрузки');
    }
    
    if (progress === 100) {
      console.log('Загрузка завершена');
      document.getElementById('loading-details').textContent = 'Загрузка завершена!';
      setTimeout(() => {
        if (typeof this.onComplete === 'function') {
          this.onComplete(this.cache);
        }
      }, 500);
    }
    
    return progress === 100;
  }

  loadImage(src) {
    console.log('Загрузка изображения:', src);
    this.updateLoadingDetails(src);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('Изображение загружено:', src);
        this.cache.images[src] = img;
        this.loadedResources++;
        this.updateProgress();
        resolve(img);
      };
      img.onerror = (error) => {
        console.error('Ошибка загрузки изображения:', src, error);
        this.loadedResources++;
        this.updateProgress();
        reject(error);
      };
      img.src = src;
    });
  }

  loadSound(src) {
    console.log('Загрузка звука:', src);
    this.updateLoadingDetails(src);
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        console.log('Звук загружен:', src);
        this.cache.sounds[src] = audio;
        this.loadedResources++;
        this.updateProgress();
        resolve(audio);
      };
      audio.onerror = (error) => {
        console.error('Ошибка загрузки звука:', src, error);
        this.loadedResources++;
        this.updateProgress();
        reject(error);
      };
      audio.src = src;
    });
  }

  async loadAll() {
    console.log('Начало загрузки всех ресурсов');
    document.getElementById('loading-details').textContent = 'Подготовка ресурсов...';
    
    try {
      const imagePromises = RESOURCES.images.map(src => 
        this.loadImage(src).catch(error => {
          console.error('Ошибка загрузки ресурса:', src, error);
          return null;
        })
      );
      const soundPromises = RESOURCES.sounds.map(src => 
        this.loadSound(src).catch(error => {
          console.error('Ошибка загрузки ресурса:', src, error);
          return null;
        })
      );
      
      const results = await Promise.all([...imagePromises, ...soundPromises]);
      const failedResources = results.filter(r => r === null).length;
      
      if (failedResources > 0) {
        console.warn(`Загрузка завершена с ${failedResources} ошибками`);
      } else {
        console.log('Все ресурсы успешно загружены');
      }
      
      return true;
    } catch (error) {
      console.error('Критическая ошибка загрузки:', error);
      return false;
    }
  }
}

// Функция инициализации загрузчика
function initLoader(onComplete) {
  console.log('Инициализация загрузчика ресурсов');
  const loader = new ResourceLoader(onComplete);
  loader.loadAll().catch(error => {
    console.error('Ошибка инициализации загрузчика:', error);
    alert('Ошибка загрузки ресурсов. Пожалуйста, обновите страницу.');
  });
}

// Экспортируем функцию для использования в основном скрипте
window.initLoader = initLoader; 