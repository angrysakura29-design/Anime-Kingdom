// වඩාත් ස්ථාවර API එකක් භාවිතා කිරීම (Anify API)
const ANIFY_API = "https://api.anify.tv";

async function loadEpisodes(title) {
    const epContainer = document.getElementById('episode-list');
    try {
        // 1. ඇනිමේ එක මුලින්ම search කරන්න
        const searchRes = await fetch(`${ANIFY_API}/search/anime/${encodeURIComponent(title)}`);
        const searchData = await searchRes.json();
        
        // පළමු ප්‍රතිඵලයේ ID එක ලබා ගැනීම
        const animeId = searchData[0]?.id;

        if(!animeId) {
            epContainer.innerHTML = "<p style='color:red; text-align:center;'>වීඩියෝ දත්ත සොයාගත නොහැකි විය!</p>";
            return;
        }

        // 2. Episodes විස්තර ලබා ගැනීම
        const infoRes = await fetch(`${ANIFY_API}/info/${animeId}`);
        const infoData = await infoRes.json();
        
        // Episodes පවතින මූලාශ්‍රයක් තෝරා ගැනීම (උදා: gogoanime හෝ zoro)
        const episodes = infoData.episodes?.data[0]?.episodes || [];

        if(episodes.length === 0) {
             epContainer.innerHTML = "<p style='color:red; text-align:center;'>දැනට Episodes කිසිවක් නොමැත.</p>";
             return;
        }

        epContainer.innerHTML = `<h3 style="font-size:14px; margin-bottom:10px; color:white;">Episodes:</h3>
                                 <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-height:150px; overflow-y:auto;"></div>`;
        const listDiv = epContainer.querySelector('div');

        episodes.forEach(ep => {
            const btn = document.createElement('button');
            btn.innerText = `EP ${ep.number}`;
            btn.style.cssText = "background:#333; color:white; border:1px solid red; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;";
            // වීඩියෝ ලින්ක් එක ලබා ගැනීමට අවශ්‍ය තොරතුරු එවීම
            btn.onclick = () => startStreaming(animeId, ep.number, title);
            listDiv.appendChild(btn);
        });

    } catch (e) { 
        console.error("Error:", e);
        epContainer.innerHTML = "<p style='color:red; text-align:center;'>දත්ත ලබා ගැනීමේ දෝෂයක්! (API Error)</p>"; 
    }
}

async function startStreaming(animeId, epNumber, title) {
    try {
        // වීඩියෝ ලින්ක් එක ලබා ගැනීම
        const res = await fetch(`${ANIFY_API}/sources?id=${animeId}&episodeNumber=${epNumber}&subType=sub&type=ANIME`);
        const data = await res.json();
        
        const videoUrl = data.sources[0]?.url;

        if(videoUrl) {
            playAnime(videoUrl, `${title} - Ep ${epNumber}`);
        } else {
            alert("වීඩියෝව පූරණය කළ නොහැක!");
        }
    } catch (e) {
        alert("වීඩියෝ සබැඳිය ලබා ගැනීමේ දෝෂයක්!");
    }
}
