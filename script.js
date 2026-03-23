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

// Home Page එක පූරණය කිරීම
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
        // API limit වළක්වා ගැනීමට කුඩා විවේකයක්
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
    if (!list || list.length === 0) {
        container.innerHTML = "<p style='color:white;'>No Anime Found.</p>";
        return;
    }
    container.innerHTML = ""; 
    list.forEach(anime => {
        const title = anime.title.english || anime.title.romaji;
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
        container.innerHTML += `
            <div class="card" onclick="showDetails(${anime.id})" style="cursor:pointer; flex: 0 0 auto; width: 150px; background: #111; border-radius: 8px; overflow: hidden;">
                <img src="${anime.coverImage.large}" alt="${title}" style="width:100%; height:200px; object-fit:cover;">
                <div class="card-title" style="padding: 5px; font-size: 12px; color: white; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
                <div style="font-size: 11px; color: #ff416c; text-align: center; padding-bottom: 8px;">⭐ ${score}</div>
            </div>`;
    });
}

// Modal එක වසන function එක (අත්‍යවශ්‍යයි)
function closeModal() {
    document.getElementById('anime-modal').style.display = "none";
}

async function showDetails(id) {
    const modal = document.getElementById('anime-modal');
    const modalBody = document.getElementById('modal-body');
    if(!modal || !modalBody) return;

    modal.style.display = "flex";
    modalBody.innerHTML = "<p style='text-align:center; color:white;'>Loading Details...</p>";

    const query = `query ($id: Int) { Media (id: $id) { title { romaji english } description episodes coverImage { large } averageScore } }`;

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
                <img src="${anime.coverImage.large}" style="width:100%; max-height:250px; object-fit:cover; border-radius:10px;">
                <h2 style="margin:0; text-align:center; font-size:18px; color:white;">${title}</h2>
                <div style="display:flex; gap:15px; font-weight:bold; color:#ff416c;">
                    <span>⭐ ${anime.averageScore ? anime.averageScore / 10 : 'N/A'}</span>
                    <span>📺 Episodes: ${anime.episodes || 'N/A'}</span>
                </div>
                <div style="font-size:12px; color:#ccc; max-height:100px; overflow-y:auto; padding:0 10px;">${anime.description || 'No description available.'}</div>
                <div id="episode-list" style="width:100%; margin-top:10px;">
                    <p style="text-align:center; font-size:12px; color:yellow;">Searching episodes...</p>
                </div>
            </div>
        `;
        
        loadEpisodes(title); 
    } catch (e) { console.error(e); }
}

async function loadEpisodes(title) {
    const epContainer = document.getElementById('episode-list');
    try {
        // Consumet හරහා Search කිරීම
        const searchRes = await fetch(`${CONSUMET_API}/${encodeURIComponent(title)}`);
        const searchData = await searchRes.json();
        const animeId = searchData.results[0]?.id;

        if(!animeId) {
            epContainer.innerHTML = "<p style='color:red; text-align:center;'>Video not found!</p>";
            return;
        }

        const infoRes = await fetch(`${CONSUMET_API}/info/${animeId}`);
        const infoData = await infoRes.json();
        
        epContainer.innerHTML = `<h3 style="font-size:14px; margin-bottom:10px; color:white;">Episodes:</h3>
                                 <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-height:150px; overflow-y:auto;"></div>`;
        const listDiv = epContainer.querySelector('div');

        infoData.episodes.forEach(ep => {
            listDiv.innerHTML += `<button onclick="startStreaming('${ep.id}', '${title} - Ep ${ep.number}')" 
                style="background:#333; color:white; border:1px solid red; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;">
                EP ${ep.number}
            </button>`;
        });
    } catch (e) { epContainer.innerHTML = "<p style='color:red;'>Error loading episodes.</p>"; }
}

async function startStreaming(episodeId, fullTitle) {
    try {
        const res = await fetch(`${CONSUMET_API}/watch/${episodeId}`);
        const data = await res.json();
        const streamLink = data.sources.find(s => s.quality === '720p' || s.quality === 'default')?.url || data.sources[0].url;
        playAnime(streamLink, "", fullTitle);
    } catch (e) { alert("Could not load video!"); }
}

function playAnime(videoUrl, subUrl, title) {
    const vModal = document.getElementById('video-modal');
    const player = document.getElementById('main-player');
    const vTitle = document.getElementById('video-title');

    vModal.style.display = "flex";
    vTitle.innerText = title;

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
    if (!queryText) return alert("Please type a name!");
    
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.querySelector('.main-content');
    
    mainContent.style.display = 'none';
    resultsContainer.style.display = 'flex';
    resultsContainer.innerHTML = "<p style='color:white;'>Searching...</p>";

    const query = `query ($search: String) { Page(perPage: 20) { media(search: $search, type: ANIME, isAdult: false) { id title { romaji english } coverImage { large } averageScore } } }`;

    fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, variables: { search: queryText } })
    })
    .then(res => res.json())
    .then(json => renderAnimeCards(json.data.Page.media, resultsContainer))
    .catch(e => console.error(e));
}

function goHome() {
    loadHomePage();
}
