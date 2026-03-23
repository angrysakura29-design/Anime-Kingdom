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

// පින්තූර කාඩ්පත් HTML එකට එක් කිරීම
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

// "See all" පෙන්වීම
async function showSeeAll(sortType, titleText) {
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.querySelector('.main-content');

    if(mainContent) mainContent.style.display = 'none';
    resultsContainer.style.display = "flex";
    resultsContainer.style.flexDirection = "column";
    
    resultsContainer.innerHTML = `
        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333; margin-bottom:20px;">
            <h2 style="color:white; margin:0; font-size:22px;">${titleText}</h2>
            <button onclick="goHome()" style="background:red; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">BACK</button>
        </div>
        <div id="see-all-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:15px; width:100%;">
            <p style="color:white; text-align:center; width:100%; padding:50px;">සොයමින් පවතී... (Loading...)</p>
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
        renderAnimeCards(json.data.Page.media, document.getElementById('see-all-grid'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { console.error(e); }
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

        modalBody.innerHTML = `
            <span style="position:absolute; right:15px; top:10px; font-size:30px; cursor:pointer; color:red; font-weight:bold; z-index:100;" onclick="closeModal()">&times;</span>
            <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
                <img src="${anime.coverImage.large}" style="width:100%; max-height:250px; object-fit:cover; border-radius:10px;">
                <h2 style="margin:0; text-align:center; font-size:18px;">${anime.title.english || anime.title.romaji}</h2>
                <div style="display:flex; gap:15px; font-weight:bold; color:#ff416c;">
                    <span>⭐ ${anime.averageScore / 10}</span>
                    <span>📺 Episodes: ${anime.episodes || 'N/A'}</span>
                </div>
                <div style="font-size:13px; color:#ccc; max-height:120px; overflow-y:auto; line-height:1.4; padding:0 10px;">${anime.description}</div>
                <button onclick="playAnime('https://www.w3schools.com', '', '${anime.title.english || anime.title.romaji}')" 
                        style="background:red; color:white; padding:10px 20px; border-radius:5px; border:none; cursor:pointer; font-weight:bold; margin-top:10px; width:100%;">
                    WATCH NOW (IN-SITE)
                </button>
                <a href="${anime.siteUrl}" target="_blank" style="color:#ccc; font-size:12px; text-decoration:none; margin-top:5px;">View on AniList</a>
            </div>
        `;
    } catch (e) { console.error(e); }
}

// වීඩියෝ ප්ලේයර් එකේ වැඩ
function playAnime(videoUrl, subUrl, title) {
    const vModal = document.getElementById('video-modal');
    const player = document.getElementById('main-player');
    const source = document.getElementById('video-source');
    const sub = document.getElementById('video-sub');
    const vTitle = document.getElementById('video-title');

    if(!vModal || !player || !source) return;

    source.src = videoUrl; 
    if(sub) sub.src = subUrl;      
    if(vTitle) vTitle.innerText = title;

    player.load(); 
    vModal.style.display = "flex";
    player.play();
}

function closeVideo() {
    const vModal = document.getElementById('video-modal');
    const player = document.getElementById('main-player');
    if(player) player.pause();
    if(vModal) vModal.style.display = "none";
}

function searchAnime() {
    const queryText = document.getElementById('searchInput').value;
    if (!queryText) return alert("කරුණාකර නමක් ටයිප් කරන්න!");
    showSeeAll('SEARCH', 'Results: ' + queryText);
}

function goHome() { loadHomePage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function closeModal() { document.getElementById('anime-modal').style.display = "none"; }
function showMyList() { alert("My List feature ළඟදීම පැමිණේ!"); }
function showProfile() { alert("Login System ළඟදීම පැමිණේ!"); }
