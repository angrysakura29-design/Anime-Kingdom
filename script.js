// වෙබ් අඩවිය මුලින්ම load වන විට ක්‍රියාත්මක වන කොටස
window.onload = async () => {
    console.log("Anime Kingdom loading with AniList API...");
    
    // මුල් පිටුවේ පෙන්විය යුතු ඇනිමේ කාණ්ඩ (Sort Type, HTML ID, Limit)
    const sections = [
        ['TRENDING_DESC', 'latestAnime', 10],   // Latest Anime කොටසට
        ['POPULARITY_DESC', 'popularAnime', 10] // Popular Anime කොටසට (HTML එකේ තිබේ නම්)
    ];

    for (const [sort, id, limit] of sections) {
        await fetchAniListData(sort, id, limit);
        await new Promise(res => setTimeout(res, 500)); 
    }

    // Search Bar එකේ Enter එබූ විට සෙවීම ආරම්භ කිරීමට
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchAnime();
            }
        });
    }
};

// AniList API එකෙන් දත්ත ලබා ගන්නා ප්‍රධාන Function එක
async function fetchAniListData(sortType, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const query = `
    query ($sort: [MediaSort], $limit: Int) {
      Page(page: 1, perPage: $limit) {
        media(sort: $sort, type: ANIME, isAdult: false) {
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
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: query, variables: { sort: [sortType], limit: limit } })
        });

        const json = await response.json();
        renderAnimeCards(json.data.Page.media, container);
    } catch (error) {
        console.error("Error loading " + containerId, error);
    }
}

// ඇනිමේ කාඩ්පත් HTML එකට එක් කරන පොදු Function එක
function renderAnimeCards(animeList, container) {
    container.innerHTML = ""; // පරණ දත්ත මකන්න

    animeList.forEach(anime => {
        const title = anime.title.english || anime.title.romaji;
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
        
        container.innerHTML += `
            <a href="${anime.siteUrl}" target="_blank" class="card">
                <span class="tag-rating">PG</span>
                <span class="tag-hd">HD</span>
                <img src="${anime.coverImage.large}" alt="${title}" loading="lazy">
                <div class="card-title">${title}</div>
                <div style="font-size: 11px; color: #ff416c; padding: 0 5px 10px; text-align: center;">⭐ ${score}</div>
            </a>
        `;
    });
}

// සෙවීමේ කාර්යය (Search Function)
async function searchAnime() {
    const queryText = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    
    if (!queryText) return alert("කරුණාකර ඇනිමේ නමක් ඇතුළත් කරන්න!");

    // සෙවුම් ප්‍රතිඵල පෙන්වන තැන "Searching..." ලෙස පෙන්වීමට
    resultsContainer.innerHTML = "<p style='color:white; text-align:center; width:100%; padding:20px;'>සොයමින් පවතී (Searching...)</p>";
    
    // අවශ්‍ය නම් පහත පේළිය භාවිතා කර ලැයිස්තුවේ නම වෙනස් කරන්න
    // document.querySelector('.row-header h2').innerText = "Search Results: " + queryText;

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
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: searchQuery, variables: { search: queryText } })
        });
        const json = await res.json();
        const results = json.data.Page.media;

        if (results.length === 0) {
            resultsContainer.innerHTML = "<p style='color:yellow; text-align:center; width:100%;'>ප්‍රතිඵල හමු නොවීය.</p>";
            return;
        }

        renderAnimeCards(results, resultsContainer);
        
        // සර්ච් කළ පසු ස්වයංක්‍රීයව ප්‍රතිඵල පෙන්වන තැනට පේජ් එක Scroll වීමට
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        resultsContainer.innerHTML = "<p style='color:red; text-align:center; width:100%;'>සෙවීමේදී දෝෂයක් ඇති විය.</p>";
        console.error(e);
    }
}
