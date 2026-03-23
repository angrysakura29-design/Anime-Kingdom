const animeData =, "Season 2": ["Ep 1", "Ep 2"] } },
    { id: 2, title: "Solo Leveling", image: "https://s4.anilist.co", seasons: { "Season 1": ["Ep 1", "Ep 2", "Ep 3"] } },
    { id: 3, title: "One Piece", image: "https://s4.anilist.co", seasons: { "Wano": ["Ep 1000"], "Egghead": ["Ep 1100"] } },
    { id: 4, title: "Demon Slayer", image: "https://s4.anilist.co", seasons: { "Season 1": ["Ep 1"], "Season 2": ["Ep 1"] } },
    { id: 5, title: "Naruto Shippuden", image: "https://s4.anilist.co", seasons: { "Season 1": ["Ep 1"] } },
    { id: 6, title: "Attack on Titan", image: "https://s4.anilist.co", seasons: { "Final": ["Ep 1"] } },
    { id: 7, title: "Black Clover", image: "https://s4.anilist.co", seasons: { "Season 1": ["Ep 1"] } },
    { id: 8, title: "Blue Lock", image: "https://s4.anilist.co", seasons: { "Season 1": ["Ep 1"] } },
    { id: 9, title: "Chainsaw Man", image: "https://s4.anilist.co", seasons: { "Season 1": ["Ep 1"] } },
    { id: 10, title: "Haikyuu!!", image: "https://s4.anilist.co", seasons: { "Season 1": ["Ep 1"] } }
    // ඔබට තවත් 20ක් මේ විදියටම එකතු කරන්න පුළුවන්...
];

function initApp() {
    const grid = document.getElementById('animeGrid');
    if (!grid) return;

    grid.innerHTML = animeData.map(anime => `
        <div class="anime-card" onclick="openAnime(${anime.id})">
            <img src="${anime.image}" alt="${anime.title}">
            <h3>${anime.title}</h3>
        </div>
    `).join('');
}

let selectedAnime = null;

function openAnime(id) {
    selectedAnime = animeData.find(a => a.id === id);
    document.getElementById('modalTitle').innerText = selectedAnime.title;
    const select = document.getElementById('seasonSelect');
    select.innerHTML = Object.keys(selectedAnime.seasons).map(s => `<option value="${s}">${s}</option>`).join('');
    loadEpisodes();
    document.getElementById('animeModal').style.display = "block";
}

function loadEpisodes() {
    const s = document.getElementById('seasonSelect').value;
    document.getElementById('episodeList').innerHTML = selectedAnime.seasons[s].map(ep => `<div class="episode-item">${ep}</div>`).join('');
}

function closeModal() { document.getElementById('animeModal').style.display = "none"; }

window.onload = initApp;
