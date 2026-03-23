console.log("Script Connected!");

window.onload = () => {
    console.log("Loading Home Data...");
    // එක් එක් කාණ්ඩයට අදාළ දත්ත API එකෙන් ලබා ගැනීම
    fetchHomeData('airing', 'latestAnime', 10);
    fetchHomeData('upcoming', 'trendingAnime', 10);
    fetchHomeData('bypopularity', 'popularAnime', 10);
    fetchHomeData('tv', 'tvSeriesList', 10);
    fetchHomeData('airing', 'recentEpisodes', 10);
};

async function fetchHomeData(filter, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container not found: " + containerId);
        return;
    }

    try {
        const url = `https://api.jikan.moe{filter}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        const animeList = data.data;

        if (!animeList) return;

        container.innerHTML = ""; // පරණ දත්ත මකන්න

        animeList.forEach(anime => {
            container.innerHTML += `
                <div class="card" style="min-width: 155px; background: #141414; padding: 10px; border-radius: 12px; text-align: center; flex-shrink: 0; border: 1px solid #222; margin-right: 10px;">
                    <img src="${anime.images.jpg.image_url}" style="width: 100%; border-radius: 8px; height: 215px; object-fit: cover;">
                    <div style="font-size: 13px; margin-top: 10px; color: white; height: 35px; overflow: hidden; line-height: 1.2;">
                        ${anime.title}
                    </div>
                    <div style="margin-top: 5px; font-size: 11px; color: #ff416c;">
                        ⭐ ${anime.score || 'N/A'}
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading " + containerId + ": ", error);
    }
}

// Search Function (මෙයද ගොනුවේ අගටම දාන්න)
async function searchAnime() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    if (!query) return alert("Please enter anime name!");
    resultsContainer.innerHTML = "<p style='color:white; text-align:center; width:100%;'>Searching...</p>";
    try {
        const res = await fetch(`https://api.jikan.moe{query}&limit=12`);
        const d = await res.json();
        resultsContainer.innerHTML = "";
        d.data.forEach(anime => {
            resultsContainer.innerHTML += `
                <div class="card" style="width: 155px; background: #141414; padding: 10px; border-radius: 12px; margin-bottom:15px; text-align:center;">
                    <img src="${anime.images.jpg.image_url}" style="width:100%; height:215px; object-fit:cover; border-radius:8px;">
                    <h4 style="color:white; font-size:13px; height:35px; overflow:hidden;">${anime.title}</h4>
                </div>`;
        });
    } catch (e) { resultsContainer.innerHTML = "<p style='color:red;'>Error</p>"; }
}
