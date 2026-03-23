// GitHub Pages සීමාවන් (CORS) මඟහැරීමට Proxy එකක් භාවිතා කිරීම අනිවාර්ය වේ
const PROXY = "https://api.allorigins.win";
const ANIFY_API = "https://api.anify.tv";
const JIKAN_API = "https://api.jikan.moe";

// පිටුව පූරණය වන විට මුලින්ම Trending ඇනිමේ ලබා ගැනීම
window.onload = loadTrending;

// 1. Trending Anime පූරණය කිරීම (Jikan API හරහා)
async function loadTrending() {
    toggleLoader('mainLoader', true);
    try {
        const res = await fetch(`${JIKAN_API}/top/anime?limit=18`);
        const data = await res.json();
        renderCards(data.data);
    } catch (e) {
        console.error("Trending Error:", e);
        document.getElementById('statusTitle').innerText = "දත්ත ලබා ගැනීමේ දෝෂයකි!";
    } finally {
        toggleLoader('mainLoader', false);
    }
}

// 2. ඇනිමේ සෙවීම (Search Function)
async function searchAnime() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    document.getElementById('animeGrid').innerHTML = "";
    toggleLoader('mainLoader', true);
    document.getElementById('statusTitle').innerText = `'${query}' සඳහා ප්‍රතිඵල...`;

    try {
        const res = await fetch(`${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=18`);
        const data = await res.json();
        renderCards(data.data);
    } catch (e) {
        alert("සෙවීමේ දෝෂයකි!");
    } finally {
        toggleLoader('mainLoader', false);
    }
}

// 3. Grid එකට Cards එකතු කිරීම
function renderCards(list) {
    const grid = document.getElementById('animeGrid');
    grid.innerHTML = list.map(anime => {
        // title එකේ ඇති ' ලකුණු ඉවත් කිරීම (Javascript error වළක්වා ගැනීමට)
        const safeTitle = anime.title.replace(/'/g, "");
        return `
            <div class="card" onclick="openDetails('${safeTitle}', '${anime.images.jpg.large_image_url}')">
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                <div class="card-title">${anime.title}</div>
            </div>`;
    }).join('');
}

// 4. Anify API භාවිතයෙන් Episode විස්තර ලබා ගැනීම
async function openDetails(title, banner) {
    const modal = document.getElementById('detailsModal');
    const epContainer = document.getElementById('episode-list');
    
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBanner').src = banner;
    modal.style.display = "flex";
    epContainer.innerHTML = "<p>Episodes පූරණය වෙමින්...</p>";

    try {
        // Anify හරහා ඇනිමේ එක සෙවීම (Proxy එක හරහා)
        const searchUrl = `${PROXY}${encodeURIComponent(ANIFY_API + '/search/anime/' + title)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        // පළමු ප්‍රතිඵලයේ ID එක ලබා ගැනීම
        const animeId = searchData[0]?.id; 

        if (!animeId) throw new Error("ID Not Found");

        // Episodes විස්තර ලබා ගැනීම
        const infoUrl = `${PROXY}${encodeURIComponent(ANIFY_API + '/info/' + animeId)}`;
        const infoRes = await fetch(infoUrl);
        const infoData = await infoRes.json();
        
        // Episode දත්ත ලිස්ට් එක ලබා ගැනීම
        const episodes = infoData.episodes?.data[0]?.episodes || [];

        if (episodes.length === 0) {
            epContainer.innerHTML = "<p>Episodes සොයාගත නොහැකි විය.</p>";
            return;
        }

        // Episode බොත්තම් නිර්මාණය
        epContainer.innerHTML = episodes.map(ep => 
            `<button class="ep-btn" onclick="startStreaming('${title}', ${ep.number})">EP ${ep.number}</button>`
        ).join('');

    } catch (e) {
        console.error("Anify Error:", e);
        epContainer.innerHTML = "<p style='color:red;'>දත්ත ලබා ගැනීමේ API දෝෂයකි!</p>";
    }
}

// 5. Embed Player (Vidsrc) හරහා වීඩියෝව ප්ලේ කිරීම
function startStreaming(title, epNumber) {
    const videoModal = document.getElementById('videoPlayerModal');
    const iframe = document.getElementById('videoFrame');
    
    // Embed Player ලින්ක් එක (මෙහිදී Vidsrc භාවිතා කර ඇත)
    const embedUrl = `https://vidsrc.to{encodeURIComponent(title)}/${epNumber}`;
    
    iframe.src = embedUrl;
    videoModal.style.display = "flex";
}

// පාලක Functions (Modals close කිරීම)
function closeModal() { document.getElementById('detailsModal').style.display = "none"; }
function closeVideo() { 
    document.getElementById('videoFrame').src = ""; // වීඩියෝව නවත්වයි
    document.getElementById('videoPlayerModal').style.display = "none"; 
}
function toggleLoader(id, show) { document.getElementById(id).style.display = show ? "block" : "none"; }
