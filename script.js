// script.js - Fonctions utilitaires et initialisation

// Fonctions pour les modales
function setupModalEvents() {
    const modal = document.getElementById('mediaModal');
    const confirmModal = document.getElementById('confirmModal');
    
    document.getElementById('closeModal').addEventListener('click', () => {
        modal.classList.remove('show');
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        modal.classList.remove('show');
    });

    document.getElementById('closeConfirm').addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });

    document.getElementById('confirmCancel').addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('show');
        }
    });
}

// Fonctions pour les paramètres
function setupSettingsEvents() {
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        loreVault.confirmAction('Êtes-vous sûr de vouloir supprimer tous les catalogues ?', () => {
            const password = document.getElementById('password').value;
            const storedPassword = localStorage.getItem('loreVault_password');
            
            if (!storedPassword || password === storedPassword) {
                loreVault.mediaData = [];
                loreVault.saveData();
                loreVault.updateStats();
                loreVault.renderGrid();
                loreVault.showNotification('Tous les catalogues ont été supprimés', 'success');
            } else {
                loreVault.showNotification('Mot de passe incorrect', 'error');
            }
        });
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        const password = document.getElementById('password').value;
        const storedPassword = localStorage.getItem('loreVault_password');
        
        if (!storedPassword || password === storedPassword) {
            exportData();
        } else {
            loreVault.showNotification('Mot de passe incorrect', 'error');
        }
    });

    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('addImageBtn').addEventListener('click', () => {
        document.getElementById('imageFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
        importData(e.target.files[0]);
    });

    document.getElementById('imageFile').addEventListener('change', (e) => {
        handleImageUpload(e.target.files[0]);
    });
}

// Système de notation par étoiles
function setupRatingStars() {
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            currentRating = index + 1;
            document.getElementById('mediaRating').value = currentRating;
            updateStarDisplay(currentRating);
        });

        star.addEventListener('mouseover', () => {
            updateStarDisplay(index + 1);
        });
    });

    document.getElementById('ratingStars').addEventListener('mouseleave', () => {
        updateStarDisplay(currentRating);
    });
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#ffd700' : '#ccc';
    });
}

// Export des données
function exportData() {
    const data = {
        mediaData: loreVault.mediaData,
        badges: loreVault.badges,
        customStatuses: loreVault.customStatuses,
        achievements: loreVault.achievements.achievements,
        settings: {
            theme: loreVault.currentTheme,
            nickname: localStorage.getItem('loreVault_nickname') || ''
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loreVault_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    loreVault.showNotification('Données exportées avec succès', 'success');
}

// Import des données
function importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.mediaData && Array.isArray(data.mediaData)) {
                loreVault.mediaData = data.mediaData;
                
                if (data.badges) loreVault.badges = data.badges;
                if (data.customStatuses) loreVault.customStatuses = data.customStatuses;
                if (data.achievements) {
                    loreVault.achievements.achievements = data.achievements;
                    loreVault.achievements.saveAchievements();
                }
                if (data.settings) {
                    if (data.settings.theme) loreVault.setTheme(data.settings.theme);
                    if (data.settings.nickname) {
                        document.getElementById('nickname').value = data.settings.nickname;
                        localStorage.setItem('loreVault_nickname', data.settings.nickname);
                    }
                }
                
                loreVault.saveData();
                loreVault.updateStats();
                loreVault.renderGrid();
                loreVault.checkBadges();
                loreVault.showNotification('Données importées avec succès', 'success');
            } else {
                throw new Error('Format de fichier invalide');
            }
        } catch (error) {
            loreVault.showNotification('Erreur lors de l\'import: fichier invalide', 'error');
        }
    };
    reader.readAsText(file);
}

// Gestion des images
function handleImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        loreVault.showNotification('Image chargée (fonctionnalité en développement)', 'info');
    };
    reader.readAsDataURL(file);
}

// Action de confirmation
LoreVault.prototype.confirmAction = function(message, callback) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    
    messageEl.textContent = message;
    modal.classList.add('show');
    
    okBtn.onclick = () => {
        callback();
        modal.classList.remove('show');
    };
};

