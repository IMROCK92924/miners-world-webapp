class TONConnector {
    constructor() {
        this.connector = null;
        this.userProfile = null;
        this.userAddress = null;
        this.isConnected = false;
        this.onConnected = handleWalletConnected;
        this.onDisconnected = handleWalletDisconnected;
        this.manifestUrl = null;
    }

    // Функция ожидания загрузки SDK
    async waitForSDK(maxAttempts = 10, interval = 1000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const checkSDK = () => {
                if (typeof window.TON !== 'undefined') {
                    console.log('TON Connect SDK loaded successfully');
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    reject(new Error('TON Connect SDK failed to load'));
                } else {
                    attempts++;
                    console.log(`Waiting for TON Connect SDK... Attempt ${attempts}/${maxAttempts}`);
                    setTimeout(checkSDK, interval);
                }
            };
            
            checkSDK();
        });
    }

    async createManifest() {
        try {
            // Создаем манифест
            const manifest = {
                url: window.location.origin || 'https://miners-world.com',
                name: "Miners World",
                iconUrl: window.location.origin ? 
                    `${window.location.origin}/assets/ui/logo.png` : 
                    'https://miners-world.com/assets/ui/logo.png',
                termsOfUseUrl: window.location.origin ? 
                    `${window.location.origin}/terms.html` : 
                    'https://miners-world.com/terms.html',
                privacyPolicyUrl: window.location.origin ? 
                    `${window.location.origin}/privacy.html` : 
                    'https://miners-world.com/privacy.html'
            };

            const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
            this.manifestUrl = URL.createObjectURL(blob);
            return true;
        } catch (error) {
            console.error('Error creating manifest:', error);
            return false;
        }
    }

    async initialize() {
        try {
            // Ждем загрузки SDK
            await this.waitForSDK();

            // Создаем манифест
            const manifestCreated = await this.createManifest();
            if (!manifestCreated) {
                throw new Error('Failed to create manifest');
            }

            // Создаем коннектор
            this.connector = new window.TON({
                manifestUrl: this.manifestUrl,
                buttonRootId: 'connect-wallet-button'
            });

            // Подписываемся на изменения статуса
            this.connector.onStatusChange((wallet) => {
                console.log('Wallet status changed:', wallet);
                if (wallet) {
                    this.handleConnection(wallet);
                } else {
                    this.handleDisconnection();
                }
            });

            // Проверяем существующее подключение
            try {
                await this.connector.restoreConnection();
                console.log('Connection restored successfully');
            } catch (error) {
                console.warn('Failed to restore connection:', error);
                // Продолжаем работу, так как это не критическая ошибка
            }

            console.log('TON Connect initialized successfully');
            return true;
        } catch (error) {
            console.error('TON Connect initialization error:', error);
            return false;
        }
    }

    async connect() {
        try {
            if (!this.connector) {
                throw new Error('TON Connect not initialized');
            }

            // Получаем список доступных кошельков
            const wallets = await this.connector.getWallets();
            console.log('Available wallets:', wallets);
            
            if (wallets.length === 0) {
                throw new Error('No wallets available');
            }

            // Подключаемся к первому доступному кошельку
            const universalLink = await this.connector.connect(wallets[0]);
            
            // Если это мобильное устройство, перенаправляем на кошелек
            if (/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                window.location.href = universalLink;
            } else {
                // Показываем QR код для десктопа
                this.showQRModal(universalLink);
            }
        } catch (error) {
            console.error('Connect error:', error);
            throw error;
        }
    }

    showQRModal(universalLink) {
        const modal = document.createElement('div');
        modal.className = 'ton-connect-modal';
        modal.innerHTML = `
            <div class="ton-connect-content">
                <h2>Подключение кошелька</h2>
                <div id="qr-code"></div>
                <p>Отсканируйте QR-код с помощью TON кошелька</p>
                <button class="ton-connect-close">Закрыть</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Генерируем QR код
        new QRCode(modal.querySelector('#qr-code'), {
            text: universalLink,
            width: 256,
            height: 256
        });
        
        // Добавляем обработчик закрытия
        modal.querySelector('.ton-connect-close').onclick = () => {
            modal.remove();
        };
    }

    async disconnect() {
        try {
            if (!this.connector) {
                throw new Error('TON Connect not initialized');
            }

            await this.connector.disconnect();
            this.handleDisconnection();
        } catch (error) {
            console.error('Disconnect error:', error);
            throw error;
        }
    }

    async handleConnection(walletInfo) {
        try {
            if (!walletInfo || !walletInfo.account) {
                throw new Error('Invalid wallet info');
            }

            this.userAddress = walletInfo.account.address;
            this.isConnected = true;

            // Создаем базовый профиль
            this.userProfile = {
                address: walletInfo.account.address,
                nickname: `Player_${walletInfo.account.address.slice(0, 6)}`,
                avatar: 'assets/default-avatar.png'
            };

            // Закрываем QR модалку если она открыта
            const modal = document.querySelector('.ton-connect-modal');
            if (modal) modal.remove();

            if (this.onConnected) {
                this.onConnected(this.userProfile);
            }

            console.log('Wallet connected:', this.userProfile);
        } catch (error) {
            console.error('Handle connection error:', error);
            throw error;
        }
    }

    handleDisconnection() {
        this.userProfile = null;
        this.userAddress = null;
        this.isConnected = false;

        if (this.onDisconnected) {
            this.onDisconnected();
        }

        console.log('Wallet disconnected');
    }
}

// Экспортируем класс
window.TONConnector = TONConnector; 