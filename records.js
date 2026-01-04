// records.js - Gestion du localStorage

const STORAGE_KEY = 'lorevault_media';
const THEME_KEY = 'lorevault_theme';

class RecordsManager {
    constructor() {
        this.media = this.loadMedia();
    }

    // Charger tous les médias depuis localStorage
    loadMedia() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erreur lors du chargement des médias:', error);
            return [];
        }
    }

    // Sauvegarder tous les médias dans localStorage
    saveMedia() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.media));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des médias:', error);
            return false;
        }
    }

    // Obtenir tous les médias
    getAllMedia() {
        return this.media;
    }

    // Obtenir un média par ID
    getMediaById(id) {
        return this.media.find(m => m.id === id);
    }

    // Ajouter un nouveau média
    addMedia(mediaData) {
        const newMedia = {
            id: this.generateId(),
            title: mediaData.title,
            category: mediaData.category,
            rating: parseFloat(mediaData.rating) || 0,
            image: mediaData.image || '',
            notes: mediaData.notes || '',
            favorite: mediaData.favorite || false,
            dateAdded: new Date().toISOString()
        };
        
        this.media.push(newMedia);
        this.saveMedia();
        return newMedia;
    }

    // Mettre à jour un média existant
    updateMedia(id, mediaData) {
        const index = this.media.findIndex(m => m.id === id);
        if (index === -1) return false;
        
        this.media[index] = {
            ...this.media[index],
            title: mediaData.title,
            category: mediaData.category,
            rating: parseFloat(mediaData.rating) || 0,
            image: mediaData.image || '',
            notes: mediaData.notes || '',
            favorite: mediaData.favorite || false
        };
        
        this.saveMedia();
        return this.media[index];
    }

    // Supprimer un média
    deleteMedia(id) {
        const index = this.media.findIndex(m => m.id === id);
        if (index === -1) return false;
        
        this.media.splice(index, 1);
        this.saveMedia();
        return true;
    }

    // Basculer le statut favori
    toggleFavorite(id) {
        const media = this.getMediaById(id);
        if (!media) return false;
        
        media.favorite = !media.favorite;
        this.saveMedia();
        return media.favorite;
    }

    // Générer un ID unique
    generateId() {
        return 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Obtenir les statistiques
    getStats() {
        const stats = {
            total: this.media.length,
            favorites: this.media.filter(m => m.favorite).length,
            averageRating: 0,
            byCategory: {},
            topRated: []
        };

        // Calculer la moyenne des notes
        if (this.media.length > 0) {
            const totalRating = this.media.reduce((sum, m) => sum + m.rating, 0);
            stats.averageRating = (totalRating / this.media.length).toFixed(1);
        }

        // Compter par catégorie
        this.media.forEach(m => {
            stats.byCategory[m.category] = (stats.byCategory[m.category] || 0) + 1;
        });

        // Top 5 des médias les mieux notés
        stats.topRated = [...this.media]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

        return stats;
    }

    // Obtenir les réalisations
    getAchievements() {
        const stats = this.getStats();
        const achievements = [
            {
                id: 'first_media',
                title: 'Premier pas',
                description: 'Ajouter votre premier média',
                icon: '🎬',
                unlocked: stats.total >= 1
            },
            {
                id: 'ten_media',
                title: 'Collectionneur',
                description: 'Ajouter 10 médias',
                icon: '📚',
                unlocked: stats.total >= 10
            },
            {
                id: 'fifty_media',
                title: 'Bibliothécaire',
                description: 'Ajouter 50 médias',
                icon: '🏛️',
                unlocked: stats.total >= 50
            },
            {
                id: 'hundred_media',
                title: 'Archiviste légendaire',
                description: 'Ajouter 100 médias',
                icon: '🏆',
                unlocked: stats.total >= 100
            },
            {
                id: 'first_favorite',
                title: 'Coup de cœur',
                description: 'Marquer un média en favori',
                icon: '❤️',
                unlocked: stats.favorites >= 1
            },
            {
                id: 'five_favorites',
                title: 'Passionné',
                description: 'Avoir 5 favoris',
                icon: '🌟',
                unlocked: stats.favorites >= 5
            },
            {
                id: 'high_rating',
                title: 'Critique exigeant',
                description: 'Noter 5 médias avec 9/10 ou plus',
                icon: '⭐',
                unlocked: this.media.filter(m => m.rating >= 9).length >= 5
            },
            {
                id: 'diverse',
                title: 'Éclectique',
                description: 'Avoir au moins 5 catégories différentes',
                icon: '🎭',
                unlocked: Object.keys(stats.byCategory).length >= 5
            }
        ];

        return achievements;
    }

    // Gestion du thème
    saveTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du thème:', error);
            return false;
        }
    }

    loadTheme() {
        try {
            return localStorage.getItem(THEME_KEY) || 'dark';
        } catch (error) {
            console.error('Erreur lors du chargement du thème:', error);
            return 'dark';
        }
    }

    // Exporter toutes les données (pour backup)
    exportData() {
        return {
            media: this.media,
            theme: this.loadTheme(),
            exportDate: new Date().toISOString()
        };
    }

    // Importer des données (pour restauration)
    importData(data) {
        try {
            if (data.media && Array.isArray(data.media)) {
                this.media = data.media;
                this.saveMedia();
            }
            if (data.theme) {
                this.saveTheme(data.theme);
            }
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'importation des données:', error);
            return false;
        }
    }

    // Effacer toutes les données
    clearAllData() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes vos données ? Cette action est irréversible.')) {
            this.media = [];
            this.saveMedia();
            return true;
        }
        return false;
    }
}

// Instance globale
const records = new RecordsManager();
