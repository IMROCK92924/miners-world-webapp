console.log('loading.js: Starting initialization');

// Resource categories
const RESOURCE_CATEGORIES = {
  interface: ['btn_', 'modal_'],
  graphics: ['background', 'energy_'],
  nft: ['nft/'],
  sounds: ['.mp3', '.wav']
};

// Критически важные ресурсы загружаем первыми
const CRITICAL_RESOURCES = [
  'assets/background.png',
  'assets/ui/plus.png',
  'assets/btn_market.png',
  'assets/btn_home.png',
  'assets/btn_inventory.png',
  'assets/btn_mining.png'
];

// Остальные ресурсы
const RESOURCES = {
  images: [
    // Энергия
    ...Array.from({length: 11}, (_, i) => `assets/energy/energy_${i}.png`),
    
    // Модальные окна
    'assets/modal_energy.png',
    'assets/modal_inventory.png',
    'assets/modal_market.png',
    'assets/modal_mining.png'
  ],
  nft: [],
  sounds: []
};

// Добавляем функцию проверки размера изображения
function checkImageSize(img) {
    return new Promise((resolve) => {
        if (img.complete) {
            resolve(img.naturalWidth * img.naturalHeight <= 4096 * 4096);
        } else {
            img.onload = () => resolve(img.naturalWidth * img.naturalHeight <= 4096 * 4096);
        }
    });
}

// Добавляем функцию оптимизации изображения
async function optimizeImage(img) {
    // Создаем canvas для изменения размера
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Максимальный размер для мобильных устройств
    const MAX_SIZE = 1024;
    
    // Вычисляем новые размеры, сохраняя пропорции
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    
    if (width > height) {
        if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
        }
    } else {
        if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
        }
    }
    
    // Устанавливаем размеры canvas
    canvas.width = width;
    canvas.height = height;
    
    // Рисуем изображение с новыми размерами
    ctx.drawImage(img, 0, 0, width, height);
    
    // Возвращаем оптимизированное изображение
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const optimizedUrl = URL.createObjectURL(blob);
            const optimizedImg = new Image();
            optimizedImg.src = optimizedUrl;
            optimizedImg.onload = () => resolve(optimizedImg);
        }, 'image/webp', 0.8); // Используем WebP с качеством 80%
    });
}

// Функция проверки доступности изображения
async function checkImageAvailability(src) {
    try {
        const response = await fetch(src, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error(`Image availability check failed for ${src}:`, error);
        return false;
    }
}

// Обновляем функцию предзагрузки изображения
async function preloadImage(src) {
    try {
        // Проверяем доступность изображения
        const isAvailable = await checkImageAvailability(src);
        if (!isAvailable) {
            console.error(`Image not available: ${src}`);
            throw new Error(`Image not available: ${src}`);
        }

        // Нормализуем путь к изображению
        const normalizedSrc = src.startsWith('http') ? src : new URL(src, window.location.origin).href;
        console.log('Loading image from:', normalizedSrc);

        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = async () => {
                try {
                    console.log(`Image loaded successfully: ${normalizedSrc}, size: ${img.naturalWidth}x${img.naturalHeight}`);
                    
                    // Проверяем размер изображения
                    const isSmallEnough = await checkImageSize(img);
                    
                    if (!isSmallEnough && /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        console.log('Optimizing large image for mobile:', normalizedSrc);
                        const optimizedImg = await optimizeImage(img);
                        resolve(optimizedImg);
                    } else {
                        resolve(img);
                    }
                } catch (error) {
                    console.error('Error processing image:', error);
                    resolve(img); // В случае ошибки возвращаем оригинальное изображение
                }
            };
            
            img.onerror = () => {
                const error = new Error(`Failed to load image: ${normalizedSrc}`);
                console.error(error);
                reject(error);
            };
            
            // Добавляем обработку таймаута
            const timeout = setTimeout(() => {
                img.src = ''; // Отменяем загрузку
                reject(new Error(`Timeout loading image: ${normalizedSrc}`));
            }, 10000);

            img.onload = () => {
                clearTimeout(timeout);
                resolve(img);
            };
            
            // Используем crossOrigin для изображений с других доменов
            if (normalizedSrc.startsWith('http') && !normalizedSrc.includes(window.location.origin)) {
                img.crossOrigin = 'anonymous';
            }
            
            // Добавляем случайный параметр для предотвращения кэширования
            img.src = `${normalizedSrc}?v=${Date.now()}`;
        });
    } catch (error) {
        console.error('Error in preloadImage:', error);
        throw error;
    }
}

