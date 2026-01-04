// records.js - Système de réalisations et encouragements
class AchievementManager {
    constructor() {
        this.achievements = this.loadAchievements();
        this.milestones = {
            total: [1, 5, 10, 15, 20, 25, 30, 40, 50, 70, 100, 150, 200],
            watched: [5, 10, 15, 20, 25, 30, 50, 70, 100],
            inProgress: [3, 5, 10, 15, 20, 30],
            toWatch: [5, 10, 20, 30, 50]
        };
        
        this.categoryMilestones = {
            anime: [5, 10, 15, 25, 30, 50, 70, 100],
            manga: [5, 10, 15, 25, 30, 50, 70, 100],
            webtoon: [5, 10, 15, 25, 30, 50, 70, 100],
            serie: [5, 10, 15, 25, 30, 50, 70, 100],
            film: [5, 10, 15, 25, 30, 50, 70, 100],
            'light-novel': [5, 10, 15, 25, 30, 50],
            livre: [5, 10, 15, 25, 30, 50]
        };
    }

    loadAchievements() {
        const saved = localStorage.getItem('loreVault_achievements');
        return saved ? JSON.parse(saved) : [];
    }

    saveAchievements() {
        localStorage.setItem('loreVault_achievements', JSON.stringify(this.achievements));
    }

    checkAchievements(mediaData, newItem, isNew, oldItem) {
        if (isNew) {
            this.showEncouragement(newItem);
        }

        // Vérifier les jalons totaux
        this.checkTotalMilestone(mediaData.length);

        // Vérifier les jalons par statut
        const statusCounts = this.getStatusCounts(mediaData);
        this.checkStatusMilestones(statusCounts);

        // Vérifier les jalons par catégorie
        const categoryCounts = this.getCategoryCounts(mediaData);
        this.checkCategoryMilestones(categoryCounts);

        // Vérifier si changement de statut
        if (!isNew && oldItem && oldItem.status !== newItem.status) {
            this.checkStatusChange(newItem, oldItem, statusCounts);
        }
    }

    getStatusCounts(mediaData) {
        return {
            watched: mediaData.filter(item => item.status === 'Déjà regardé').length,
            inProgress: mediaData.filter(item => item.status === 'En cours').length,
            toWatch: mediaData.filter(item => item.status === 'À regarder').length
        };
    }

    getCategoryCounts(mediaData) {
        const counts = {};
        mediaData.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return counts;
    }

    checkTotalMilestone(total) {
        if (this.milestones.total.includes(total)) {
            const achievementKey = `total_${total}`;
            if (!this.hasAchievement(achievementKey)) {
                this.unlockAchievement(achievementKey, {
                    title: this.getTotalMilestoneTitle(total),
                    description: `${total} médias dans votre collection !`,
                    icon: 'fas fa-trophy',
                    confetti: true
                });
            }
        }
    }

    checkStatusMilestones(statusCounts) {
        // Jalons "Déjà regardé"
        if (this.milestones.watched.includes(statusCounts.watched)) {
            const key = `watched_${statusCounts.watched}`;
            if (!this.hasAchievement(key)) {
                this.unlockAchievement(key, {
                    title: this.getWatchedMilestoneTitle(statusCounts.watched),
                    description: `${statusCounts.watched} médias terminés !`,
                    icon: 'fas fa-check-circle',
                    confetti: true
                });
            }
        }

        // Jalons "En cours"
        if (this.milestones.inProgress.includes(statusCounts.inProgress)) {
            const key = `inprogress_${statusCounts.inProgress}`;
            if (!this.hasAchievement(key)) {
                this.unlockAchievement(key, {
                    title: 'Multi-tâche !',
                    description: `${statusCounts.inProgress} médias en cours`,
                    icon: 'fas fa-tasks',
                    confetti: false
                });
            }
        }

        // Jalons "À regarder"
        if (this.milestones.toWatch.includes(statusCounts.toWatch)) {
            const key = `towatch_${statusCounts.toWatch}`;
            if (!this.hasAchievement(key)) {
                this.unlockAchievement(key, {
                    title: 'Liste ambitieuse !',
                    description: `${statusCounts.toWatch} médias en attente`,
                    icon: 'fas fa-list-ul',
                    confetti: false
                });
            }
        }
    }

    checkCategoryMilestones(categoryCounts) {
        Object.entries(categoryCounts).forEach(([category, count]) => {
            if (this.categoryMilestones[category] && this.categoryMilestones[category].includes(count)) {
                const key = `category_${category}_${count}`;
                if (!this.hasAchievement(key)) {
                    this.unlockAchievement(key, {
                        title: this.getCategoryMilestoneTitle(category, count),
                        description: `${count} ${this.getCategoryName(category)} !`,
                        icon: this.getCategoryIcon(category),
                        confetti: count >= 25
                    });
                }
            }
        });
    }

