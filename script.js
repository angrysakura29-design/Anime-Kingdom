// වෙබ් අඩවිය Load වන විට දත්ත පෙන්වීම
window.onload = async () => {
    console.log("Anime Kingdom loading...");
    loadHomePage();
};

// මුල් පිටුව Load කරන Function එක
async function loadHomePage() {
    const mainContent = document.querySelector('.main-content');
    const resultsContainer = document.getElementById('results-container');
    
    if(mainContent) mainContent.style.display = 'block';
    if(resultsContainer) resultsContainer.innerHTML = "";

    const sections = [
        ['START_DATE_DESC', 'latestAnime', 10],      
        ['TRENDING_DESC', 'trendingAnime', 10], 
        ['POPULARITY_DESC', 'popularAnime', 10],      
        ['SCORE_DESC', 'tvSeriesList', 10],  
        ['UPDATED_AT_DESC', 'recentEpisodes', 10] 
    ];

    for (const [sort, id, limit] of sections) {
        await fetchAniListData(sort, id, limit);
    }
}

// --- මෙන්න මේ කොටස තමයි වැඩ කරන්නේ නැත්තේ ---
// මෙය window.onload එකෙන් පිටත තිබිය යුතුමයි!
async function showSeeAll(sortType, titleText) {
    console.log("Showing all for: " + titleText);
    
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.querySelector('.main-content');

    // මුල් පිටුවේ ඇති පේළි සඟවන්න
    if(mainContent) mainContent.style.display = 'none';
    
    resultsContainer.innerHTML = `
        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:10px 20px;">
            <h2 style="color:white;">${titleText}</h2>
            <button onclick="location.reload()" style="background:red; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Back</button>
        </div>
        <div id="see-all-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:15px; width:100%;">
            <p style="color:white; text-align:center; width:100%;">Loading...</p>
        </div>
    `;

    const query = `query ($sort: [MediaSort]) { Page(page: 1, perPage: 50) { media(sort: $sort, type: ANIME, isAdult: false) { id title { romaji english } coverImage { large } averageScore } } }`;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, variables: { sort: [sortType] } })
        });
        const json = await response.json();
        const grid = document.getElementById('see-all-grid');
        renderAnimeCards(json.data.Page.media, grid);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { 
        console.error(e);
        alert("දත්ත ලබා ගැනීමේදී දෝෂයක් ඇති විය.");
    }
}

// දත්ත ලබා ගන්නා පොදු Function එක
async function fetchAniListData(sortType, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const query = `query ($sort: [MediaSort], $limit: Int) { Page(page: 1, perPage: $limit) { media(sort: $sort, type: ANIME, isAdult: false) { id title { romaji english } coverImage { large } averageScore } } }`;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, variables: { sort: [sortType], limit: limit } })
        });
        const json = await response.json();
        renderAnimeCards(json.data.Page.media, container);
    } catch (e) { console.log(e); }
}

// කාඩ්පත් සාදන Function එක
function renderAnimeCards(list, container) {
    container.innerHTML = ""; 
    list.forEach(anime => {
        const title = anime.title.english || anime.title.romaji;
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
        container.innerHTML += `
            <div class="card" onclick="showDetails(${anime.id})">
                <span class="tag-hd">HD</span>
                <img src="${anime.coverImage.large}" alt="${title}">
                <div class="card-title">${title}</div>
                <div style="font-size: 11px; color: #ff416c; text-align: center; padding-bottom: 8px;">⭐ ${score}</div>
            </div>`;
    });
}

// Details පෙන්වන Function එක
async function showDetails(id) {
    // මම කලින් දුන් showDetails කේතය මෙතැනට දමන්න
    alert("Anime ID: " + id + " (Episodes details loading...)");
}
