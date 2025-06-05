// Конфигурация слотов
const INITIAL_SLOTS = 1; // Начальное количество слотов

// Класс для управления слотами инструментов
class ToolSlotManager {
    constructor() {
        this.container = document.querySelector('.mining-container');
        this.slots = [];
        this.maxSlots = 6; // Максимальное количество слотов
        this.activeSlots = 0; // Количество активных слотов
        this.initializeSlots();
    }

    initializeSlots() {
        this.container.innerHTML = '';
        this.createEmptySlot(); // Создаем первый слот
    }

    createEmptySlot() {
        if (this.slots.length >= this.maxSlots) return; // Проверка на максимум слотов

        const slot = document.createElement('div');
        slot.className = 'tool-slot empty';
        slot.innerHTML = `
            <button class="add-tool-btn">+</button>
        `;
        this.container.appendChild(slot);
        this.slots.push(slot);

        // Добавляем обработчик для кнопки добавления
        const addButton = slot.querySelector('.add-tool-btn');
        addButton.addEventListener('click', () => {
            if (window.inventoryManager) {
                window.inventoryManager.show();
            }
        });
    }

    addToolToSlot(slot, tool) {
        const durability = tool.durability || { current: 100, max: 100 };
        slot.className = `tool-slot active ${tool.rarity}`;
        slot.dataset.toolId = tool.id;
        
        slot.innerHTML = `
            <div class="tool-content">
                <div class="tool-image-container">
                    <img src="${tool.image}" alt="${tool.name}" onerror="this.src='assets/nft/FLASK.png'">
                </div>
                <div class="tool-info">
                    <div class="tool-header">
                        <span class="tool-name">${tool.name}</span>
                        <span class="tool-rarity">${tool.rarity}</span>
                    </div>
                    <div class="tool-stats">
                        <div class="stat">
                            <span class="stat-label">Durability:</span>
                            <span class="stat-value">${durability.current}/${durability.max}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Harvest Time:</span>
                            <span class="stat-value">${tool.harvestTime}s</span>
                        </div>
                    </div>
                    <button class="tool-claim" onclick="window.toolSlotManager.handleClaim('${tool.id}')">CLAIM</button>
                </div>
            </div>
        `;

        this.activeSlots++;
        
        // Создаем новый пустой слот, если есть место
        if (this.activeSlots < this.maxSlots) {
            this.createEmptySlot();
        }
    }

    handleClaim(toolId) {
        const tool = NFTManager.getNFTById(toolId);
        if (!tool) return;

        // Анимация кнопки
        const slot = this.slots.find(slot => slot.dataset.toolId === toolId);
        if (!slot) return;

        const claimButton = slot.querySelector('.tool-claim');
        if (claimButton) {
            claimButton.style.opacity = '0.5';
            setTimeout(() => {
                claimButton.style.opacity = '1';
            }, 200);
        }

        // Добываем ресурсы
        const resourceAmount = tool.stats.power;
        const resourceType = tool.resourceType;
        
        // Обновляем счетчики ресурсов
        const resourceElements = {
            'FEL': document.getElementById('fel'),
            'MITHRIL': document.getElementById('irid'),
            'RUBIDIUM': document.getElementById('rubid')
        };

        const resourceElement = resourceElements[resourceType];
        if (resourceElement) {
            const currentAmount = parseInt(resourceElement.textContent) || 0;
            resourceElement.textContent = currentAmount + resourceAmount;
            
            // Анимация счетчика
            resourceElement.classList.add('highlight');
            setTimeout(() => {
                resourceElement.classList.remove('highlight');
            }, 500);

            // Создаем всплывающее уведомление
            const popup = document.createElement('div');
            popup.className = `resource-popup ${resourceType}`;
            popup.textContent = `+${resourceAmount} ${resourceType}`;
            slot.appendChild(popup);

            // Удаляем popup после анимации
            setTimeout(() => {
                popup.remove();
            }, 1500);

            // Создаем летящие частицы
            this.createResourceParticles(slot, resourceType, resourceElement);
        }
    }

    createResourceParticles(slot, resourceType, targetElement) {
        const slotRect = slot.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Создаем несколько частиц
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = `resource-particle ${resourceType}`;
            
            // Рассчитываем начальную позицию (от кнопки CLAIM)
            const startX = slotRect.left + slotRect.width / 2;
            const startY = slotRect.top + slotRect.height / 2;
            
            // Рассчитываем конечную позицию (к счетчику ресурса)
            const endX = targetRect.left + targetRect.width / 2;
            const endY = targetRect.top + targetRect.height / 2;
            
            // Добавляем случайное отклонение для каждой частицы
            const randomOffsetX = (Math.random() - 0.5) * 50;
            const randomOffsetY = (Math.random() - 0.5) * 50;
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            particle.style.setProperty('--tx', `${endX - startX + randomOffsetX}px`);
            particle.style.setProperty('--ty', `${endY - startY + randomOffsetY}px`);
            
            document.body.appendChild(particle);
            
            // Удаляем частицу после анимации
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    removeToolFromSlot(slot) {
        slot.className = 'tool-slot empty';
        slot.innerHTML = `
            <button class="add-tool-btn">+</button>
        `;
        delete slot.dataset.toolId;
        this.activeSlots--;

        // Добавляем обработчик для новой кнопки
        const addButton = slot.querySelector('.add-tool-btn');
        addButton.addEventListener('click', () => {
            if (window.inventoryManager) {
                window.inventoryManager.show();
            }
        });
    }
} 