    checkStatusChange(newItem, oldItem, statusCounts) {
        if (newItem.status === 'Déjà regardé' && oldItem.status !== 'Déjà regardé') {
            this.showCompletionMessage(newItem);
        }
    }

    showEncouragement(item) {
        const messages = [
            { text: 'Excellent choix !', icon: 'fas fa-star' },
            { text: 'Ajouté avec succès !', icon: 'fas fa-check' },
            { text: 'Super addition !', icon: 'fas fa-thumbs-up' },
            { text: 'Parfait !', icon: 'fas fa-fire' },
            { text: 'Bien joué !', icon: 'fas fa-medal' },
            { text: 'Continuez comme ça !', icon: 'fas fa-rocket' },
            { text: 'Magnifique !', icon: 'fas fa-gem' },
            { text: 'Beau catalogue !', icon: 'fas fa-paint-brush' }
        ];

        const random = messages[Math.floor(Math.random() * messages.length)];
        this.showToast(random.text, `"${item.title}" ajouté à votre collection`, random.icon, false);
    }

    showCompletionMessage(item) {
        const messages = [
            { text: 'Un de plus terminé !', icon: 'fas fa-check-double' },
            { text: 'Bravo pour avoir fini !', icon: 'fas fa-trophy' },
            { text: 'Mission accomplie !', icon: 'fas fa-flag-checkered' },
            { text: 'Excellent travail !', icon: 'fas fa-star' },
            { text: 'Félicitations !', icon: 'fas fa-award' }
        ];

        const random = messages[Math.floor(Math.random() * messages.length)];
        this.showToast(random.text, `"${item.title}" marqué comme terminé`, random.icon, false);
    }

    hasAchievement(key) {
        return this.achievements.includes(key);
    }

    unlockAchievement(key, data) {
        this.achievements.push(key);
        this.saveAchievements();
        this.showToast(data.title, data.description, data.icon, data.confetti);
    }

    showToast(title, description, iconClass, showConfetti) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="achievement-content">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        if (showConfetti) {
            this.launchConfetti();
        }

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 4000);
    }

    launchConfetti() {
        const colors = ['#6666ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ff9ff3'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                
                document.body.appendChild(confetti);

                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 30);
        }
    }

    getTotalMilestoneTitle(count) {
        const titles = {
            1: 'Premier pas !',
            5: 'Bon début !',
            10: 'Collection naissante !',
            15: 'Bibliothèque grandissante !',
            20: 'Collectionneur confirmé !',
            25: 'Quart de siècle !',
            30: 'Trentaine accomplie !',
            40: 'Quarantaine passée !',
            50: 'Demi-centenaire !',
            70: 'Septuagénaire !',
            100: 'CENTENAIRE ! Incroyable !',
            150: '150 médias ! Impressionnant !',
            200: '200 médias ! LÉGENDAIRE !'
        };
        return titles[count] || `${count} médias !`;
    }

    getWatchedMilestoneTitle(count) {
        const titles = {
            5: '5 terminés !',
            10: '10 complétés !',
            15: '15 finis !',
            20: '20 achevés !',
            25: '25 terminés !',
            30: '30 complétés !',
            50: '50 finis ! Expert !',
            70: '70 complétés ! Pro !',
            100: '100 TERMINÉS ! MAÎTRE !'
        };
        return titles[count] || `${count} terminés !`;
    }

    getCategoryMilestoneTitle(category, count) {
        const categoryNames = {
            anime: 'Animes',
            manga: 'Mangas',
            webtoon: 'Webtoons',
            serie: 'Séries',
            film: 'Films',
            'light-novel': 'Light Novels',
            livre: 'Livres'
        };

        const name = categoryNames[category] || category;

        if (count >= 100) return `${count} ${name} ! LÉGENDE !`;
        if (count >= 70) return `${count} ${name} ! Expert !`;
        if (count >= 50) return `${count} ${name} ! Pro !`;
        if (count >= 30) return `${count} ${name} !`;
        if (count >= 25) return `${count} ${name} !`;
        if (count >= 15) return `${count} ${name} !`;
        if (count >= 10) return `${count} ${name} !`;
        return `${count} ${name} !`;
    }

    getCategoryName(category) {
        const names = {
            anime: 'animes',
            manga: 'mangas',
            webtoon: 'webtoons',
            serie: 'séries',
            film: 'films',
            'light-novel': 'light novels',
            livre: 'livres'
        };
        return names[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            anime: 'fas fa-play-circle',
            manga: 'fas fa-book',
            webtoon: 'fas fa-mobile-alt',
            serie: 'fas fa-tv',
            film: 'fas fa-film',
            'light-novel': 'fas fa-feather',
            livre: 'fas fa-book-open'
        };
        return icons[category] || 'fas fa-star';
    }
}
