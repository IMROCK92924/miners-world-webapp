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
            
            // Настраиваем конфигурацию для локальной разработки
            const manifestUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? `${window.location.origin}/tonconnect-manifest.json`
                : 'https://miners-world.com/tonconnect-manifest.json';
            
            await this.connector.setConfiguration({
                manifestUrl,
                walletsListSource: 'https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json',
                retryConfig: {
                    maxAttempts: 3,
                    timeout: 3000
                }
            });
            
            console.log('TON Connect initialized with manifest:', manifestUrl);

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
                const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
                const message = isMobile
                    ? 'Для работы с приложением необходим TON кошелек. Рекомендуем установить Tonkeeper.'
                    : 'Для работы с приложением необходим TON кошелек. Рекомендуем установить расширение Tonkeeper для браузера.';
                
                const installUrl = isMobile
                    ? 'https://tonkeeper.com/download/'
                    : 'https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd';
                
                if (confirm(message + '\n\nПерейти к установке?')) {
                    window.open(installUrl, '_blank');
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

                // Добавляем обработчик для проверки статуса подключения
                let connectionCheckAttempts = 0;
                const checkConnection = setInterval(async () => {
                    try {
                        const status = await this.connector.getWalletInfo();
                        if (status && status.connected) {
                            clearInterval(checkConnection);
                            console.log('Connection successful');
                            this.handleConnectionChange(status);
                        } else {
                            connectionCheckAttempts++;
                            if (connectionCheckAttempts >= 30) { // 30 секунд таймаут
                                clearInterval(checkConnection);
                                throw new Error('Connection timeout');
                            }
                        }
                    } catch (error) {
                        console.error('Connection check error:', error);
                    }
                }, 1000);

                return true;
            } catch (connectionError) {
                console.error('Connection attempt failed:', connectionError);
                const errorMessage = this.isMobile()
                    ? 'Не удалось подключиться к кошельку. Убедитесь, что у вас установлен TON кошелек и попробуйте еще раз.'
                    : 'Не удалось подключиться к кошельку. Проверьте, что расширение TON кошелька установлено и активировано в браузере.';
                alert(errorMessage);
                return false;
            }

        } catch (error) {
            console.error('Connection error:', error);
            alert('Произошла ошибка при подключении к кошельку. Пожалуйста, обновите страницу и попробуйте снова.');
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
            
            // Обновляем UI профиля
            this.updateProfileUI();
            
            // Вызываем колбэк успешного подключения
            if (this.onConnected) {
                this.onConnected(this.userProfile);
            }
        } else {
            console.log('Wallet disconnected');
            this.isConnected = false;
            this.userAddress = null;
            this.userProfile = null;
            localStorage.removeItem('wallet');
            
            // Обновляем UI профиля при отключении
            this.updateProfileUI();
            
            // Вызываем колбэк отключения
            if (this.onDisconnected) {
                this.onDisconnected();
            }
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

    updateProfileUI() {
        const userContainer = document.getElementById('user-container');
        const connectButton = document.getElementById('connect-wallet');
        const userProfile = document.getElementById('user-profile');
        const userNickname = document.getElementById('user-nickname');
        const userAddress = document.getElementById('user-address');
        const userAvatar = document.getElementById('user-avatar');

        if (this.isConnected && this.userProfile) {
            // Скрываем кнопку подключения и показываем профиль
            connectButton.style.display = 'none';
            userProfile.style.display = 'flex';
            
            // Обновляем данные профиля
            userNickname.textContent = this.userProfile.nickname;
            userAddress.textContent = this.userAddress.slice(0, 6) + '...' + this.userAddress.slice(-4);
            userAvatar.src = this.userProfile.avatar;
            
            // Добавляем обработчик клика для отключения
            userProfile.onclick = () => this.disconnect();
        } else {
            // Показываем кнопку подключения и скрываем профиль
            connectButton.style.display = 'block';
            userProfile.style.display = 'none';
            
            // Сбрасываем данные профиля
            userNickname.textContent = 'Anonymous';
            userAddress.textContent = 'Not connected';
            userAvatar.src = 'assets/default-avatar.png';
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