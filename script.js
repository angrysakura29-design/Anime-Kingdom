// ඇනිමේ 30 ක දත්ත ලැයිස්තුව (නම් සහ පින්තූර ලින්ක්)
const animeData =;

// ඇනිමේ පෝස්ටර් පෙන්වන Function එක
function initApp() {
    const grid = document.getElementById('animeGrid');
    if (!grid) return;

    grid.innerHTML = animeData.map(anime => `
        <div class="anime-card">
            <img src="${anime.image}" alt="${anime.title}" loading="lazy">
            <h3>${anime.title}</h3>
        </div>
    `).join('');
}

// වෙබ් අඩවිය Load වූ විගස ක්‍රියාත්මක කරන්න
document.addEventListener('DOMContentLoaded', initApp);
