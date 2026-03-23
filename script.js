window.onload = async () => {
    console.log("Anime Kingdom started...");
    loadHomePage();
};

async function loadHomePage() {
    const mainContent = document.querySelector('.main-content');
    const resultsContainer = document.getElementById('results-container');
    
    if(mainContent) mainContent.style.display = 'block';
    if(resultsContainer) {
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = "";
    }

    // කාණ්ඩ 5 සඳහා දත්ත ලබා ගැනීම
    const sections = [
        ['START_DATE_DESC', 'latestAnime'],      
        ['TRENDING_DESC', 'trendingAnime'], 
        ['POPULARITY_DESC', 'popularAnime'],      
        ['SCORE_DESC', 'tvSeriesList'],  
        ['UPDATED_AT_DESC', 'recentEpisodes'] 
    ];

    for (const [sort, id] of sections) {
        await fetchAniListData(sort, id, 10);
    }
}

async function fetchAniListData(sortType, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const query = `query ($sort: [MediaSort], $limit: Int) { Page(page: 1, perPage: $limit) { media(sort: $sort, type: ANIME, isAdult: false) { id title { romaji english } coverImage { large } averageScore } } }`;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: query, variables: { sort: [sortType], limit: limit } })
        });
        const json = await response.json();
        const list = json.data.Page.media;
        
        // පින්තූර ඇතුළත් කිරීම (මෙහි div එකක් භාවිතා කරන්න)
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
    } catch (e) {
        console.error("Loading Error:", e);
    }
}

// See All, Details සහ අනෙකුත් Functions මම කලින් දුන් පරිදිම තබා ගන්න.
