window.onload = async () => {
    console.log("Loading Anime Data...");
    
    // API එකෙන් block නොවීමට එකින් එක දත්ත පූරණය කිරීම
    const sections = [
        ['airing', 'latestAnime'],
        ['upcoming', 'trendingAnime'],
        ['bypopularity', 'popularAnime'],
        ['tv', 'tvSeriesList'],
        ['airing', 'recentEpisodes']
    ];

    for (const [filter, id] of sections) {
        await fetchAnimeData(filter, id);
        // API Rate Limit මගහැරීමට සුළු විරාමයක් ලබා දෙයි
        await new Promise(res => setTimeout(res, 800)); 
    }
};

async function fetchAnimeData(filter, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // නිවැරදි කළ API URL එක
        const response = await fetch(`https://api.jikan.moe{filter}&limit=10`);
        const data = await response.json();
        const animeList = data.data;

        container.innerHTML = ""; 

        if (animeList) {
            animeList.forEach(anime => {
                // Rating එක කෙටි කර පෙන්වීමට (උදා: PG-13)
                const rating = anime.rating ? anime.rating.split(' ')[0] : 'PG';

                container.innerHTML += `
                    <a href="${anime.url}" target="_blank" class="card">
                        <span class="tag-rating">${rating}</span>
                        <span class="tag-hd">HD</span>
                        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
                        <div class="card-title">${anime.title}</div>
                        <div style="font-size: 11px; color: #ff416c; padding: 0 5px 10px; text-align: center;">⭐ ${anime.score || 'N/A'}</div>
                    </a>
                `;
            });
        }
    } catch (error) {
        console.error("Error loading " + containerId, error);
    }
}

// සෙවුම් (Search) පහසුකම සඳහා කේතය
async function searchAnime() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    if (!query) return alert("කරුණාකර නමක් ඇතුළත් කරන්න!");

    resultsContainer.innerHTML = "<p style='color:white; text-align:center; width:100%;'>Searching...</p>";

    try {
        const res = await fetch(`https://api.jikan.moe{encodeURIComponent(query)}&limit=12`);
        const d = await res.json();
        resultsContainer.innerHTML = "";

        if (d.data) {
            d.data.forEach(anime => {
                resultsContainer.innerHTML += `
                    <a href="${anime.url}" target="_blank" class="card" style="width: 150px; margin-bottom: 15px;">
                        <span class="tag-hd">HD</span>
                        <img src="${anime.images.jpg.image_url}">
                        <div class="card-title">${anime.title}</div>
                    </a>`;
            });
        }
    } catch (e) {
        resultsContainer.innerHTML = "<p style='color:red;'>දත්ත ලබාගැනීමේදී දෝෂයක් ඇති විය.</p>";
    }
}
