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
            
            // Инициализируем TON Connect
            this.connector = new TonConnect();
            
            // Настраиваем конфигурацию
            await this.connector.setConfiguration({
                manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react/tonconnect-manifest.json',
                walletsListSource: 'https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json'
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
            
            if (!wallets || wallets.length === 0) {
                const mobileWalletUrl = 'https://tonkeeper.com/';
                if (confirm('Для работы требуется установить TON кошелек. Перейти к установке?')) {
                    window.open(mobileWalletUrl, '_blank');
                }
                return false;
            }

            // Находим предпочтительный кошелек
            const preferredWallet = wallets.find(w => w.name === 'Tonkeeper') || wallets[0];
            console.log('Selected wallet:', preferredWallet.name);

            try {
                // Пытаемся подключиться
                const universalLink = await this.connector.connect({
                    universalLink: preferredWallet.universalLink,
                    bridgeUrl: preferredWallet.bridgeUrl
                });

                console.log('Universal link generated:', universalLink);

                if (this.isMobile()) {
                    // На мобильных устройствах открываем кошелек
                    window.location.href = universalLink;
                } else {
                    // На десктопе показываем QR код
                    this.showQRModal(universalLink);
                }

                return true;
            } catch (connectionError) {
                console.error('Connection attempt failed:', connectionError);
                alert('Не удалось подключиться к кошельку. Попробуйте еще раз или используйте другой кошелек.');
                return false;
            }

        } catch (error) {
            console.error('Connection error:', error);
            alert('Ошибка подключения к кошельку. Проверьте, что у вас установлен TON кошелек.');
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