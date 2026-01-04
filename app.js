// app.js - Logique de l'application

class LoreVaultApp {
    constructor() {
        this.currentFilter = {
            search: '',
            category: 'all',
            sort: 'date-desc'
        };
        this.editingMediaId = null;
        this.init();
    }

    init() {
        // Charger le thème
        this.loadTheme();
        
        // Afficher les médias
        this.renderMedia();
        
        // Événements de recherche et filtres
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Recherche
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value.toLowerCase();
            this.renderMedia();
        });

        // Filtre par catégorie
        const categoryFilter = document.getElementById('category-filter');
        categoryFilter.addEventListener('change', (e) => {
            this.currentFilter.category = e.target.value;
            this.renderMedia();
        });

        // Tri
        const sortFilter = document.getElementById('sort-filter');
        sortFilter.addEventListener('change', (e) => {
            this.currentFilter.sort = e.target.value;
            this.renderMedia();
        });

        // Note en temps réel
        const ratingInput = document.getElementById('media-rating');
        if (ratingInput) {
            ratingInput.addEventListener('input', (e) => {
                document.getElementById('rating-display').textContent = parseFloat(e.target.value).toFixed(1);
            });
        }
    }

    // Filtrer et trier les médias
    getFilteredMedia() {
        let filtered = records.getAllMedia();

        // Filtre de recherche
        if (this.currentFilter.search) {
            filtered = filtered.filter(m => 
                m.title.toLowerCase().includes(this.currentFilter.search) ||
                m.category.toLowerCase().includes(this.currentFilter.search)
            );
        }

        // Filtre par catégorie
        if (this.currentFilter.category !== 'all') {
            filtered = filtered.filter(m => m.category === this.currentFilter.category);
        }

        // Tri
        switch (this.currentFilter.sort) {
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                break;
            case 'rating-desc':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-asc':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
            case 'title-asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'favorites':
                filtered = filtered.filter(m => m.favorite);
                filtered.sort((a, b) => b.rating - a.rating);
                break;
        }

        return filtered;
    }

    // Afficher les médias
    renderMedia() {
        const mediaGrid = document.getElementById('media-grid');
        const emptyState = document.getElementById('empty-state');
        const filtered = this.getFilteredMedia();

        if (filtered.length === 0) {
            mediaGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        mediaGrid.innerHTML = filtered.map(media => this.createMediaCard(media)).join('');
    }

    // Créer une carte de média
    createMediaCard(media) {
        const imageHtml = media.image 
            ? `<img src="${media.image}" alt="${media.title}" onerror="this.parentElement.innerHTML='<i class=\"fas fa-image\"></i>'">`
            : '<i class="fas fa-image"></i>';

        const favoriteClass = media.favorite ? 'active' : '';

        return `
            <div class="media-card" data-id="${media.id}">
                <div class="media-image">
                    ${imageHtml}
                </div>
                <div class="media-content">
                    <div class="media-header">
                        <div>
                            <div class="media-category">${media.category}</div>
                            <h3 class="media-title">${media.title}</h3>
                        </div>
                    </div>
                    <div class="media-rating">
                        <i class="fas fa-star"></i>
                        <span>${media.rating.toFixed(1)}/10</span>
                    </div>
                    ${media.notes ? `<p style="color: var(--text-secondary); font-size: 14px; margin-top: 8px; line-height: 1.4;">${media.notes.substring(0, 100)}${media.notes.length > 100 ? '...' : ''}</p>` : ''}
                    <div class="media-actions">
                        <button class="btn-action favorite ${favoriteClass}" onclick="app.toggleFavorite('${media.id}')">
                            <i class="${media.favorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <button class="btn-action" onclick="app.editMedia('${media.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action" onclick="app.deleteMedia('${media.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Basculer favori
    toggleFavorite(id) {
        records.toggleFavorite(id);
        this.renderMedia();
    }

    // Éditer un média
    editMedia(id) {
        const media = records.getMediaById(id);
        if (!media) return;

        this.editingMediaId = id;
        document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> Modifier le média';
        document.getElementById('media-id').value = id;
        document.getElementById('media-title').value = media.title;
        document.getElementById('media-category').value = media.category;
        document.getElementById('media-rating').value = media.rating;
        document.getElementById('rating-display').textContent = media.rating.toFixed(1);
        document.getElementById('media-image').value = media.image;
        document.getElementById('media-notes').value = media.notes;
        document.getElementById('media-favorite').checked = media.favorite;

        document.getElementById('media-modal').classList.remove('hidden');
    }

    // Supprimer un média
    deleteMedia(id) {
        const media = records.getMediaById(id);
        if (!media) return;

        if (confirm(`Êtes-vous sûr de vouloir supprimer "${media.title}" ?`)) {
            records.deleteMedia(id);
            this.renderMedia();
        }
    }

    // Soumettre le formulaire
    submitMediaForm(e) {
        e.preventDefault();

        const mediaData = {
            title: document.getElementById('media-title').value,
            category: document.getElementById('media-category').value,
            rating: document.getElementById('media-rating').value,
            image: document.getElementById('media-image').value,
            notes: document.getElementById('media-notes').value,
            favorite: document.getElementById('media-favorite').checked
        };

        const mediaId = document.getElementById('media-id').value;
        
        if (mediaId) {
            // Mise à jour
            records.updateMedia(mediaId, mediaData);
        } else {
            // Ajout
            records.addMedia(mediaData);
        }

        this.renderMedia();
        closeMediaModal();
    }

    // Afficher les statistiques
    showStats() {
        const stats = records.getStats();
        const achievements = records.getAchievements();
        const statsContent = document.getElementById('stats-content');

        const categoryStatsHtml = Object.entries(stats.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => `
                <div class="category-item">
                    <span class="category-name">${category}</span>
                    <span class="category-count">${count}</span>
                </div>
            `).join('');

        const achievementsHtml = achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `).join('');

        const topRatedHtml = stats.topRated.map(media => `
            <div class="category-item">
                <span class="category-name">${media.title}</span>
                <span class="category-count">${media.rating.toFixed(1)}</span>
            </div>
        `).join('');

        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-layer-group"></i>
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Médias</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-heart"></i>
                    <div class="stat-value">${stats.favorites}</div>
                    <div class="stat-label">Favoris</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-star"></i>
                    <div class="stat-value">${stats.averageRating}</div>
                    <div class="stat-label">Note moyenne</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tags"></i>
                    <div class="stat-value">${Object.keys(stats.byCategory).length}</div>
                    <div class="stat-label">Catégories</div>
                </div>
            </div>

            ${stats.topRated.length > 0 ? `
                <div class="category-stats">
                    <h3><i class="fas fa-trophy"></i> Top 5 - Meilleurs médias</h3>
                    <div class="category-list">
                        ${topRatedHtml}
                    </div>
                </div>
            ` : ''}

            ${Object.keys(stats.byCategory).length > 0 ? `
                <div class="category-stats">
                    <h3><i class="fas fa-chart-pie"></i> Répartition par catégorie</h3>
                    <div class="category-list">
                        ${categoryStatsHtml}
                    </div>
                </div>
            ` : ''}

            <div class="achievements-section">
                <h3><i class="fas fa-medal"></i> Réalisations</h3>
                <div class="achievements-grid">
                    ${achievementsHtml}
                </div>
            </div>
        `;

        document.getElementById('stats-modal').classList.remove('hidden');
    }

    // Gestion des thèmes
    loadTheme() {
        const theme = records.loadTheme();
        document.documentElement.setAttribute('data-theme', theme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        records.saveTheme(theme);
    }
}

// Initialiser l'app
const app = new LoreVaultApp();
