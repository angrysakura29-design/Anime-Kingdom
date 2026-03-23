window.onload = () => {
    fetchAnimeData('airing', 'latestAnime', 12);
    fetchAnimeData('upcoming', 'trendingAnime', 12);
    fetchAnimeData('favorite', 'popularAnime', 12);
};

async function fetchAnimeData(filter, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`https://api.jikan.moe{filter}&limit=${limit}`);
        const data = await response.json();
        const animeList = data.data;

        container.innerHTML = ""; 

        animeList.forEach(anime => {
            // Rating එක කෙටි කර පෙන්වීමට (උදා: PG-13)
            const rating = anime.rating ? anime.rating.split(' ')[0] : 'G';

            container.innerHTML += `
                <a href="${anime.url}" target="_blank" class="card">
                    <span class="tag-rating">${rating}</span>
                    <span class="tag-hd">HD</span>
                    <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
                    <div class="card-title">${anime.title}</div>
                    <div style="font-size: 11px; color: #ff416c; padding-left: 5px; padding-bottom: 10px;">⭐ ${anime.score || 'N/A'}</div>
                </a>
            `;
        });
    } catch (error) {
        console.error("Error:", error);
    }
}
