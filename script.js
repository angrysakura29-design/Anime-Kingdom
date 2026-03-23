// වෙබ් අඩවිය Load වන විට ක්‍රියාත්මක වන කොටස
window.onload = async () => {
    console.log("Anime Kingdom loading...");
    loadInitialAnime();

    // Search Bar එකේ Enter එබූ විට සෙවීම ආරම්භ කිරීමට
    const searchInput = document.querySelector('input'); // ඔබේ HTML එකේ search input එක
    if(searchInput) {
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchAnime();
            }
        });
    }
};

// මුලින්ම පෙන්වන ඇනිමේ ලැයිස්තුව (Home Page)
async function loadInitialAnime() {
    const sections = [
        ['TRENDING_DESC', 'latestAnime', 10],
        ['POPULARITY_DESC', 'trendingAnime', 10]
    ];

    for (const [sort, id, limit] of sections) {
        await fetchAniListData(sort, id, limit);
        await new Promise(res => setTimeout(res, 500)); 
    }
}

// AniList දත්ත ලබා ගන්නා ප්‍රධාන Function එක
async function fetchAniListData(sortType, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const query = `
    query ($sort: [MediaSort], $limit: Int) {
      Page(page: 1, perPage: $limit) {
        media(sort: $sort, type: ANIME, isAdult: false) {
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
        renderAnime(json.data.Page.media, container);
    } catch (e) { console.log(e); }
}

// දත්ත HTML එකට එකතු කිරීම
function renderAnime(list, container) {
    container.innerHTML = ""; 
    list.forEach(anime => {
        const title = anime.title.english || anime.title.romaji;
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
        container.innerHTML += `
            <a href="${anime.siteUrl}" target="_blank" class="card">
                <span class="tag-hd">HD</span>
                <img src="${anime.coverImage.large}" alt="${title}" loading="lazy">
                <div class="card-title">${title}</div>
                <div style="font-size: 11px; color: #ff416c; padding-bottom: 5px;">⭐ ${score}</div>
            </a>`;
    });
}

// සෙවීමේ කාර්යය (Search Function)
async function searchAnime() {
    // ඔබේ HTML එකේ සර්ච් බාර් එකේ id එක 'Search Anime...' ලෙස ඇති බැවින් එයට ගැලපෙන සේ:
    const queryText = document.querySelector('input[placeholder="Search Anime..."]').value;
    
    // මෙතන ඔබ සර්ච් ප්‍රතිඵල පෙන්වන්න කැමති ID එක දෙන්න (උදා: latestAnime එකේම පෙන්වන්න පුළුවන්)
    const resultsContainer = document.getElementById('latestAnime'); 
    
    if (!queryText) return alert("කරුණාකර නමක් ටයිප් කරන්න!");

    resultsContainer.innerHTML = "<p style='color:white; text-align:center; width:100%;'>Searching...</p>";
    document.querySelector('h2').innerText = "Search Results: " + queryText; // Heading එක වෙනස් කිරීමට

    const searchQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 20) {
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
        renderAnime(json.data.Page.media, resultsContainer);
    } catch (e) {
        resultsContainer.innerHTML = "<p style='color:red;'>සෙවීමේදී දෝෂයක් ඇති විය.</p>";
    }
}
