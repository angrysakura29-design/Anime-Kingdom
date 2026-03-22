const animeData =, "Season 2": ["Ep 1", "Ep 2"] } },
    { id: 2, title: "Black Clover", tag: "HD", image: "https://m.media-amazon.com", seasons: { "Season 1": ["Ep 1", "Ep 2"] } },
    { id: 3, title: "Demon Slayer", tag: "R", image: "https://m.media-amazon.com", seasons: { "Season 1": ["Ep 1"] } },
    // මෙලෙස තවත් 20ක් දක්වා items එකතු කරන්න...
];

function initApp() {
    const grid = document.getElementById('animeGrid');
    grid.innerHTML = animeData.map(anime => `
        <div class="anime-card" onclick="openAnime(${anime.id})">
            <span class="tag">${anime.tag}</span>
            <img src="${anime.image}">
        </div>
    `).join('');
}

let currentAnime = null;

function openAnime(id) {
    currentAnime = animeData.find(a => a.id === id);
    document.getElementById('modalTitle').innerText = currentAnime.title;
    const select = document.getElementById('seasonSelect');
    select.innerHTML = Object.keys(currentAnime.seasons).map(s => `<option value="${s}">${s}</option>`).join('');
    loadEpisodes();
    document.getElementById('animeModal').style.display = "block";
}

function loadEpisodes() {
    const s = document.getElementById('seasonSelect').value;
    document.getElementById('episodeList').innerHTML = currentAnime.seasons[s].map(ep => `<div class="episode-item" style="padding:10px; border-bottom:1px solid #333;">${ep}</div>`).join('');
}

function closeModal() { document.getElementById('animeModal').style.display = "none"; }

initApp();