// Resource loader
class ResourceLoader {
  constructor(onComplete) {
    this.totalResources = CRITICAL_RESOURCES.length + RESOURCES.images.length;
    this.loadedResources = 0;
    this.currentCategory = '';
    this.cache = {
      images: {},
      sounds: {},
      nft: {}
    };
    this.onComplete = onComplete;
    
    // Показываем основной экран загрузки
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
      loadingScreen.style.opacity = '1';
    }
  }

  getResourceCategory(src) {
    for (const [category, patterns] of Object.entries(RESOURCE_CATEGORIES)) {
      if (patterns.some(pattern => src.includes(pattern))) {
        return category;
      }
    }
    return 'graphics';
  }

  updateLoadingDetails(src) {
    const details = document.getElementById('loading-details');
    if (details) {
      const fileName = src.split('/').pop();
      details.textContent = `Loading: ${fileName}`;
    }

    const category = this.getResourceCategory(src);
    if (category !== this.currentCategory) {
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
    
    const progressElement = document.getElementById('loading-progress');
    const barElement = document.querySelector('.loading-bar');
    
    if (progressElement && barElement) {
      progressElement.textContent = `${progress}%`;
      barElement.style.width = `${progress}%`;
    }
    
    if (progress === 100) {
      document.getElementById('loading-details').textContent = 'Loading complete!';
      
      // Показываем игру
      const wrapper = document.querySelector('.wrapper');
      if (wrapper) {
        wrapper.style.display = 'block';
        wrapper.style.opacity = '1';
        wrapper.style.visibility = 'visible';
      }
      
      // Скрываем экраны загрузки
      const initialLoading = document.getElementById('initial-loading');
      const loadingScreen = document.getElementById('loading-screen');
      
      if (initialLoading) {
        initialLoading.style.opacity = '0';
        setTimeout(() => {
          initialLoading.style.display = 'none';
        }, 300);
      }
      
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 300);
      }
      
      if (typeof this.onComplete === 'function') {
        this.onComplete(this.cache);
      }
    }
  }

  async loadImage(src) {
    try {
      this.updateLoadingDetails(src);
      
      if (this.cache.images[src]) {
        return this.cache.images[src];
      }

      const img = new Image();
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout loading image: ${src}`));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
      });

      this.cache.images[src] = img;
      this.loadedResources++;
      this.updateProgress();
      return img;
    } catch (error) {
      console.error('Error loading image:', src, error);
      this.loadedResources++;
      this.updateProgress();
      return null;
    }
  }

  async loadSound(src) {
    try {
      this.updateLoadingDetails(src);
      
      const audio = new Audio();
      
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
        audio.src = src;
      });

      console.log('Sound loaded successfully:', src);
      this.cache.sounds[src] = audio;
      this.loadedResources++;
      this.updateProgress();
      return audio;
      
    } catch (error) {
      console.error('Error loading sound:', src, error);
      this.loadedResources++;
      this.updateProgress();
      return null;
    }
  }

  async loadAll() {
    try {
      // Загружаем критически важные ресурсы последовательно
      for (const src of CRITICAL_RESOURCES) {
        await this.loadImage(src);
      }

      // Загружаем остальные ресурсы параллельно
      await Promise.all(RESOURCES.images.map(src => this.loadImage(src)));

      return true;
    } catch (error) {
      console.error('Loading error:', error);
      return false;
    }
  }
}

// Инициализация загрузчика
function initLoader(onComplete) {
  console.log('Initializing resource loader...');
  const loader = new ResourceLoader(onComplete);
  loader.loadAll().catch(error => {
    console.error('Loader error:', error);
  });
}

window.initLoader = initLoader; 