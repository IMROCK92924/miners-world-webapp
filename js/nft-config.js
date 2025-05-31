// NFT Configuration
const NFT_CONFIG = {
    // FEL Tools (зеленые)
    FLASK: {
        id: 'flask',
        name: 'Flask of FEL',
        image: 'assets/nft/FLASK.png',
        rarity: 'common',
        durability: {
            current: 100,
            max: 100
        },
        harvestTime: 60,
        stats: {
            power: 13,
            energyUsage: 0,
            strengthUsage: 10
        },
        resourceType: 'FEL',
        description: 'Common FEL extractor'
    },
    WELL: {
        id: 'well',
        name: 'Well of FEL',
        image: 'assets/nft/Well.png',
        rarity: 'uncommon',
        durability: {
            current: 300,
            max: 300
        },
        harvestTime: 60,
        stats: {
            power: 45,
            energyUsage: 0,
            strengthUsage: 30
        },
        resourceType: 'FEL',
        description: 'Uncommon FEL well'
    },
    PUMP: {
        id: 'pump',
        name: 'Pump of FEL',
        image: 'assets/nft/Pump.png',
        rarity: 'rare',
        durability: {
            current: 900,
            max: 900
        },
        harvestTime: 60,
        stats: {
            power: 160,
            energyUsage: 0,
            strengthUsage: 90
        },
        resourceType: 'FEL',
        description: 'Rare FEL pump'
    },
    FACTORY: {
        id: 'factory',
        name: 'Factory of FEL',
        image: 'assets/nft/Factory.png',
        rarity: 'epic',
        durability: {
            current: 2000,
            max: 2000
        },
        harvestTime: 60,
        stats: {
            power: 460,
            energyUsage: 0,
            strengthUsage: 200
        },
        resourceType: 'FEL',
        description: 'Epic FEL factory'
    },

    // Mithril Tools (синие)
    PICKAXE: {
        id: 'pickaxe',
        name: 'Pickaxe',
        image: 'assets/nft/Pickaxe.png',
        rarity: 'common',
        durability: {
            current: 100,
            max: 100
        },
        harvestTime: 60,
        stats: {
            power: 3,
            energyUsage: 5,
            strengthUsage: 5
        },
        resourceType: 'MITHRIL',
        description: 'Common mithril pickaxe'
    },
    TURBO_PICKAXE: {
        id: 'turbo-pickaxe',
        name: 'Turbo Pickaxe',
        image: 'assets/nft/Turbo - pickaxe.png',
        rarity: 'uncommon',
        durability: {
            current: 200,
            max: 200
        },
        harvestTime: 60,
        stats: {
            power: 9,
            energyUsage: 15,
            strengthUsage: 15
        },
        resourceType: 'MITHRIL',
        description: 'Uncommon turbo pickaxe'
    },
    HAMMER: {
        id: 'hammer',
        name: 'Hammer',
        image: 'assets/nft/Hammer.png',
        rarity: 'rare',
        durability: {
            current: 450,
            max: 450
        },
        harvestTime: 60,
        stats: {
            power: 26,
            energyUsage: 45,
            strengthUsage: 45
        },
        resourceType: 'MITHRIL',
        description: 'Rare mithril hammer'
    },
    MITHRIL_FACTORY: {
        id: 'mfactory',
        name: 'Mithril Factory',
        image: 'assets/nft/Mfactory.png',
        rarity: 'epic',
        durability: {
            current: 1000,
            max: 1000
        },
        harvestTime: 60,
        stats: {
            power: 75,
            energyUsage: 100,
            strengthUsage: 100
        },
        resourceType: 'MITHRIL',
        description: 'Epic mithril factory'
    },

    // Rubidium Tools (красные)
    SICKLE: {
        id: 'sickle',
        name: 'Laser Sickle',
        image: 'assets/nft/Sickle.png',
        rarity: 'common',
        durability: {
            current: 150,
            max: 150
        },
        harvestTime: 60,
        stats: {
            power: 15,
            energyUsage: 50,
            strengthUsage: 15
        },
        resourceType: 'RUBIDIUM',
        description: 'Common laser sickle'
    },
    SPIDER: {
        id: 'spider',
        name: 'The Spider Collector',
        image: 'assets/nft/spider.png',
        rarity: 'uncommon',
        durability: {
            current: 450,
            max: 450
        },
        harvestTime: 60,
        stats: {
            power: 45,
            energyUsage: 100,
            strengthUsage: 45
        },
        resourceType: 'RUBIDIUM',
        description: 'Uncommon spider collector'
    },
    ROBOT: {
        id: 'robot',
        name: 'The Mining Robot',
        image: 'assets/nft/TheRobot.png',
        rarity: 'rare',
        durability: {
            current: 1500,
            max: 1500
        },
        harvestTime: 60,
        stats: {
            power: 130,
            energyUsage: 200,
            strengthUsage: 150
        },
        resourceType: 'RUBIDIUM',
        description: 'Rare mining robot'
    }
};

// Вспомогательные функции для работы с NFT
const NFTManager = {
    // Получить все NFT
    getAllNFTs() {
        return Object.values(NFT_CONFIG);
    },

    // Получить NFT по ID
    getNFTById(id) {
        return Object.values(NFT_CONFIG).find(nft => nft.id === id);
    },

    // Получить NFT по типу ресурса
    getNFTsByResourceType(resourceType) {
        return Object.values(NFT_CONFIG).filter(nft => nft.resourceType === resourceType);
    },

    // Получить NFT по редкости
    getNFTsByRarity(rarity) {
        return Object.values(NFT_CONFIG).filter(nft => nft.rarity === rarity);
    },

    // Создать новый экземпляр NFT (с текущими значениями)
    createNFTInstance(id) {
        const nft = this.getNFTById(id);
        if (!nft) return null;
        return JSON.parse(JSON.stringify(nft)); // Создаем глубокую копию
    }
};

// Экспортируем конфигурацию и менеджер
window.NFT_CONFIG = NFT_CONFIG;
window.NFTManager = NFTManager; 