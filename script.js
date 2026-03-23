const CONSUMET_API = "https://consumet-api-production-e852.up.railway.app";

window.onload = async () => {
    console.log("Anime Kingdom loading...");
    loadHomePage();

    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener("keypress", (e) => { 
            if (e.key === "Enter") searchAnime(); 
        });
    }
};

// මුල් පිටුව (Home Page) පෙන්වීම
async function loadHomePage() {
    const mainContent = document.querySelector('.main-content');
    const resultsContainer = document.getElementById('results-container');
    
    if(mainContent) mainContent.style.display = 'block';
    if(resultsContainer) {
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = "";
    }

    const sections = [
        ['START_DATE_DESC', 'latestAnime', 10],      
        ['TRENDING_DESC', 'trendingAnime', 10], 
        ['POPULARITY_DESC', 'popularAnime', 10],      
        ['SCORE_DESC', 'tvSeriesList', 10],  
        ['UPDATED_AT_DESC', 'recentEpisodes', 10] 
    ];

    for (const [sort, id, limit] of sections) {
        await fetchAniListData(sort, id, limit);
        await new Promise(res => setTimeout(res, 200)); 
    }
}

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
    } catch (e) { console.error("Loading Error:", e); }
}

function renderAnimeCards(list, container) {
    if (!list) return;
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

// විස්තර පෙන්වීම (Detail Pop-up)
async function showDetails(id) {
    const modal = document.getElementById('anime-modal');
    const modalBody = document.getElementById('modal-body');
    if(!modal || !modalBody) return;

    modal.style.display = "flex";
    modalBody.innerHTML = "<p style='text-align:center; color:white;'>Loading Details...</p>";

    const query = `query ($id: Int) { Media (id: $id) { title { romaji english } description episodes coverImage { large } averageScore siteUrl } }`;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, variables: { id: id } })
        });
        const json = await response.json();
        const anime = json.data.Media;
        const title = anime.title.english || anime.title.romaji;

        modalBody.innerHTML = `
            <span style="position:absolute; right:15px; top:10px; font-size:30px; cursor:pointer; color:red; font-weight:bold; z-index:100;" onclick="closeModal()">&times;</span>
            <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
                <img src="${anime.coverImage.large}" style="width:100%; max-height:200px; object-fit:cover; border-radius:10px;">
                <h2 style="margin:0; text-align:center; font-size:18px;">${title}</h2>
                <div style="display:flex; gap:15px; font-weight:bold; color:#ff416c;">
                    <span>⭐ ${anime.averageScore / 10}</span>
                    <span>📺 Episodes: ${anime.episodes || 'N/A'}</span>
                </div>
                <div style="font-size:12px; color:#ccc; max-height:80px; overflow-y:auto; padding:0 10px;">${anime.description}</div>
                
                <div id="episode-list" style="width:100%; margin-top:10px;">
                    <p style="text-align:center; font-size:12px; color:yellow;">Loading Episodes...</p>
                </div>
            </div>
        `;
        
        loadEpisodes(title); // Episodes load කිරීම ආරම්භ කරයි

    } catch (e) { console.error(e); }
}

// Consumet API හරහා Episodes ලබාගැනීම
async function loadEpisodes(title) {
    const epContainer = document.getElementById('episode-list');
    try {
        // 1. Search Anime ID
        const searchRes = await fetch(`${CONSUMET_API}/${title}`);
        const searchData = await searchRes.json();
        const animeId = searchData.results[0]?.id;

        if(!animeId) {
            epContainer.innerHTML = "<p style='color:red; text-align:center;'>වීඩියෝව සොයාගත නොහැකි විය!</p>";
            return;
        }

        // 2. Get Episode List
        const infoRes = await fetch(`${CONSUMET_API}/info/${animeId}`);
        const infoData = await infoRes.json();
        
        epContainer.innerHTML = `<h3 style="font-size:14px; margin-bottom:10px;">Episodes:</h3>
                                 <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-height:150px; overflow-y:auto;"></div>`;
        const listDiv = epContainer.querySelector('div');

        infoData.episodes.forEach(ep => {
            listDiv.innerHTML += `<button onclick="startStreaming('${ep.id}', '${title} - Ep ${ep.number}')" 
                style="background:#333; color:white; border:1px solid #444; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;">
                EP ${ep.number}
            </button>`;
        });

    } catch (e) { epContainer.innerHTML = "Error loading episodes."; }
}

// Streaming Link එක ලබාගෙන ප්ලේ කිරීම
async function startStreaming(episodeId, fullTitle) {
    try {
        const res = await fetch(`${CONSUMET_API}/watch/${episodeId}`);
        const data = await res.json();
        const streamLink = data.sources.find(s => s.quality === '720p' || s.quality === 'default')?.url || data.sources[0].url;
        
        playAnime(streamLink, "", fullTitle);
    } catch (e) { alert("වීඩියෝව ප්ලේ කිරීමට නොහැක!"); }
}

// HLS Support සහිත Video Player එක
function playAnime(videoUrl, subUrl, title) {
    const vModal = document.getElementById('video-modal');
    const player = document.getElementById('main-player');
    const vTitle = document.getElementById('video-title');

    vModal.style.display = "flex";
    vTitle.innerText = title;

    // HLS.js පාවිච්චි කර .m3u8 ප්ලේ කිරීම
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED, () => player.play());
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = videoUrl;
        player.play();
    }
}

function closeVideo() {
    const vModal = document.getElementById('video-modal');
    const player = document.getElementById('main-player');
    if(player) { player.pause(); player.src = ""; }
    vModal.style.display = "none";
}

function searchAnime() {
    const queryText = document.getElementById('searchInput').value;
    if (!queryText) return alert("කරුණාකර නමක් ටයිප් කරන්න!");
    showSeeAll('SEARCH', 'Results: ' + queryText, queryText);
}

async function showSeeAll(sortType, titleText, searchKeyword = null) {
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.querySelector('.main-content');

    if(mainContent) mainContent.style.display = 'none';
    resultsContainer.style.display = "flex";
    resultsContainer.style.flexDirection = "column";
    resultsContainer.innerHTML = `<div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333; margin-bottom:20px;">
            <h2 style="color:white; margin:0; font-size:22px;">${titleText}</h2>
            <button onclick="goHome()" style="background:red; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">BACK</button>
        </div>
        <div id="see-all-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:15px; width:100%;"><p style="color:white; text-align:center; width:100%; padding:50px;">සොයමින් පවතී...</p></div>`;

    const query = searchKeyword 
        ? `query ($search: String) { Page(page: 1, perPage: 50) { media(search: $search, type: ANIME, isAdult: false) { id title { romaji english } coverImage { large } averageScore } } }`
        : `query ($sort: [MediaSort]) { Page(page: 1, perPage: 50) { media(sort: $sort, type: ANIME, isAdult: false) { id title { romaji english } coverImage { large } averageScore } } }`;

    const variables = searchKeyword ? { search: searchKeyword } : { sort: [sortType] };

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, variables: variables })
        });
        const json = await response.json();
        renderAnimeCards(json.data.Page.media, document.getElementById('see-all-grid'));
    } catch (e) { console.error(e); }
}

function goHome() { loadHomePage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function closeModal() { document.getElementById('anime-modal').style.display = "none"; }
