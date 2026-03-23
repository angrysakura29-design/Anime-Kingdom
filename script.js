window.onload = async () => {
    console.log("Anime Kingdom loading with AniList API...");
    
    // මුල් පිටුවේ දත්ත පෙන්වීම ආරම්භ කරයි
    loadHomePage();

    // සර්ච් බාර් එකේ Enter එබූ විට සෙවීම සඳහා
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener("keypress", (e) => { 
            if (e.key === "Enter") searchAnime(); 
        });
    }
};

// මුල් පිටුවේ (Home) දත්ත ලබා ගැනීමේ Function එක
async function loadHomePage() {
    // මුලින්ම සඟවා ඇති අංශ (Rows) පෙන්වන්න
    document.querySelectorAll('.row-header, .anime-row').forEach(el => el.style.display = 'flex');
    const resultsContainer = document.getElementById('results-container');
    if(resultsContainer) resultsContainer.innerHTML = ""; // Search results මකන්න

    const sections = [
        ['TRENDING_DESC', 'latestAnime', 2],      
        ['POPULARITY_DESC', 'trendingAnime', 10], 
        ['SCORE_DESC', 'popularAnime', 10],      
        ['UPDATED_AT_DESC', 'tvSeriesList', 10],  
        ['START_DATE_DESC', 'recentEpisodes', 10] 
    ];

    for (const [sort, id, limit] of sections) {
        await fetchAniListData(sort, id, limit);
        await new Promise(res => setTimeout(res, 500)); 
    }
}

async function fetchAniListData(sortType, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

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

    // මුල් පිටුවේ අංශ හංගන්න
    document.querySelectorAll('.row-header, .anime-row').forEach(el => el.style.display = 'none');
    resultsContainer.style.display = "flex";
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
    } catch (e) {
        resultsContainer.innerHTML = "<p style='color:red;'>Error searching.</p>";
    }
}

// --- Navigation Functions (Navigation Bar එක සඳහා) ---

// 1. Home බොත්තම සඳහා
function goHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadHomePage();
}

// 2. My List පෙන්වීම සඳහා
function showMyList() {
    const resultsContainer = document.getElementById('results-container');
    // මුල් පිටුවේ පේළි හංගන්න
    document.querySelectorAll('.row-header, .anime-row').forEach(el => el.style.display = 'none');
    
    resultsContainer.style.display = "flex";
    resultsContainer.innerHTML = `
        <h2 style="color:white; width:100%; padding:20px;">My List</h2>
        <p style="color:gray; text-align:center; width:100%; margin-top:20px;">
            ඔබ තවම ඇනිමේ කිසිවක් එක් කර නැත.
        </p>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. Profile පෙන්වීම සඳහා
function showProfile() {
    alert("ලියාපදිංචි වීමේ පද්ධතිය (Login System) ළඟදීම පැමිණේ!");
}
