window.onload = async () => {
    console.log("Anime Kingdom loading...");
    
    // API එකෙන් block නොවීමට එකින් එක පින්තූර කාණ්ඩ ලබා ගැනීම
    // Filter එක, HTML ID එක, සහ පින්තූර ගණන මෙහි ඇත
    const sections = [
        ['airing', 'latestAnime', 10],
        ['upcoming', 'trendingAnime', 10],
        ['bypopularity', 'popularAnime', 10],
        ['tv', 'tvSeriesList', 10],
        ['airing', 'recentEpisodes', 10]
    ];

    for (const [filter, id, limit] of sections) {
        await fetchAnimeData(filter, id, limit);
        // API Rate Limit එක මගහැරීමට තත්පර 1ක විරාමයක් ලබා දෙයි
        await new Promise(res => setTimeout(res, 1000)); 
    }
};

async function fetchAnimeData(filter, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // නිවැරදි කළ API URL එක
        const response = await fetch(`https://api.jikan.moe{filter}&limit=${limit}`);
        const data = await response.json();
        const animeList = data.data;

        if (!animeList) return;

        container.innerHTML = ""; // පරණ දත්ත මකන්න

        animeList.forEach(anime => {
            const rating = anime.rating ? anime.rating.split(' ')[0] : 'PG';
            container.innerHTML += `
                <a href="${anime.url}" target="_blank" class="card">
                    <span class="tag-rating">${rating}</span>
                    <span class="tag-hd">HD</span>
                    <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
                    <div class="card-title">${anime.title}</div>
                    <div style="font-size: 11px; color: #ff416c; padding: 0 5px 10px; text-align: center;">⭐ ${anime.score || 'N/A'}</div>
                </a>
            `;
        });
    } catch (error) {
        console.error("Error loading " + containerId, error);
    }
}

// Search Function එක
async function searchAnime() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    if (!query) return alert("කරුණාකර නමක් ටයිප් කරන්න!");

    resultsContainer.innerHTML = "<p style='color:white; text-align:center; width:100%;'>Searching...</p>";

    try {
        const res = await fetch(`https://api.jikan.moe{encodeURIComponent(query)}&limit=12`);
        const d = await res.json();
        resultsContainer.innerHTML = "";

        d.data.forEach(anime => {
            resultsContainer.innerHTML += `
                <a href="${anime.url}" target="_blank" class="card" style="width: 150px; margin-bottom: 15px;">
                    <span class="tag-hd">HD</span>
                    <img src="${anime.images.jpg.image_url}">
                    <div class="card-title">${anime.title}</div>
                </a>`;
        });
    } catch (e) {
        resultsContainer.innerHTML = "<p style='color:red;'>සෙවීමේදී දෝෂයක් ඇති විය.</p>";
    }
}
