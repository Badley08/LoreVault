// app.js - Logique principale de LoreVault
class LoreVault {
    constructor() {
        this.mediaData = [];
        this.currentFilter = 'all';
        this.sortBy = 'date';
        this.sortOrder = 'desc';
        this.currentTheme = 'dark';
        this.badges = [];
        this.customStatuses = [];
        this.focusMode = false;
        this.achievements = new AchievementManager();
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateStats();
        this.renderGrid();
        this.checkBadges();
        this.setupThemeScheduler();
    }

    setupEventListeners() {
        document.getElementById('hamburger').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });

        document.getElementById('overlay').addEventListener('click', () => {
            this.closeSidebar();
        });

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (theme) {
                    this.setTheme(theme);
                }
            });
        });

        document.getElementById('settingsToggle').addEventListener('click', () => {
            const menu = document.getElementById('settingsMenu');
            menu.classList.toggle('show');
        });

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.category);
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderGrid();
        });

        document.getElementById('sortOrder').addEventListener('click', () => {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            const icon = document.querySelector('#sortOrder i');
            icon.className = this.sortOrder === 'asc' ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down';
            this.renderGrid();
        });

        document.getElementById('addBtn').addEventListener('click', () => {
            this.openMediaModal();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchItems(e.target.value);
        });

        document.getElementById('voiceSearch').addEventListener('click', () => {
            this.startVoiceSearch();
        });

        document.getElementById('focusMode').addEventListener('click', () => {
            this.toggleFocusMode();
        });

        document.getElementById('mediaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMedia();
        });

        document.getElementById('nickname').addEventListener('input', (e) => {
            localStorage.setItem('loreVault_nickname', e.target.value);
        });

        document.getElementById('password').addEventListener('input', (e) => {
            localStorage.setItem('loreVault_password', e.target.value);
        });
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });

        localStorage.setItem('loreVault_theme', theme);
    }

    setupThemeScheduler() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            if (this.currentTheme === 'dark') {
                this.setTheme('light');
            }
        } else {
            if (this.currentTheme === 'light') {
                this.setTheme('dark');
            }
        }

        setInterval(() => {
            this.setupThemeScheduler();
        }, 3600000);
    }

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('show');
        document.getElementById('settingsMenu').classList.remove('show');
    }

    setFilter(category) {
        this.currentFilter = category;
        this.renderGrid();
    }

    searchItems(query) {
        const filtered = this.mediaData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase()) ||
            item.status.toLowerCase().includes(query.toLowerCase())
        );
        this.renderGrid(filtered);
    }

    startVoiceSearch() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'fr-FR';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                document.getElementById('voiceSearch').style.color = '#ff4444';
            };

            recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                document.getElementById('searchInput').value = result;
                this.searchItems(result);
            };

            recognition.onend = () => {
                document.getElementById('voiceSearch').style.color = 'white';
            };

            recognition.start();
        } else {
            this.showNotification('La recherche vocale n\'est pas supportée par votre navigateur', 'error');
        }
    }

    toggleFocusMode() {
        this.focusMode = !this.focusMode;
        const button = document.getElementById('focusMode');
        
        if (this.focusMode) {
            button.style.background = '#ff4444';
            this.showRandomItem();
        } else {
            button.style.background = 'var(--primary-color)';
            this.renderGrid();
        }
    }

    showRandomItem() {
        if (this.mediaData.length === 0) {
            this.showNotification('Aucun média disponible', 'warning');
            return;
        }

        const randomItem = this.mediaData[Math.floor(Math.random() * this.mediaData.length)];
        const grid = document.getElementById('mediaGrid');
        
        grid.innerHTML = `
            <div class="focus-item">
                <div class="focus-image">
                    ${randomItem.image ? 
                        `<img src="${randomItem.image}" alt="${randomItem.title}">` : 
                        this.getCategoryIcon(randomItem.category)
                    }
                </div>
                <h2>${randomItem.title}</h2>
                <p>Catégorie: ${randomItem.category}</p>
                <p>Statut: ${randomItem.status}</p>
                ${randomItem.rating > 0 ? `<div class="rating-stars">${'★'.repeat(randomItem.rating)}${'☆'.repeat(5-randomItem.rating)}</div>` : ''}
                ${randomItem.notes ? `<p>${randomItem.notes}</p>` : ''}
                <button class="btn-primary" onclick="loreVault.toggleFocusMode()" style="margin-top: 1rem;">
                    <i class="fas fa-times"></i> Fermer Focus
                </button>
            </div>
        `;
    }

    openMediaModal(item = null) {
        const modal = document.getElementById('mediaModal');
        const title = document.getElementById('modalTitle');
        
        if (item) {
            title.textContent = 'Éditer un média';
            this.fillModalWithData(item);
        } else {
            title.textContent = 'Ajouter un média';
            this.clearModalData();
        }
        
        modal.classList.add('show');
    }

    fillModalWithData(item) {
        document.getElementById('editId').value = item.id;
        document.getElementById('mediaTitle').value = item.title;
        document.getElementById('mediaCategory').value = item.category;
        document.getElementById('mediaStatus').value = item.status;
        document.getElementById('mediaRating').value = item.rating || 0;
        document.getElementById('mediaNotes').value = item.notes || '';
        document.getElementById('reminderDate').value = item.reminderDate || '';
        
        updateStarDisplay(item.rating || 0);
    }

    clearModalData() {
        document.getElementById('editId').value = '';
        document.getElementById('mediaTitle').value = '';
        document.getElementById('mediaCategory').value = 'anime';
        document.getElementById('mediaStatus').value = 'Pas encore';
        document.getElementById('mediaRating').value = 0;
        document.getElementById('mediaNotes').value = '';
        document.getElementById('reminderDate').value = '';
        document.getElementById('mediaImage').value = '';
        
        updateStarDisplay(0);
    }

    saveMedia() {
        const id = document.getElementById('editId').value;
        const title = document.getElementById('mediaTitle').value;
        const category = document.getElementById('mediaCategory').value;
        const status = document.getElementById('mediaStatus').value;
        const rating = parseInt(document.getElementById('mediaRating').value) || 0;
        const notes = document.getElementById('mediaNotes').value;
        const reminderDate = document.getElementById('reminderDate').value;
        const imageFile = document.getElementById('mediaImage').files[0];

        const isNew = !id;
        const oldItem = id ? this.findItemById(id) : null;

        const mediaItem = {
            id: id || Date.now().toString(),
            title,
            category,
            status,
            rating,
            notes,
            reminderDate,
            dateAdded: id ? (oldItem?.dateAdded || new Date().toISOString()) : new Date().toISOString(),
            favorite: id ? (oldItem?.favorite || false) : false
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mediaItem.image = e.target.result;
                this.saveMediaItem(mediaItem, id, isNew, oldItem);
            };
            reader.readAsDataURL(imageFile);
        } else {
            if (id && oldItem) {
                mediaItem.image = oldItem.image;
            }
            this.saveMediaItem(mediaItem, id, isNew, oldItem);
        }
    }

    saveMediaItem(mediaItem, editId, isNew, oldItem) {
        if (editId) {
            const index = this.mediaData.findIndex(item => item.id === editId);
            if (index !== -1) {
                this.mediaData[index] = mediaItem;
            }
        } else {
            this.mediaData.push(mediaItem);
        }

        this.saveData();
        this.updateStats();
        this.renderGrid();
        this.checkBadges();
        document.getElementById('mediaModal').classList.remove('show');
        
        // Vérifier les réalisations
        this.achievements.checkAchievements(this.mediaData, mediaItem, isNew, oldItem);
        
        this.showNotification('Média sauvegardé avec succès', 'success');

        if (mediaItem.reminderDate) {
            this.scheduleReminder(mediaItem);
        }
    }

    findItemById(id) {
        return this.mediaData.find(item => item.id === id);
    }

    deleteMedia(id) {
        this.confirmAction('Êtes-vous sûr de vouloir supprimer ce média ?', () => {
            this.mediaData = this.mediaData.filter(item => item.id !== id);
            this.saveData();
            this.updateStats();
            this.renderGrid();
            this.showNotification('Média supprimé', 'success');
        });
    }

    toggleFavorite(id) {
        const item = this.findItemById(id);
        if (item) {
            item.favorite = !item.favorite;
            this.saveData();
            this.updateStats();
            this.renderGrid();
            this.showNotification(`${item.favorite ? 'Ajouté aux' : 'Retiré des'} favoris`, 'success');
        }
    }

    updateStats() {
        const total = this.mediaData.length;
        const watched = this.mediaData.filter(item => item.status === 'Déjà regardé').length;
        const toWatch = this.mediaData.filter(item => item.status === 'À regarder').length;
        const favorites = this.mediaData.filter(item => item.favorite).length;

        document.getElementById('totalItems').textContent = total;
        document.getElementById('watchedItems').textContent = watched;
        document.getElementById('toWatchItems').textContent = toWatch;
        document.getElementById('favoriteItems').textContent = favorites;
    }

    renderGrid(items = null) {
        if (this.focusMode) return;

        let dataToRender = items || this.getFilteredData();
        dataToRender = this.sortData(dataToRender);

        const grid = document.getElementById('mediaGrid');
        
        if (dataToRender.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <p>Aucun média trouvé</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = dataToRender.map(item => this.createMediaCard(item)).join('');
    }

    getFilteredData() {
        if (this.currentFilter === 'all') {
            return this.mediaData;
        } else if (this.currentFilter === 'favorites') {
            return this.mediaData.filter(item => item.favorite);
        } else {
            return this.mediaData.filter(item => item.category === this.currentFilter);
        }
    }

    sortData(data) {
        return data.sort((a, b) => {
            let aValue, bValue;
            
            switch (this.sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'rating':
                    aValue = a.rating || 0;
                    bValue = b.rating || 0;
                    break;
                case 'date':
                default:
                    aValue = new Date(a.dateAdded);
                    bValue = new Date(b.dateAdded);
                    break;
            }

            if (this.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    createMediaCard(item) {
        const statusClass = this.getStatusClass(item.status);
        const categoryIcon = this.getCategoryIcon(item.category);
        
        return `
            <div class="media-card" onclick="loreVault.openMediaModal(loreVault.findItemById('${item.id}'))">
                <div class="media-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.title}">` : 
                        categoryIcon
                    }
                    <button class="favorite-btn ${item.favorite ? 'favorited' : ''}" onclick="event.stopPropagation(); loreVault.toggleFavorite('${item.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="media-info">
                    <div class="media-title" title="${item.title}">${item.title}</div>
                    <span class="media-status ${statusClass}">${item.status}</span>
                    ${item.rating > 0 ? `
                        <div class="media-rating">
                            ${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}
                        </div>
                    ` : ''}
                    <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                        <button onclick="event.stopPropagation(); loreVault.openMediaModal(loreVault.findItemById('${item.id}'))" 
                                style="background: var(--primary-color); border: none; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="event.stopPropagation(); loreVault.deleteMedia('${item.id}')" 
                                style="background: var(--danger-color); border: none; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getStatusClass(status) {
        switch (status) {
            case 'Déjà regardé': return 'status-watched';
            case 'Pas encore': return 'status-not-yet';
            case 'À regarder': return 'status-to-watch';
            default: return 'status-to-watch';
        }
    }

    getCategoryIcon(category) {
        const icons = {
            anime: '<i class="fas fa-play-circle"></i>',
            manga: '<i class="fas fa-book"></i>',
            webtoon: '<i class="fas fa-mobile-alt"></i>',
            serie: '<i class="fas fa-tv"></i>',
            film: '<i class="fas fa-film"></i>',
            'light-novel': '<i class="fas fa-feather"></i>',
            livre: '<i class="fas fa-book-open"></i>'
        };
        return icons[category] || '<i class="fas fa-question"></i>';
    }

    checkBadges() {
        const newBadges = [];
        
        if (this.mediaData.length >= 10) newBadges.push({ name: 'Collectionneur', icon: 'fas fa-trophy', description: '10+ médias ajoutés' });
        if (this.mediaData.length >= 50) newBadges.push({ name: 'Archiviste', icon: 'fas fa-medal', description: '50+ médias ajoutés' });
        if (this.mediaData.length >= 100) newBadges.push({ name: 'Maître Collectionneur', icon: 'fas fa-crown', description: '100+ médias ajoutés' });

        const categories = [...new Set(this.mediaData.map(item => item.category))];
        if (categories.length >= 3) newBadges.push({ name: 'Diversité', icon: 'fas fa-palette', description: '3+ catégories différentes' });

        const favorites = this.mediaData.filter(item => item.favorite).length;
        if (favorites >= 5) newBadges.push({ name: 'Passionné', icon: 'fas fa-heart', description: '5+ favoris' });

        this.badges = newBadges;
        this.renderBadges();
    }

    renderBadges() {
        const badgesSection = document.getElementById('badgesSection');
        
        if (this.badges.length === 0) {
            badgesSection.innerHTML = '';
            return;
        }

        badgesSection.innerHTML = this.badges.map(badge => `
            <div class="badge" title="${badge.description}">
                <i class="${badge.icon}"></i>
                ${badge.name}
            </div>
        `).join('');
    }

    scheduleReminder(item) {
        const reminderTime = new Date(item.reminderDate).getTime();
        const now = Date.now();
        
        if (reminderTime > now) {
            setTimeout(() => {
                this.showNotification(`Rappel: ${item.title}`, 'info');
            }, reminderTime - now);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.background = '#4CAF50';
                break;
            case 'error':
                notification.style.background = '#f44336';
                break;
            case 'warning':
                notification.style.background = '#FF9800';
                break;
            default:
                notification.style.background = '#2196F3';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    saveData() {
        try {
            localStorage.setItem('loreVault_data', JSON.stringify(this.mediaData));
            localStorage.setItem('loreVault_badges', JSON.stringify(this.badges));
            localStorage.setItem('loreVault_customStatuses', JSON.stringify(this.customStatuses));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    loadData() {
        try {
            const data = localStorage.getItem('loreVault_data');
            if (data) {
                this.mediaData = JSON.parse(data);
            }

            const badges = localStorage.getItem('loreVault_badges');
            if (badges) {
                this.badges = JSON.parse(badges);
            }

            const customStatuses = localStorage.getItem('loreVault_customStatuses');
            if (customStatuses) {
                this.customStatuses = JSON.parse(customStatuses);
            }

            const theme = localStorage.getItem('loreVault_theme');
            if (theme) {
                this.setTheme(theme);
            }

            const nickname = localStorage.getItem('loreVault_nickname');
            const password = localStorage.getItem('loreVault_password');
            
            if (nickname) {
                document.getElementById('nickname').value = nickname;
            }
            if (password) {
                document.getElementById('password').value = password;
            }

        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }
}

let loreVault;
