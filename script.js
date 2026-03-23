window.onload = async () => {
    console.log("Anime Kingdom loading with AniList API...");
    
    // ඔබේ වෙබ් අඩවියේ ඇති සෑම කොටසකටම අදාළ දත්ත ලබා ගැනීම
    const sections = [
        ['TRENDING_DESC', 'latestAnime', 10],      // Trending කොටසට
        ['POPULARITY_DESC', 'popularAnime', 10],   // Most Popular කොටසට
        ['SCORE_DESC', 'tvSeriesList', 10],        // TV Anime Series කොටසට
        ['START_DATE_DESC', 'recentEpisodes', 10]  // New Episodes කොටසට
    ];

    for (const [sort, id, limit] of sections) {
        await fetchAniListData(sort, id, limit);
        // API එකට බරක් නොවීමට කුඩා විරාමයක්
        await new Promise(res => setTimeout(res, 500)); 
    }

    // සර්ච් බාර් එකේ Enter එබූ විට සෙවීම සඳහා
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener("keypress", (e) => { 
            if (e.key === "Enter") searchAnime(); 
        });
    }
};

async function fetchAniListData(sortType, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // TV Series සඳහා පමණක් විශේෂ Filter එකක්
    const isTV = containerId === 'tvSeriesList' ? ', format: TV' : '';

    const query = `
    query ($sort: [MediaSort], $limit: Int) {
      Page(page: 1, perPage: $limit) {
        media(sort: $sort, type: ANIME, isAdult: false ${isTV}) {
          id
          title { romaji english }
          coverImage { large }
          averageScore
          siteUrl
        }
      }
    }`;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, variables: { sort: [sortType], limit: limit } })
        });
        const json = await response.json();
        renderAnimeCards(json.data.Page.media, container);
    } catch (error) {
        console.error("Error loading " + containerId, error);
    }
}

function renderAnimeCards(list, container) {
    container.innerHTML = ""; 
    list.forEach(anime => {
        const title = anime.title.english || anime.title.romaji;
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
        
        container.innerHTML += `
            <a href="${anime.siteUrl}" target="_blank" class="card">
                <span class="tag-hd">HD</span>
                <img src="${anime.coverImage.large}" alt="${title}" loading="lazy">
                <div class="card-title">${title}</div>
                <div style="font-size: 11px; color: #ff416c; text-align: center; padding-bottom: 8px;">⭐ ${score}</div>
            </a>
        `;
    });
}

// සෙවීමේ කාර්යය (Search Function)
async function searchAnime() {
    const queryText = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    if (!queryText) return alert("කරුණාකර නමක් ටයිප් කරන්න!");

    resultsContainer.innerHTML = "<p style='color:white; text-align:center; width:100%;'>Searching...</p>";

    const searchQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 12) {
        media(search: $search, type: ANIME, isAdult: false) {
          title { romaji english }
          coverImage { large }
          averageScore
          siteUrl
        }
      }
    }`;

    try {
        const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery, variables: { search: queryText } })
        });
        const json = await res.json();
        renderAnimeCards(json.data.Page.media, resultsContainer);
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        resultsContainer.innerHTML = "<p style='color:red;'>Error searching.</p>";
    }
}
