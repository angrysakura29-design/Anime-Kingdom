async function searchAnime() {
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
