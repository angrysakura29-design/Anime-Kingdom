window.onload = async () => {
    console.log("Anime Kingdom loading with AniList API...");
    loadHomePage();

    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener("keypress", (e) => { 
            if (e.key === "Enter") searchAnime(); 
        });
    }
};

// මුල් පිටුව පෙන්වීම
async function loadHomePage() {
    document.querySelectorAll('.row-section').forEach(el => el.style.display = 'block');
    document.getElementById('results-container').innerHTML = "";
    
    const sections = [
        ['START_DATE_DESC', 'latestAnime', 10],      
        ['TRENDING_DESC', 'trendingAnime', 10], 
        ['POPULARITY_DESC', 'popularAnime', 10],      
        ['SCORE_DESC', 'tvSeriesList', 10],  
        ['UPDATED_AT_DESC', 'recentEpisodes', 10] 
    ];

    for (const [sort, id, limit] of sections) {
        await fetchAniListData(sort, id, limit);
        await new Promise(res => setTimeout(res, 300)); 
    }
}

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
    } catch (e) { console.log(e); }
}

function renderAnimeCards(list, container) {
    container.innerHTML = ""; 
    list.forEach(anime => {
        const title = anime.title.english || anime.title.romaji;
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
        
        container.innerHTML += `
            <div class="card" onclick="showDetails(${anime.id})">
                <span class="tag-hd">HD</span>
                <img src="${anime.coverImage.large}" alt="${title}" loading="lazy">
                <div class="card-title">${title}</div>
                <div style="font-size: 11px; color: #ff416c; text-align: center; padding-bottom: 8px;">⭐ ${score}</div>
            </div>
        `;
    });
}

// --- SEE ALL FUNCTION (දැන් වැඩ කරනු ඇත) ---
async function showSeeAll(sortType, titleText) {
    const resultsContainer = document.getElementById('results-container');
    
    // මුල් පිටුවේ ඇති දේවල් සඟවන්න
    document.querySelectorAll('.row-section').forEach(el => el.style.display = 'none');
    
    resultsContainer.style.display = "flex";
    resultsContainer.innerHTML = `
        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:10px 20px;">
            <h2 style="color:white; margin:0;">${titleText}</h2>
            <button onclick="goHome()" style="background:red; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;">Back</button>
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
    } catch (e) { console.error(e); }
}

// --- DETAILS & EPISODES FUNCTION ---
async function showDetails(id) {
    const modal = document.getElementById('anime-modal');
    modal.style.display = "flex";
    document.getElementById('modal-body').innerHTML = "<p style='text-align:center; color:white;'>Loading Details...</p>";

    const query = `query ($id: Int) { Media (id: $id) { title { romaji english } description episodes coverImage { large } averageScore genres siteUrl } }`;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, variables: { id: id } })
        });
        const json = await response.json();
        const anime = json.data.Media;

        document.getElementById('modal-body').innerHTML = `
            <span style="position:absolute; right:15px; top:10px; font-size:30px; cursor:pointer; color:red;" onclick="closeModal()">&times;</span>
            <div style="display:flex; flex-direction:column; align-items:center; gap:15px;">
                <img src="${anime.coverImage.large}" style="width:100%; max-height:300px; object-fit:cover; border-radius:10px;">
                <h2 style="margin:0; text-align:center;">${anime.title.english || anime.title.romaji}</h2>
                <div style="display:flex; gap:10px; font-size:14px; color:#ff416c; font-weight:bold;">
                    <span>⭐ ${anime.averageScore / 10}</span>
                    <span>📺 Episodes: ${anime.episodes || 'N/A'}</span>
                </div>
                <p style="font-size:13px; color:#ccc; line-height:1.5; max-height:150px; overflow-y:auto; padding:5px;">${anime.description}</p>
                <a href="${anime.siteUrl}" target="_blank" style="background:red; color:white; padding:10px 20px; border-radius:5px; text-decoration:none; font-weight:bold;">View on AniList</a>
            </div>
        `;
    } catch (e) { console.log(e); }
}

function closeModal() { document.getElementById('anime-modal').style.display = "none"; }
function goHome() { location.reload(); }
function showMyList() { alert("My List feature ළඟදීම පැමිණේ!"); }
function showProfile() { alert("Login System ළඟදීම පැමිණේ!"); }
