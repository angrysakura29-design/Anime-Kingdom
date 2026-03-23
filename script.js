const animeData =;

function initApp() {
    const grid = document.getElementById('animeGrid');
    if (!grid) return; // Grid එක නැත්නම් මෙතනින් නවතී

    grid.innerHTML = animeData.map(anime => `
        <div class="anime-card">
            <img src="${anime.image}" alt="${anime.title}" onerror="this.src='https://via.placeholder.com'">
            <h3>${anime.title}</h3>
        </div>
    `).join('');
}

// පිටුව Load වූ පසු පමණක් මෙය ක්‍රියාත්මක වේ
window.onload = initApp;
