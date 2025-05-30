class InventoryManager {
    constructor() {
        // Загружаем сохраненные инструменты или используем дефолтные
        const savedTools = localStorage.getItem('miningTools');
        this.tools = savedTools ? JSON.parse(savedTools) : [
            {
                id: 'mfactory',
                name: 'Mining Factory',
                image: 'assets/NFT/11.png',
                rarity: 'epic',
                durability: {
                    current: 100,
                    max: 200
                },
                harvestTime: 120
            },
            {
                id: 'therobot',
                name: 'Mining Robot',
                image: 'assets/NFT/10.png',
                rarity: 'rare',
                durability: {
                    current: 85,
                    max: 170
                },
                harvestTime: 90
            },
            {
                id: 'drill',
                name: 'Mining Drill',
                image: 'assets/NFT/9.png',
                rarity: 'epic',
                durability: {
                    current: 95,
                    max: 190
                },
                harvestTime: 150
            },
            {
                id: 'collector',
                name: 'Resource Collector',
                image: 'assets/NFT/8.png',
                rarity: 'rare',
                durability: {
                    current: 80,
                    max: 160
                },
                harvestTime: 100
            },
            // Добавляем остальные NFT
            {
                id: 'excavator',
                name: 'Mining Excavator',
                image: 'assets/NFT/7.png',
                rarity: 'epic',
                durability: {
                    current: 90,
                    max: 180
                },
                harvestTime: 110
            },
            {
                id: 'scanner',
                name: 'Resource Scanner',
                image: 'assets/NFT/6.png',
                rarity: 'rare',
                durability: {
                    current: 75,
                    max: 150
                },
                harvestTime: 80
            },
            {
                id: 'processor',
                name: 'Mineral Processor',
                image: 'assets/NFT/5.png',
                rarity: 'epic',
                durability: {
                    current: 88,
                    max: 175
                },
                harvestTime: 130
            },
            {
                id: 'extractor',
                name: 'Resource Extractor',
                image: 'assets/NFT/4.png',
                rarity: 'rare',
                durability: {
                    current: 70,
                    max: 140
                },
                harvestTime: 95
            },
            {
                id: 'harvester',
                name: 'Crystal Harvester',
                image: 'assets/NFT/3.png',
                rarity: 'epic',
                durability: {
                    current: 92,
                    max: 185
                },
                harvestTime: 140
            },
            {
                id: 'collector2',
                name: 'Mineral Collector',
                image: 'assets/NFT/2.png',
                rarity: 'rare',
                durability: {
                    current: 82,
                    max: 165
                },
                harvestTime: 105
            },
            {
                id: 'miner',
                name: 'Deep Miner',
                image: 'assets/NFT/1.png',
                rarity: 'epic',
                durability: {
                    current: 97,
                    max: 195
                },
                harvestTime: 160
            }
        ];
    }

    show() {
        const modalContainer = document.getElementById("modal-container");
        modalContainer.innerHTML = "";
        
        const modal = document.createElement("div");
        modal.className = "modal inventory";

        const toolsContainer = document.createElement("div");
        toolsContainer.className = "inventory-container";

        const toolsHTML = this.tools.map(tool => `
            <div class="inventory-item" data-tool-id="${tool.id}">
                <div class="inventory-item-image">
                    <img src="${tool.image}" alt="${tool.name}">
                </div>
            </div>
        `).join('');

        toolsContainer.innerHTML = toolsHTML;
        modal.appendChild(toolsContainer);
        modalContainer.appendChild(modal);

        // Добавляем обработчики для выбора инструмента
        const items = toolsContainer.querySelectorAll('.inventory-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const toolId = item.dataset.toolId;
                const tool = this.tools.find(t => t.id === toolId);
                if (tool && window.toolSlotManager) {
                    // Находим первый пустой слот
                    const emptySlot = window.toolSlotManager.slots.find(slot => 
                        slot.classList.contains('empty')
                    );
                    if (emptySlot) {
                        window.toolSlotManager.addToolToSlot(emptySlot, tool);
                        modalContainer.innerHTML = ""; // Закрываем инвентарь
                    }
                }
            });
        });

        // Добавляем обработчик закрытия
        modalContainer.onclick = (e) => {
            if (e.target === modalContainer) {
                modalContainer.innerHTML = "";
            }
        };
    }
}

// Создаем глобальный экземпляр после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryManager = new InventoryManager();
}); 