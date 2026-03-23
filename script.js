async function showSeeAll(sortType, titleText) {
    const resultsContainer = document.getElementById('results-container');
    const mainContent = document.querySelector('.main-content');

    // 1. මුල් පිටුවේ පේළි සඟවා ප්‍රතිඵල පෙන්වන තැන විවෘත කරන්න
    if(mainContent) mainContent.style.display = 'none';
    resultsContainer.style.display = "flex";
    resultsContainer.style.flexDirection = "column";
    
    // 2. Header එක සහ Loading පණිවිඩය ඇතුළත් කිරීම
    resultsContainer.innerHTML = `
        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333; margin-bottom:20px;">
            <h2 style="color:white; margin:0; font-size:22px;">${titleText}</h2>
            <button onclick="goHome()" style="background:red; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">BACK</button>
        </div>
        <div id="see-all-grid" style="display:flex; flex-wrap:wrap; justify-content:center; gap:15px; width:100%; min-height:400px;">
            <p style="color:white; text-align:center; width:100%; padding:50px;">ඇනිමේ දත්ත ලබා ගනිමින් පවතී... (Loading...)</p>
        </div>
    `;

    // 3. AniList API එකෙන් ඇනිමේ 50ක් ලබා ගැනීම
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

        // 4. API එකෙන් ලැබුණු ඇනිමේ 50ම එකින් එක Grid එකට එකතු කිරීම
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
        document.getElementById('see-all-grid').innerHTML = "<p style='color:red; text-align:center; width:100%;'>දත්ත ලබා ගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.</p>";
    }
}
