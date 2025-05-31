class TONConnector {
    constructor() {
        this.connector = null;
        this.userAddress = null;
        this.userProfile = null;
        this.isConnected = false;
    }

    async initialize() {
        try {
            // Инициализируем TON Connect
            this.connector = new TonConnect({
                manifestUrl: 'https://miners-world.com/tonconnect-manifest.json'
            });

            // Подписываемся на изменения состояния подключения
            this.connector.onStatusChange(this.handleConnectionChange.bind(this));

            // Проверяем, был ли пользователь уже подключен
            const walletConnectionSource = localStorage.getItem('wallet');
            if (walletConnectionSource) {
                this.connector.restoreConnection();
            }

            return true;
        } catch (error) {
            console.error('TON Connect initialization error:', error);
            return false;
        }
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('Already connected to wallet');
                return true;
            }

            // Получаем список доступных кошельков
            const wallets = await this.connector.getWallets();
            
            // Если нет доступных кошельков, показываем сообщение
            if (wallets.length === 0) {
                alert('Please install TON Wallet (e.g., Tonkeeper or MyTonWallet)');
                return false;
            }

            // Подключаемся к первому доступному кошельку
            const universalLink = this.connector.connect({
                universalLink: wallets[0].universalLink,
                bridgeUrl: wallets[0].bridgeUrl
            });

            // Если мы в мобильном браузере, редиректим на кошелек
            if (this.isMobile()) {
                window.location.href = universalLink;
            } else {
                // На десктопе показываем QR код
                this.showQRModal(universalLink);
            }

            return true;
        } catch (error) {
            console.error('Connection error:', error);
            return false;
        }
    }

    async disconnect() {
        try {
            await this.connector.disconnect();
            this.userAddress = null;
            this.userProfile = null;
            this.isConnected = false;
            localStorage.removeItem('wallet');
            return true;
        } catch (error) {
            console.error('Disconnect error:', error);
            return false;
        }
    }

    async handleConnectionChange(status) {
        if (status.connected) {
            this.isConnected = true;
            this.userAddress = status.account.address;
            
            // Получаем профиль пользователя
            await this.fetchUserProfile();
            
            // Сохраняем подключение
            localStorage.setItem('wallet', status.account.address);
            
            // Закрываем модальное окно с QR кодом, если оно открыто
            this.closeQRModal();
            
            // Вызываем колбэк успешного подключения
            if (this.onConnected) {
                this.onConnected(this.userProfile);
            }
        } else {
            this.isConnected = false;
            this.userAddress = null;
            this.userProfile = null;
            localStorage.removeItem('wallet');
            
            // Вызываем колбэк отключения
            if (this.onDisconnected) {
                this.onDisconnected();
            }
        }
    }

    async fetchUserProfile() {
        try {
            // Получаем данные профиля из DNS записей TON
            const response = await fetch(`https://api.ton.cat/v2/dns/resolve/${this.userAddress}`);
            const data = await response.json();
            
            this.userProfile = {
                address: this.userAddress,
                nickname: data.name || 'Anonymous',
                avatar: data.avatar || 'assets/default-avatar.png'
            };
            
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

    showQRModal(universalLink) {
        const modal = document.createElement('div');
        modal.className = 'ton-connect-modal';
        modal.innerHTML = `
            <div class="ton-connect-content">
                <h2>Connect Wallet</h2>
                <div id="qrcode"></div>
                <p>Scan QR code with your TON wallet</p>
                <button class="ton-connect-close">Cancel</button>
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