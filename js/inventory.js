class InventoryManager {
    constructor() {
        // Инициализируем пустой массив инструментов
        this.tools = [];
    }

    show(showAllTools = false) {
        // Обновляем список инструментов в зависимости от контекста
        if (showAllTools) {
            // Показываем все NFT из конфига
            this.tools = NFTManager.getAllNFTs();
        } else {
            // Показываем только доступные пользователю NFT
            const userNFTs = window.userManager?.userInventory?.getItems() || [];
            const commonNFTs = NFTManager.getAllNFTs().filter(nft => nft.rarity === 'common');
            this.tools = [...userNFTs, ...commonNFTs];
        }

        const modalContainer = document.getElementById("modal-container");
        modalContainer.innerHTML = "";
        
        const modal = document.createElement("div");
        modal.className = "modal inventory";
        modal.style.backgroundImage = 'url("assets/modal_inventory.png")';

        const toolsContainer = document.createElement("div");
        toolsContainer.className = "inventory-container";

        const toolsHTML = this.tools.map(tool => {
            const durability = tool.durability || { current: 100, max: 100 };
            
            return `
                <div class="inventory-item ${tool.rarity}" data-tool-id="${tool.id}">
                    <div class="inventory-item-image">
                        <img src="${tool.image}" alt="${tool.name}" onerror="this.src='assets/nft/FLASK.png'">
                    </div>
                    <div class="inventory-item-info">
                        <div class="inventory-item-header">
                            <span class="inventory-item-name">${tool.name}</span>
                            <span class="inventory-item-rarity">${tool.rarity}</span>
                        </div>
                        <div class="inventory-item-stats">
                            <div class="stat">
                                <span class="stat-label">Durability:</span>
                                <span class="stat-value">${durability.current}/${durability.max}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Harvest Time:</span>
                                <span class="stat-value">${tool.harvestTime}s</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        toolsContainer.innerHTML = toolsHTML;
        modal.appendChild(toolsContainer);
        modalContainer.appendChild(modal);

        // Добавляем обработчики для выбора инструмента
        const items = toolsContainer.querySelectorAll('.inventory-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const toolId = item.dataset.toolId;
                const tool = NFTManager.getNFTById(toolId);
                if (tool && window.toolSlotManager) {
                    const emptySlot = window.toolSlotManager.slots.find(slot => 
                        slot.classList.contains('empty')
                    );
                    if (emptySlot) {
                        window.toolSlotManager.addToolToSlot(emptySlot, tool);
                        modalContainer.innerHTML = "";
                    } else {
                        alert('Нет свободных слотов для инструмента');
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