// Consumet API එකේ නිවැරදි ලිපිනය (GogoAnime provider භාවිතා කර ඇත)
const CONSUMET_API = "https://consumet-api-production-e852.up.railway.app";

// Episodes ලබා ගන්නා function එක නිවැරදි කිරීම
async function loadEpisodes(title) {
    const epContainer = document.getElementById('episode-list');
    try {
        // 1. ඇනිමේ එක මුලින්ම search කරන්න
        const searchRes = await fetch(`${CONSUMET_API}/${encodeURIComponent(title)}`);
        const searchData = await searchRes.json();
        
        // පළමු ප්‍රතිඵලය ලබා ගැනීම
        const animeId = searchData.results && searchData.results.length > 0 ? searchData.results[0].id : null;

        if(!animeId) {
            epContainer.innerHTML = "<p style='color:red; text-align:center;'>Episodes සොයාගත නොහැකි විය!</p>";
            return;
        }

        // 2. ලබාගත් ID එකෙන් Episodes විස්තර ලබා ගැනීම
        const infoRes = await fetch(`${CONSUMET_API}/info/${animeId}`);
        const infoData = await infoRes.json();
        
        if(!infoData.episodes || infoData.episodes.length === 0) {
             epContainer.innerHTML = "<p style='color:red; text-align:center;'>Episodes කිසිවක් දැනට නොමැත.</p>";
             return;
        }

        epContainer.innerHTML = `<h3 style="font-size:14px; margin-bottom:10px; color:white;">Episodes:</h3>
                                 <div class="ep-grid" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-height:150px; overflow-y:auto;"></div>`;
        const listDiv = epContainer.querySelector('div');

        infoData.episodes.forEach(ep => {
            const btn = document.createElement('button');
            btn.innerText = `EP ${ep.number}`;
            btn.style.cssText = "background:#333; color:white; border:1px solid red; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;";
            btn.onclick = () => startStreaming(ep.id, `${title} - Ep ${ep.number}`);
            listDiv.appendChild(btn);
        });

    } catch (e) { 
        console.error("Episode Error:", e);
        epContainer.innerHTML = "<p style='color:red; text-align:center;'>Episodes පූරණය කිරීමේ දෝෂයක්!</p>"; 
    }
}

// වීඩියෝව ප්ලේ කිරීමේ function එක
async function startStreaming(episodeId, fullTitle) {
    try {
        const res = await fetch(`${CONSUMET_API}/watch/${episodeId}`);
        const data = await res.json();
        
        // හොඳම quality එක ඇති link එක තෝරා ගැනීම
        const source = data.sources.find(s => s.quality === '720p') || 
                       data.sources.find(s => s.quality === 'default') || 
                       data.sources[0];

        if(source) {
            playAnime(source.url, fullTitle);
        } else {
            alert("වීඩියෝව ලබාගත නොහැකියි!");
        }
    } catch (e) { 
        console.error("Streaming Error:", e);
        alert("වීඩියෝව පූරණය කිරීමේදී ගැටලුවක් මතු විය!"); 
    }
}

function playAnime(videoUrl, title) {
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
