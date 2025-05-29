class MiningModal {
    constructor() {
        // Загружаем сохраненные инструменты или используем дефолтные
        const savedTools = localStorage.getItem('miningTools');
        this.tools = savedTools ? JSON.parse(savedTools) : [
            {
                id: 'mfactory',
                name: 'Mining Factory',
                image: 'assets/NFT/Mfactory.png',
                rarity: 'epic',
                durability: {
                    current: 100,
                    max: 200
                },
                harvestTime: 120, // 2 минуты для теста
                lastHarvest: null
            },
            {
                id: 'therobot',
                name: 'Mining Robot',
                image: 'assets/NFT/TheRobot.png',
                rarity: 'rare',
                durability: {
                    current: 85,
                    max: 170
                },
                harvestTime: 90, // 1.5 минуты для теста
                lastHarvest: null
            },
            {
                id: 'mstation',
                name: 'Mining Station',
                image: 'assets/NFT/Mstation.png',
                rarity: 'epic',
                durability: {
                    current: 95,
                    max: 190
                },
                harvestTime: 150, // 2.5 минуты для теста
                lastHarvest: null
            }
        ];

        this.updateInterval = null;
    }

    saveState() {
        localStorage.setItem('miningTools', JSON.stringify(this.tools));
    }

    formatTime(seconds) {
        if (seconds < 0) return '00:00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    canClaim(tool) {
        if (!tool.lastHarvest) return true;
        const now = Date.now();
        const elapsed = Math.floor((now - tool.lastHarvest) / 1000);
        return elapsed >= tool.harvestTime;
    }

    claimRewards(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool || !this.canClaim(tool)) return;

        // Начисляем награды в зависимости от редкости
        const rewards = {
            common: { irid: 1, rubid: 1, fel: 1 },
            uncommon: { irid: 2, rubid: 2, fel: 2 },
            rare: { irid: 3, rubid: 3, fel: 3 },
            epic: { irid: 5, rubid: 5, fel: 5 }
        };

        const reward = rewards[tool.rarity];
        gameState.resources.irid += reward.irid;
        gameState.resources.rubid += reward.rubid;
        gameState.resources.fel += reward.fel;

        // Обновляем время последнего сбора
        tool.lastHarvest = Date.now();
        
        // Уменьшаем прочность
        tool.durability.current = Math.max(0, tool.durability.current - 1);

        // Сохраняем состояние
        this.saveState();

        // Обновляем UI
        updateUI();
        this.updateMiningTools();
        
        // Воспроизводим звук успеха
        playSound('success');
    }

    updateMiningTools() {
        this.tools.forEach(tool => {
            const toolElement = document.getElementById(`tool-${tool.id}`);
            if (toolElement) {
                const timeElement = toolElement.querySelector('.harvest-time');
                const claimButton = toolElement.querySelector('.claim-button');
                
                if (timeElement && claimButton) {
                    if (tool.lastHarvest) {
                        const now = Date.now();
                        const elapsed = Math.floor((now - tool.lastHarvest) / 1000);
                        const remaining = Math.max(0, tool.harvestTime - elapsed);
                        
                        timeElement.textContent = `⏱ ${this.formatTime(remaining)}`;
                        claimButton.disabled = !this.canClaim(tool);
                    } else {
                        timeElement.textContent = `⏱ Ready!`;
                        claimButton.disabled = false;
                    }
                }
            }
        });
    }

    show() {
        const modalContainer = document.getElementById("modal-container");
        modalContainer.innerHTML = "";
        
        const modal = document.createElement("div");
        modal.className = "modal mining";

        const toolsHTML = this.tools.map(tool => `
            <div class="mining-tool" id="tool-${tool.id}">
                <div class="tool-header">
                    <div class="tool-image">
                        <img src="${tool.image}" alt="${tool.name}">
                    </div>
                    <div class="tool-info">
                        <div class="tool-name">${tool.name}</div>
                        <div class="harvest-time">⏱ ${tool.lastHarvest ? this.formatTime(tool.harvestTime) : 'Ready!'}</div>
                        <div class="tool-durability">🛠 ${tool.durability.current}/${tool.durability.max}</div>
                        <button class="claim-button" onclick="miningModal.claimRewards('${tool.id}')" ${!this.canClaim(tool) ? 'disabled' : ''}>
                            CLAIM
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="mining-container">
                <div class="mining-tools">
                    ${toolsHTML}
                </div>
            </div>
        `;

        modalContainer.appendChild(modal);

        // Запускаем обновление времени
        this.updateInterval = setInterval(() => this.updateMiningTools(), 1000);

        // Добавляем обработчик закрытия на modalContainer
        modalContainer.onclick = (e) => {
            // Проверяем, что клик был на modalContainer, а не на его дочерних элементах
            if (e.target === modalContainer) {
                this.close();
            }
        };

        // Добавляем обработчик закрытия на клавишу Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    close() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        const modalContainer = document.getElementById("modal-container");
        modalContainer.innerHTML = "";
        
        // Удаляем обработчик Escape при закрытии
        document.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
}

// Создаем глобальный экземпляр после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.miningModal = new MiningModal();
    console.log('MiningModal initialized!');
}); 