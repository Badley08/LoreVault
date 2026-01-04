// script.js - Gestion des événements UI

// Ouvrir/Fermer les modals
function openAddModal() {
    app.editingMediaId = null;
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus"></i> Ajouter un média';
    document.getElementById('media-form').reset();
    document.getElementById('media-id').value = '';
    document.getElementById('rating-display').textContent = '5.0';
    document.getElementById('media-modal').classList.remove('hidden');
}

function closeMediaModal() {
    document.getElementById('media-modal').classList.add('hidden');
    app.editingMediaId = null;
}

function openThemeModal() {
    document.getElementById('theme-modal').classList.remove('hidden');
}

function closeThemeModal() {
    document.getElementById('theme-modal').classList.add('hidden');
}

function openStatsModal() {
    app.showStats();
}

function closeStatsModal() {
    document.getElementById('stats-modal').classList.add('hidden');
}

// Fermer les modals en cliquant sur le fond
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeMediaModal();
        closeThemeModal();
        closeStatsModal();
    }
});

// Événements des boutons
document.getElementById('add-media-btn').addEventListener('click', openAddModal);
document.getElementById('theme-toggle').addEventListener('click', openThemeModal);
document.getElementById('stats-toggle').addEventListener('click', openStatsModal);

// Soumettre le formulaire
document.getElementById('media-form').addEventListener('submit', (e) => {
    app.submitMediaForm(e);
});

// Changer le thème
document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
        const theme = card.getAttribute('data-theme');
        app.setTheme(theme);
        closeThemeModal();
    });
});

// Escape pour fermer les modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMediaModal();
        closeThemeModal();
        closeStatsModal();
    }
});

// Afficher les informations de confidentialité
function showPrivacyInfo(e) {
    e.preventDefault();
    alert(
        '🔒 LoreVault respecte votre vie privée\n\n' +
        '✓ Aucun compte utilisateur requis\n' +
        '✓ Aucune synchronisation cloud\n' +
        '✓ Aucun tracking ou publicité\n' +
        '✓ Toutes vos données restent sur votre appareil\n' +
        '✓ Stockage 100% local via localStorage\n\n' +
        'Vos données vous appartiennent. Toujours.'
    );
}