// Gestion des gestes tactiles pour mobile
function setupTouchGestures() {
    if (!('ontouchstart' in window)) return;

    let touchStartX, touchStartY, touchEndX, touchEndY;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0 && touchStartX < 50) {
                document.getElementById('sidebar').classList.add('open');
                document.getElementById('overlay').classList.add('show');
            } else if (deltaX < 0 && document.getElementById('sidebar').classList.contains('open')) {
                loreVault.closeSidebar();
            }
        }
    }

    // Long press pour éditer sur mobile
    let longPressTimer;
    
    document.addEventListener('touchstart', (e) => {
        if (e.target.closest('.media-card')) {
            longPressTimer = setTimeout(() => {
                const card = e.target.closest('.media-card');
                const match = card.onclick.toString().match(/'([^']+)'/);
                if (match) {
                    const id = match[1];
                    loreVault.openMediaModal(loreVault.findItemById(id));
                }
            }, 800);
        }
    });
    
    document.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
    });
    
    document.addEventListener('touchmove', () => {
        clearTimeout(longPressTimer);
    });
}

// Raccourcis clavier
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N pour ajouter un nouveau média
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            loreVault.openMediaModal();
        }
        
        // Escape pour fermer les modals
        if (e.key === 'Escape') {
            document.getElementById('mediaModal').classList.remove('show');
            document.getElementById('confirmModal').classList.remove('show');
            loreVault.closeSidebar();
            if (loreVault.focusMode) {
                loreVault.toggleFocusMode();
            }
        }
        
        // Ctrl/Cmd + F pour focus sur la recherche
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // F pour mode focus
        if (e.key === 'f' && !e.ctrlKey && !e.metaKey && 
            document.activeElement.tagName !== 'INPUT' && 
            document.activeElement.tagName !== 'TEXTAREA') {
            loreVault.toggleFocusMode();
        }
    });
}

// Gestion de l'état online/offline
function setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
        document.body.style.borderTop = '3px solid #4CAF50';
        setTimeout(() => {
            document.body.style.borderTop = 'none';
        }, 2000);
    });

    window.addEventListener('offline', () => {
        document.body.style.borderTop = '3px solid #FF9800';
    });
}

// Auto-sauvegarde
function setupAutoSave() {
    setInterval(() => {
        if (loreVault && loreVault.mediaData.length > 0) {
            loreVault.saveData();
        }
    }, 30000); // Toutes les 30 secondes
}

// Service Worker
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log(' Service Worker enregistré !'))
                .catch(err => console.log(' Erreur Service Worker:', err));
        });
    }
}

// Vérifier les rappels au démarrage
function checkReminders() {
    loreVault.mediaData.forEach(item => {
        if (item.reminderDate) {
            const reminderTime = new Date(item.reminderDate).getTime();
            const now = Date.now();
            
            // Si le rappel est dans les dernières 24h
            if (reminderTime <= now && reminderTime > now - 86400000) {
                loreVault.showNotification(`Rappel: ${item.title}`, 'warning');
            }
        }
    });
}

// Message de bienvenue
function showWelcomeMessage() {
    setTimeout(() => {
        const nickname = localStorage.getItem('loreVault_nickname');
        const welcomeMessage = nickname ? 
            `Bienvenue ${nickname} dans LoreVault ! 🎉` : 
            'Bienvenue dans LoreVault ! 🎉';
        loreVault.showNotification(welcomeMessage, 'info');
    }, 1000);
}

// INITIALISATION PRINCIPALE
document.addEventListener('DOMContentLoaded', () => {
    // Créer l'instance principale
    loreVault = new LoreVault();
    
    // Configurer tous les event listeners
    setupModalEvents();
    setupSettingsEvents();
    setupRatingStars();
    setupTouchGestures();
    setupKeyboardShortcuts();
    setupOnlineOfflineHandlers();
    setupAutoSave();
    setupServiceWorker();
    
    // Messages et rappels
    showWelcomeMessage();
    checkReminders();
    
    console.log(' LoreVault initialisé avec succès !');
});
