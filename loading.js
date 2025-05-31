console.log('loading.js: Starting initialization');

// Resource categories
const RESOURCE_CATEGORIES = {
  interface: ['btn_', 'modal_'],
  graphics: ['background', 'energy_'],
  nft: ['nft/'],
  sounds: ['.mp3', '.wav']
};

// Resources to preload
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
    this.nftLoaded = false;
    this.totalResources = RESOURCES.images.length + RESOURCES.sounds.length;
    this.loadedResources = 0;
    this.currentCategory = '';
    this.cache = {
      images: {},
      sounds: {},
      nft: {}
    };
    this.onComplete = onComplete;
    this.startTime = Date.now();
    this.minLoadingTime = 3000; // Minimum loading time - 3 seconds
    console.log('Loader initialized. Total resources:', this.totalResources);
  }

  getResourceCategory(src) {
    for (const [category, patterns] of Object.entries(RESOURCE_CATEGORIES)) {
      if (patterns.some(pattern => src.includes(pattern))) {
        return category;
      }
    }
    return 'graphics'; // Default
  }

  updateLoadingDetails(src) {
    const details = document.getElementById('loading-details');
    if (details) {
      const fileName = src.split('/').pop();
      details.textContent = `Loading: ${fileName}`;
    }

    const category = this.getResourceCategory(src);
    if (category !== this.currentCategory) {
      // Update active category
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
    console.log('Loading progress:', progress + '%');
    
    const progressElement = document.getElementById('loading-progress');
    const barElement = document.querySelector('.loading-bar');
    
    if (progressElement && barElement) {
      progressElement.textContent = `${progress}%`;
      barElement.style.width = `${progress}%`;
    } else {
      console.error('Progress elements not found');
    }
    
    if (progress === 100) {
      console.log('Loading complete');
      document.getElementById('loading-details').textContent = 'Loading complete!';
      
      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        if (typeof this.onComplete === 'function') {
          this.onComplete(this.cache);
        }
      }, remainingTime);
    }
    
    return progress === 100;
  }

  async loadImage(src) {
    console.log('Loading image:', src);
    this.updateLoadingDetails(src);
    
    try {
      // Проверяем наличие изображения в кэше
      if (this.cache.images[src]) {
        console.log('Image found in cache:', src);
        return this.cache.images[src];
      }

      const img = await preloadImage(src);
      
      if (img) {
        console.log('Image loaded and cached:', src);
        this.cache.images[src] = img;
        this.loadedResources++;
        this.updateProgress();
        return img;
      } else {
        throw new Error('Image loading failed');
      }
    } catch (error) {
      console.error('Error loading image:', src, error);
      
      // Для NFT изображений пробуем загрузить резервное изображение
      if (src.includes('/nft/')) {
        console.log('Attempting to load fallback image for NFT');
        try {
          // Пробуем разные форматы
          const formats = ['webp', 'png', 'jpg'];
          for (const format of formats) {
            const fallbackSrc = `assets/nft/fallback.${format}`;
            try {
              const fallbackImg = await preloadImage(fallbackSrc);
              if (fallbackImg) {
                this.cache.images[src] = fallbackImg;
                break;
              }
            } catch (e) {
              console.log(`Failed to load ${format} fallback`);
            }
          }
        } catch (fallbackError) {
          console.error('All fallback image attempts failed:', fallbackError);
        }
      }
      
      this.loadedResources++;
      this.updateProgress();
      return null;
    }
  }

  loadSound(src) {
    console.log('Loading sound:', src);
    this.updateLoadingDetails(src);
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        console.log('Sound loaded:', src);
        this.cache.sounds[src] = audio;
        this.loadedResources++;
        this.updateProgress();
        resolve(audio);
      };
      audio.onerror = (error) => {
        console.error('Error loading sound:', src, error);
        this.loadedResources++;
        this.updateProgress();
        reject(error);
      };
      audio.src = src;
    });
  }

  async loadNFTImages() {
    try {
      console.log('Starting NFT images loading...');
      
      // Загружаем только NFT из инвентаря пользователя и базовые NFT
      const userNFTs = window.userManager?.userInventory?.getItems() || [];
      const nftIds = new Set(userNFTs.map(nft => nft.id));
      
      // Получаем все NFT из конфигурации
      const allNFTs = window.NFTManager.getAllNFTs();
      
      // Фильтруем NFT: берем все common и те, что есть у пользователя
      const availableNFTs = allNFTs.filter(nft => 
        nft.rarity === 'common' || nftIds.has(nft.id)
      );
      
      RESOURCES.nft = availableNFTs.map(nft => nft.image);
      this.totalResources += RESOURCES.nft.length;
      
      console.log('NFT config loaded, total NFTs:', RESOURCES.nft.length);
      
      // На мобильных устройствах загружаем по одному
      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const batchSize = isMobile ? 1 : 3;
      
      for (let i = 0; i < RESOURCES.nft.length; i += batchSize) {
        const batch = RESOURCES.nft.slice(i, i + batchSize);
        console.log(`Loading NFT batch ${i/batchSize + 1} of ${Math.ceil(RESOURCES.nft.length/batchSize)}`);
        
        try {
          const results = await Promise.all(
            batch.map(async nftPath => {
              try {
                return await this.loadImage(nftPath);
              } catch (error) {
                console.error(`Failed to load NFT: ${nftPath}`, error);
                return null;
              }
            })
          );
          
          console.log(`Batch ${i/batchSize + 1} results:`, results);
          
          // На мобильных устройствах делаем паузу между загрузками
          if (isMobile) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (batchError) {
          console.error(`Error loading batch ${i/batchSize + 1}:`, batchError);
        }
      }
      
      this.nftLoaded = true;
      console.log('All NFT images loading completed');
    } catch (error) {
      console.error('Error in loadNFTImages:', error);
      this.nftLoaded = true;
    }
  }

  async loadAll() {
    console.log('Starting to load all resources');
    document.getElementById('loading-details').textContent = 'Preparing resources...';
    
    try {
      const [basicResourcesResult] = await Promise.all([
        Promise.all([
          ...RESOURCES.images.map(src => 
            this.loadImage(src).catch(error => {
              console.error('Resource loading error:', src, error);
              return null;
            })
          ),
          ...RESOURCES.sounds.map(src => 
            this.loadSound(src).catch(error => {
              console.error('Resource loading error:', src, error);
              return null;
            })
          )
        ]),
        this.loadNFTImages()
      ]);

      const failedResources = basicResourcesResult.filter(r => r === null).length;
      
      if (failedResources > 0) {
        console.warn(`Loading completed with ${failedResources} errors`);
      } else {
        console.log('All resources loaded successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Critical loading error:', error);
      return false;
    }
  }
}

// Loader initialization function
function initLoader(onComplete) {
  console.log('Initializing resource loader');
  const loader = new ResourceLoader(onComplete);
  loader.loadAll().catch(error => {
    console.error('Loader initialization error:', error);
    alert('Resource loading error. Please refresh the page.');
  });
}

// Export function for use in main script
window.initLoader = initLoader; 