async // --- නිවැරදි කළ Search Function එක මෙතැන් සිට ---
async function searchAnime() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    
    // සෙවුම් කොටුව හිස් නම් පණිවිඩයක් පෙන්වන්න
    if (!query || query.trim() === "") {
        alert("කරුණාකර ඇනිමේ නමක් ටයිප් කරන්න!");
        return;
    }

    // දත්ත ලැබෙන තුරු 'Searching...' පණිවිඩය පෙන්වන්න
    resultsContainer.innerHTML = "<p style='color: white; text-align: center; width: 100%;'>Searching for '" + query + "'...</p>";

    try {
        // ඉතා වැදගත්: encodeURIComponent භාවිතයෙන් හිස්තැන් (spaces) නිවැරදිව සකසයි
        const apiUrl = "https://api.jikan.moe" + encodeURIComponent(query) + "&limit=12";
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error("API සම්බන්ධතාවය අසාර්ථකයි!");

        const data = await response.json();
        const animeList = data.data;

        resultsContainer.innerHTML = ""; // පරණ ප්‍රතිඵල ඉවත් කරයි

        if (!animeList || animeList.length === 0) {
            resultsContainer.innerHTML = "<p style='color: white; text-align: center; width: 100%;'>කිසිදු ප්‍රතිඵලයක් හමු නොවීය.</p>";
            return;
        }

        // ප්‍රතිඵල Card ලෙස පෙන්වීම
        animeList.forEach(anime => {
            const animeCard = `
                <div style="background: #1a1a1a; padding: 10px; border-radius: 15px; width: 160px; text-align: center; border: 1px solid #333; margin-bottom: 10px; flex-shrink: 0;">
                    <img src="${anime.images.jpg.image_url}" style="width: 100%; border-radius: 10px; height: 220px; object-fit: cover;">
                    <h4 style="color: white; font-size: 13px; margin: 8px 0; height: 35px; overflow: hidden;">${anime.title}</h4>
                    <p style="color: #ff416c; font-size: 12px; margin: 0;">⭐ ${anime.score || 'N/A'}</p>
                </div>
            `;
            resultsContainer.innerHTML += animeCard;
        });
    } catch (error) {
        // වැරැද්දක් සිදු වුවහොත් පෙන්වන පණිවිඩය
        resultsContainer.innerHTML = "<p style='color: #ff416c; text-align: center; width: 100%;'>දෝෂය: " + error.message + "</p>";
    }
}
// --- Search Function එක අවසන් ---

    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    
    if (!query) return alert("කරුණාකර ඇනිමේ නමක් ඇතුළත් කරන්න!");

    resultsContainer.innerHTML = "<p style='color:white; text-align:center;'>සොයමින් පවතී...</p>";

    try {
        // ඉතා වැදගත්: මෙම URL එක ඒ විදිහටම තිබිය යුතුයි
        const apiUrl = "https://api.jikan.moe" + query + "&limit=12";
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        const animeList = data.data;

        resultsContainer.innerHTML = ""; // පරණ ප්‍රතිඵල මකන්න

        if (!animeList || animeList.length === 0) {
            resultsContainer.innerHTML = "<p style='color:white;'>කිසිදු ප්‍රතිඵලයක් හමු නොවීය.</p>";
            return;
        }

        animeList.forEach(anime => {
            resultsContainer.innerHTML += `
                <div class="card" style="margin-bottom: 20px; display: inline-block; width: 160px; vertical-align: top; margin-right: 10px;">
                    <img src="${anime.images.jpg.image_url}" style="width: 100%; border-radius: 10px; height: 230px; object-fit: cover;">
                    <div class="card-title" style="font-size: 14px; margin-top: 5px; height: 40px; overflow: hidden; color: white;">${anime.title}</div>
                    <p style="color: #ff416c; font-size: 12px;">⭐ ${anime.score || 'N/A'}</p>
                </div>
            `;
        });
    } catch (error) {
        // සැබෑ වැරැද්ද මෙතැනින් බලාගත හැකියි
        resultsContainer.innerHTML = "<p style='color:red;'>දෝෂය: " + error.message + "</p>";
    }
}
