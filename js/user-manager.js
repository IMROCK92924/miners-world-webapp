class UserManager {
    constructor() {
        this.currentUser = null;
        this.userInventory = null;
        this.userProgress = null;
    }

    // Авторизация пользователя
    async login(userId) {
        try {
            // Здесь будет запрос к серверу для получения данных пользователя
            const userData = await this.fetchUserData(userId);
            this.currentUser = userData;
            this.userInventory = new UserInventory(userData.inventory);
            this.userProgress = new UserProgress(userData.progress);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    // Получение данных пользователя с сервера
    async fetchUserData(userId) {
        // TODO: Заменить на реальный API-запрос
        return {
            id: userId,
            inventory: [],
            progress: {
                resources: {
                    FEL: 0,
                    MITHRIL: 0,
                    RUBIDIUM: 0
                },
                energy: 100,
                level: 1
            }
        };
    }

    // Сохранение прогресса пользователя
    async saveProgress() {
        if (!this.currentUser) return;

        try {
            // TODO: Заменить на реальный API-запрос
            await this.sendToServer({
                userId: this.currentUser.id,
                inventory: this.userInventory.getItems(),
                progress: this.userProgress.getData()
            });
        } catch (error) {
            console.error('Save progress error:', error);
        }
    }

    // Отправка данных на сервер
    async sendToServer(data) {
        // TODO: Реализовать реальную отправку на сервер
        console.log('Saving data to server:', data);
    }
}

// Класс для управления инвентарем пользователя
class UserInventory {
    constructor(initialItems = []) {
        this.items = new Map();
        this.initializeItems(initialItems);
    }

    initializeItems(items) {
        items.forEach(item => {
            this.items.set(item.id, {
                ...NFTManager.getNFTById(item.id),
                ...item // Перезаписываем базовые параметры пользовательскими
            });
        });
    }

    addItem(nftId) {
        const baseNFT = NFTManager.getNFTById(nftId);
        if (!baseNFT) return false;

        const userNFT = {
            ...baseNFT,
            acquiredAt: Date.now(),
            durability: { ...baseNFT.durability }
        };

        this.items.set(nftId, userNFT);
        this.saveInventory();
        return true;
    }

    removeItem(nftId) {
        const removed = this.items.delete(nftId);
        if (removed) {
            this.saveInventory();
        }
        return removed;
    }

    getItems() {
        return Array.from(this.items.values());
    }

    async saveInventory() {
        if (window.userManager) {
            await window.userManager.saveProgress();
        }
    }
}

// Класс для управления прогрессом пользователя
class UserProgress {
    constructor(initialProgress) {
        this.resources = initialProgress.resources || {
            FEL: 0,
            MITHRIL: 0,
            RUBIDIUM: 0
        };
        this.energy = initialProgress.energy || 100;
        this.level = initialProgress.level || 1;
        this.lastSave = Date.now();
    }

    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            this.resources[type] += amount;
            this.scheduleAutoSave();
        }
    }

    useEnergy(amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            this.scheduleAutoSave();
            return true;
        }
        return false;
    }

    getData() {
        return {
            resources: { ...this.resources },
            energy: this.energy,
            level: this.level
        };
    }

    scheduleAutoSave() {
        const now = Date.now();
        if (now - this.lastSave > 5000) { // Автосохранение каждые 5 секунд
            this.lastSave = now;
            if (window.userManager) {
                window.userManager.saveProgress();
            }
        }
    }
}

// Экспортируем менеджер пользователей
window.UserManager = UserManager; 