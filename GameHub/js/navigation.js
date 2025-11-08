// Navigation function for all games
function goHome() {
    window.location.href = '../index.html';
}

// Add to all game pages
if (typeof window !== 'undefined') {
    window.goHome = goHome;
}