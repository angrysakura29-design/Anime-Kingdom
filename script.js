async function showSeeAll(sortType, titleText) {
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.querySelector('.main-content');

    // 1. මුල් පිටුවේ ඇති දේවල් සඟවන්න
    if(mainContent) mainContent.style.display = 'none';
    
    // 2. ප්‍රතිඵල පෙන්වන container එක අනිවාර්යයෙන්ම පෙන්වන්න (මෙය වැදගත්!)
    resultsContainer.style.display = "flex"; 
    
    // 3. Loading පණිවිඩය සහ Back බොත්තම වහාම පෙන්වන්න
    resultsContainer.innerHTML = `
        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:20px; border-bottom:1px solid #222;">
            <h2 style="color:white; margin:0; font-size:20px;">${titleText}</h2>
            <button onclick="goHome()" style="background:red; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">BACK</button>
        </div>
        <div id="see-all-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:15px; width:100%; padding:20px 10px;">
            <p style="color:white; text-align:center; width:100%; padding:50px;">සොයමින් පවතී (Loading...)</p>
        </div>
    `;

    // 4. AniList API එකෙන් දත්ත ලබා ගැනීම
    const query = `
    query ($sort: [MediaSort]) {
      Page(page: 1, perPage: 50) {
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
            body: JSON.stringify({ query: query, variables: { sort: [sortType] } })
        });
        const json = await response.json();
        const animeList = json.data.Page.media;

        const grid = document.getElementById('see-all-grid');
        grid.innerHTML = ""; // Loading පණිවිඩය මකන්න

        // කාඩ්පත් එකින් එක එකතු කිරීම
        animeList.forEach(anime => {
            const title = anime.title.english || anime.title.romaji;
            const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
            
            grid.innerHTML += `
                <div class="card" onclick="showDetails(${anime.id})">
                    <span class="tag-hd">HD</span>
                    <img src="${anime.coverImage.large}" alt="${title}">
                    <div class="card-title">${title}</div>
                    <div style="font-size: 11px; color: #ff416c; text-align: center; padding-bottom: 8px;">⭐ ${score}</div>
                </div>
            `;
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (e) { 
        console.error(e);
        document.getElementById('see-all-grid').innerHTML = "<p style='color:red; text-align:center; width:100%;'>දත්ත ලබා ගැනීමේදී දෝෂයක් ඇති විය.</p>";
    }
}

// BACK බොත්තම එබූ විට නැවත HOME එකට යාමට
function goHome() {
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.querySelector('.main-content');

    resultsContainer.style.display = 'none'; // See all කොටස හංගන්න
    mainContent.style.display = 'block';     // මුල් පිටුව පෙන්වන්න
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
