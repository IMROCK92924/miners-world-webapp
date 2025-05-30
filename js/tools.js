// Конфигурация слотов
const INITIAL_SLOTS = 1; // Начальное количество слотов

// Класс для управления слотами инструментов
class ToolSlotManager {
    constructor() {
        this.container = document.querySelector('.mining-container');
        this.slots = [];
        this.activeSlots = 0; // Количество заполненных слотов
        this.initializeSlots();
    }

    // Инициализация начальных слотов
    initializeSlots() {
        this.createEmptySlot(); // Создаем первый слот
    }

    // Создание пустого слота
    createEmptySlot() {
        const slot = document.createElement('div');
        slot.className = 'tool-slot empty';
        
        const addButton = document.createElement('button');
        addButton.className = 'add-tool-btn';
        addButton.textContent = '+';
        addButton.addEventListener('click', () => this.handleAddTool(slot));
        
        slot.appendChild(addButton);
        this.container.appendChild(slot);
        this.slots.push(slot);
    }

    // Обработчик нажатия на кнопку добавления инструмента
    handleAddTool(slot) {
        document.getElementById('inventory').click();
    }

    // Добавление инструмента в слот
    addToolToSlot(slot, toolData) {
        slot.className = 'tool-slot active';
        slot.innerHTML = '';

        const content = document.createElement('div');
        content.className = 'tool-content';
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'tool-image-container';
        const img = document.createElement('img');
        img.src = toolData.image;
        img.alt = toolData.name;
        imageContainer.appendChild(img);
        
        const info = document.createElement('div');
        info.className = 'tool-info';
        
        const header = document.createElement('div');
        header.className = 'tool-header';
        
        const name = document.createElement('div');
        name.className = 'tool-name';
        name.textContent = toolData.name;
        
        const rarity = document.createElement('div');
        rarity.className = `tool-rarity ${toolData.rarity.toLowerCase()}`;
        rarity.textContent = toolData.rarity;
        
        header.appendChild(name);
        header.appendChild(rarity);
        
        const stats = document.createElement('div');
        stats.className = 'tool-stats';
        
        const harvestTime = document.createElement('div');
        harvestTime.className = 'stat-item';
        harvestTime.innerHTML = `
            <span class="stat-label">Harvest Time</span>
            <span class="stat-value">${toolData.harvestTime}s</span>
        `;
        
        const durability = document.createElement('div');
        durability.className = 'stat-item';
        durability.innerHTML = `
            <span class="stat-label">Durability</span>
            <span class="stat-value">${toolData.durability.current}/${toolData.durability.max}</span>
        `;
        
        stats.appendChild(harvestTime);
        stats.appendChild(durability);
        
        const claimButton = document.createElement('button');
        claimButton.className = 'tool-claim';
        claimButton.textContent = 'Claim';
        claimButton.addEventListener('click', () => this.handleClaim(toolData));
        
        info.appendChild(header);
        info.appendChild(stats);
        info.appendChild(claimButton);
        
        content.appendChild(imageContainer);
        content.appendChild(info);
        slot.appendChild(content);

        this.activeSlots++;
        
        // Создаем новый слот, если все текущие заполнены
        if (this.activeSlots === this.slots.length) {
            this.createEmptySlot();
        }
    }

    // Обработчик нажатия на кнопку Claim
    handleClaim(toolData) {
        console.log('Claiming tool:', toolData);
        // Здесь будет логика сбора ресурсов
    }

    // Удаление инструмента из слота
    removeToolFromSlot(slot) {
        slot.className = 'tool-slot empty';
        slot.innerHTML = '';
        const addButton = document.createElement('button');
        addButton.className = 'add-tool-btn';
        addButton.textContent = '+';
        addButton.addEventListener('click', () => this.handleAddTool(slot));
        slot.appendChild(addButton);
        this.activeSlots--;

        // Удаляем лишние пустые слоты, оставляя только один после последнего заполненного
        while (this.slots.length > this.activeSlots + 1) {
            const lastSlot = this.slots.pop();
            lastSlot.remove();
        }
    }
}

// Инициализация менеджера слотов при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    window.toolSlotManager = new ToolSlotManager();
    
    // Пример добавления инструмента (для тестирования)
    /*
    setTimeout(() => {
        const testTool = {
            name: "Diamond Pickaxe",
            image: "assets/tools/diamond_pickaxe.png",
            rarity: "Epic",
            harvestTime: 30,
            durability: 100
        };
        window.toolSlotManager.addToolToSlot(window.toolSlotManager.slots[0], testTool);
    }, 1000);
    */
}); 