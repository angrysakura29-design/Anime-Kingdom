const tvData = [
    { title: "One Piece", img: "https://s4.anilist.co", rate: "PG-13" },
    { title: "Naruto", img: "https://s4.anilist.co", rate: "PG-13" },
    { title: "Solo Leveling", img: "https://s4.anilist.co", rate: "R" },
    { title: "Demon Slayer", img: "https://s4.anilist.co", rate: "HD" }
];

const movieData = [
    { title: "A Silent Voice", img: "https://s4.anilist.co", rate: "HD" },
    { title: "Your Name", img: "https://s4.anilist.co", rate: "PG-13" }
];

function renderRow(id, list) {
    const container = document.getElementById(id);
    container.innerHTML = list.map(a => `
        <div class="card">
            <span class="tag-rating">${a.rate}</span>
            <span class="tag-hd">HD</span>
            <img src="${a.img}">
            <div class="card-title">${a.title}</div>
        </div>
    `).join('');
}

window.onload = () => {
    renderRow('tvSeries', tvData);
    renderRow('topMovies', movieData);
    renderRow('mostPopular', tvData); // දැනට පරණ ඒවාම දැමුවා
};
async function searchAnime() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    
    if (!query) return alert("කරුණාකර නමක් ඇතුළත් කරන්න!");

    resultsContainer.innerHTML = "<p>සොයමින් පවතිී...</p>";

    try {
        const response = await fetch(`https://api.jikan.moe{query}&limit=12`);
        const data = await response.json();
        const animeList = data.data;

        resultsContainer.innerHTML = ""; // කලින් තිබූ ප්‍රතිඵල ඉවත් කරයි

        animeList.forEach(anime => {
            const animeCard = `
                <div class="anime-card">
                    <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
                    <h3>${anime.title}</h3>
                    <p>Rating: ⭐ ${anime.score || 'N/A'}</p>
                    <a href="${anime.url}" target="_blank">වැඩි විස්තර</a>
                </div>
            `;
            resultsContainer.innerHTML += animeCard;
        });
    } catch (error) {
        resultsContainer.innerHTML = "<p>දත්ත ලබාගැනීමේදී දෝෂයක් ඇති විය.</p>";
    }
}
