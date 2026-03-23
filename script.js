// ඇනිමේ 30 ක දත්ත ලැයිස්තුව
const animeData =;

// ඇනිමේ පෝස්ටර් Screen එකට පෙන්වන Function එක
function initApp() {
    const grid = document.getElementById('animeGrid');
    
    // කලින් තිබූ දේවල් මකා දමයි
    grid.innerHTML = "";

    // ඇනිමේ 30 ම පෙන්වයි
    animeData.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <img src="${anime.image}" alt="${anime.title}">
            <h3>${anime.title}</h3>
        `;
        grid.appendChild(card);
    });
}

// වෙබ් අඩවිය Load වන විට මෙය ක්‍රියාත්මක වේ
initApp();
