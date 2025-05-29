console.log('loading.js: Starting initialization');

// Resource categories
const RESOURCE_CATEGORIES = {
  interface: ['btn_', 'modal_'],
  graphics: ['background', 'energy_'],
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
  sounds: []
};

// Resource loader
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
      
      // Check if minimum loading time has passed
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

  loadImage(src) {
    console.log('Loading image:', src);
    this.updateLoadingDetails(src);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded:', src);
        this.cache.images[src] = img;
        this.loadedResources++;
        this.updateProgress();
        resolve(img);
      };
      img.onerror = (error) => {
        console.error('Error loading image:', src, error);
        this.loadedResources++;
        this.updateProgress();
        reject(error);
      };
      img.src = src;
    });
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

  async loadAll() {
    console.log('Starting to load all resources');
    document.getElementById('loading-details').textContent = 'Preparing resources...';
    
    try {
      const imagePromises = RESOURCES.images.map(src => 
        this.loadImage(src).catch(error => {
          console.error('Resource loading error:', src, error);
          return null;
        })
      );
      const soundPromises = RESOURCES.sounds.map(src => 
        this.loadSound(src).catch(error => {
          console.error('Resource loading error:', src, error);
          return null;
        })
      );
      
      const results = await Promise.all([...imagePromises, ...soundPromises]);
      const failedResources = results.filter(r => r === null).length;
      
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