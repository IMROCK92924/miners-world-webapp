class TONConnector {
    constructor() {
        this.connector = null;
        this.userAddress = null;
        this.userProfile = null;
        this.isConnected = false;
    }

    async initialize() {
        try {
            console.log('Initializing TON Connect...');
            
            // Создаем локальный манифест
            const manifest = {
                url: window.location.origin,
                name: 'MinersWorld',
                iconUrl: `${window.location.origin}/assets/logo.png`
            };
            
            // Инициализируем TON Connect с встроенным манифестом
            this.connector = new TonConnect({
                manifestUrl: manifest
            });
            
            console.log('TON Connect initialized');

            // Подписываемся на изменения состояния подключения
            this.connector.onStatusChange((wallet) => {
                console.log('Wallet status changed:', wallet);
                this.handleConnectionChange(wallet);
            });

            // Проверяем, был ли пользователь уже подключен
            const walletConnectionSource = localStorage.getItem('wallet');
            if (walletConnectionSource) {
                console.log('Restoring previous connection...');
                await this.connector.restoreConnection();
            }

            return true;
        } catch (error) {
            console.error('TON Connect initialization error:', error);
            return false;
        }
    }

    async connect() {
        try {
            console.log('Connecting to wallet...');
            
            if (this.isConnected) {
                console.log('Already connected to wallet');
                return true;
            }

            // Получаем список доступных кошельков
            const wallets = await this.connector.getWallets();
            console.log('Available wallets:', wallets);
            
            // Если нет доступных кошельков, показываем сообщение
            if (!wallets || wallets.length === 0) {
                alert('Пожалуйста, установите TON кошелек (например, Tonkeeper или MyTonWallet)');
                return false;
            }

            // Формируем ссылку для подключения
            const universalLink = await this.connector.connect({
                universalLink: wallets[0].universalLink,
                bridgeUrl: wallets[0].bridgeUrl
            });

            console.log('Universal link generated:', universalLink);

            // Если мы в мобильном браузере, редиректим на кошелек
            if (this.isMobile()) {
                console.log('Mobile device detected, redirecting to wallet...');
                window.location.href = universalLink;
            } else {
                // На десктопе показываем QR код
                console.log('Showing QR code for desktop...');
                this.showQRModal(universalLink);
            }

            return true;
        } catch (error) {
            console.error('Connection error:', error);
            alert('Ошибка подключения к кошельку. Пожалуйста, попробуйте еще раз.');
            return false;
        }
    }

    async disconnect() {
        try {
            console.log('Disconnecting wallet...');
            await this.connector.disconnect();
            this.userAddress = null;
            this.userProfile = null;
            this.isConnected = false;
            localStorage.removeItem('wallet');
            console.log('Wallet disconnected');
            return true;
        } catch (error) {
            console.error('Disconnect error:', error);
            return false;
        }
    }

    async handleConnectionChange(wallet) {
        console.log('Handling connection change:', wallet);
        
        if (wallet.connected) {
            this.isConnected = true;
            this.userAddress = wallet.account.address;
            console.log('Connected to wallet:', this.userAddress);
            
            // Получаем профиль пользователя
            await this.fetchUserProfile();
            
            // Сохраняем подключение
            localStorage.setItem('wallet', this.userAddress);
            
            // Закрываем модальное окно с QR кодом, если оно открыто
            this.closeQRModal();
            
            // Вызываем колбэк успешного подключения
            if (this.onConnected) {
                this.onConnected(this.userProfile);
            }
            
            // Обновляем UI
            this.updateUI();
        } else {
            console.log('Wallet disconnected');
            this.isConnected = false;
            this.userAddress = null;
            this.userProfile = null;
            localStorage.removeItem('wallet');
            
            // Вызываем колбэк отключения
            if (this.onDisconnected) {
                this.onDisconnected();
            }
            
            // Обновляем UI
            this.updateUI();
        }
    }

    async fetchUserProfile() {
        try {
            console.log('Fetching user profile...');
            // Получаем данные профиля из DNS записей TON
            const response = await fetch(`https://api.ton.cat/v2/dns/resolve/${this.userAddress}`);
            const data = await response.json();
            
            this.userProfile = {
                address: this.userAddress,
                nickname: data.name || 'Anonymous',
                avatar: data.avatar || 'assets/default-avatar.png'
            };
            
            console.log('User profile fetched:', this.userProfile);
            return this.userProfile;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Возвращаем базовый профиль при ошибке
            this.userProfile = {
                address: this.userAddress,
                nickname: 'Anonymous',
                avatar: 'assets/default-avatar.png'
            };
            return this.userProfile;
        }
    }

    updateUI() {
        // Обновляем модальное окно настроек, если оно открыто
        const settingsModal = document.querySelector('.modal.settings');
        if (settingsModal) {
            openModal('settings');
        }
    }

    showQRModal(universalLink) {
        console.log('Showing QR modal...');
        const modal = document.createElement('div');
        modal.className = 'ton-connect-modal';
        modal.innerHTML = `
            <div class="ton-connect-content">
                <h2>Подключение кошелька</h2>
                <div id="qrcode"></div>
                <p>Отсканируйте QR-код с помощью вашего TON кошелька</p>
                <button class="ton-connect-close">Отмена</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Создаем QR код
        new QRCode(document.getElementById("qrcode"), {
            text: universalLink,
            width: 256,
            height: 256
        });
        
        // Добавляем обработчик закрытия
        modal.querySelector('.ton-connect-close').onclick = () => this.closeQRModal();
    }

    closeQRModal() {
        console.log('Closing QR modal...');
        const modal = document.querySelector('.ton-connect-modal');
        if (modal) {
            modal.remove();
        }
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

// Экспортируем класс
window.TONConnector = TONConnector; 