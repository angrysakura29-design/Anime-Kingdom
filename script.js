const PROXY = "https://api.allorigins.win";
const JIKAN_API = "https://api.jikan.moe";
const ANIFY_API = "https://api.anify.tv";

window.onload = loadTrending;

async function loadTrending() {
    showLoader(true);
    try {
        const res = await fetch(`${JIKAN_API}/top/anime?limit=15`);
        const data = await res.json();
        renderCards(data.data);
    } catch (e) { console.error(e); }
    showLoader(false);
}

async function searchAnime() {
    const query = document.getElementById('searchInput').value;
    if(!query) return;
    showLoader(true);
    document.getElementById('rowTitle').innerText = "ප්‍රතිඵල: " + query;
    try {
        const res = await fetch(`${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=15`);
        const data = await res.json();
        renderCards(data.data);
    } catch (e) { alert("Search Error!"); }
    showLoader(false);
}

function renderCards(list) {
    const grid = document.getElementById('animeGrid');
    grid.innerHTML = list.map(anime => `
        <div class="card" onclick="loadEpisodes('${anime.title.replace(/'/g, "")}')">
            <img src="${anime.images.jpg.large_image_url}" loading="lazy">
            <div class="card-title">${anime.title}</div>
        </div>
    `).join('');
}

async function loadEpisodes(title) {
    const modal = document.getElementById('anime-modal');
    const epContainer = document.getElementById('episode-list');
    document.getElementById('modalTitle').innerText = title;
    modal.style.display = "flex";
    epContainer.innerHTML = "<p>Episodes පූරණය වෙමින්...</p>";

    try {
        // Anify හරහා සෙවීම (Proxy එක අනිවාර්යයි)
        const searchUrl = `${PROXY}${encodeURIComponent(ANIFY_API + '/search/anime/' + title)}`;
        const sRes = await fetch(searchUrl);
        const sData = await sRes.json();
        const animeId = sData?.[0]?.id || sData?.id;

        if(!animeId) throw new Error();

        const iUrl = `${PROXY}${encodeURIComponent(ANIFY_API + '/info/' + animeId)}`;
        const iRes = await fetch(iUrl);
        const iData = await iRes.json();
        
        // Episode දත්ත ලබා ගැනීම
        const episodes = iData.episodes?.data?.[0]?.episodes || iData.episodes?.data || [];

        if(episodes.length === 0) {
            epContainer.innerHTML = `<button class="ep-btn" onclick="startStreaming('${title}', 1)">Watch Episode 1</button>`;
            return;
        }

        epContainer.innerHTML = episodes.map(ep => 
            `<button class="ep-btn" onclick="startStreaming('${title}', ${ep.number})">EP ${ep.number}</button>`
        ).join('');

    } catch (e) {
        epContainer.innerHTML = `<button class="ep-btn" onclick="startStreaming('${title}', 1)">Play Video (Direct)</button>`;
    }
}

function startStreaming(title, epNum) {
    const playerModal = document.getElementById('video-modal');
    const iframe = document.getElementById('videoFrame');
    // Vidsrc Embed Player එක භාවිතා කරයි
    iframe.src = `https://vidsrc.to{encodeURIComponent(title)}/${epNum}`;
    playerModal.style.display = "flex";
    document.getElementById('playingTitle').innerText = title + " - Episode " + epNum;
}

function closeModal() { document.getElementById('anime-modal').style.display = "none"; }
function closeVideo() { 
    document.getElementById('videoFrame').src = "";
    document.getElementById('video-modal').style.display = "none"; 
}
function showLoader(show) { document.getElementById('loader').style.display = show ? "block" : "none"; }
