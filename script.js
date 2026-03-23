console.log("Script connected!");

// --- දැනට ඇති දත්ත (Static Data) ---
const tvData = [
    { title: "One Piece", img: "https://s4.anilist.co", rate: "PG-13" },
    { title: "Naruto", img: "https://s4.anilist.co", rate: "PG-13" },
    { title: "Solo Leveling", img: "https://s4.anilist.co", rate: "R" },
    { title: "Demon Slayer", img: "https://s4.anilist.co", rate: "HD" }
];

const movieData = [
    { title: "A Silent Voice", img: "https://s4.anilist.co", rate: "HD" },
    { title: "Your Name", img: "https://s4.anilist.co", rate: "PG-13" }
];

// --- පිටුව පූරණය වන විට Card පෙන්වීම ---
function renderRow(id, list) {
    const container = document.getElementById(id);
    if (!container) return; // ID එක නැතිනම් නතර කරන්න
    container.innerHTML = list.map(a => `
        <div class="card">
            <span class="tag-rating">${a.rate}</span>
            <span class="tag-hd">HD</span>
            <img src="${a.img}">
            <div class="card-title">${a.title}</div>
        </div>
    `).join('');
}

window.onload = () => {
    renderRow('tvSeries', tvData);
    renderRow('topMovies', movieData);
    renderRow('mostPopular', tvData);
};

// --- ප්‍රධාන Advanced Search Function එක ---
async function searchAnime() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results-container');
    
    if (!query) return alert("කරුණාකර ඇනිමේ නමක් ඇතුළත් කරන්න!");

    // සෙවුම් පණිවිඩය
    resultsContainer.innerHTML = "<p style='color: white; text-align: center; width: 100%;'>Searching for '" + query + "'...</p>";

    try {
        // නිවැරදි කළ API URL එක (මෙහි Backticks භාවිතා කර ඇත)
        const response = await fetch(`https://api.jikan.moe{query}&limit=12`);
        
        if (!response.ok) throw new Error("API එකට සම්බන්ධ වීමට නොහැක.");

        const data = await response.json();
        const animeList = data.data;

        resultsContainer.innerHTML = ""; // පරණ ප්‍රතිඵල මකන්න

        if (animeList.length === 0) {
            resultsContainer.innerHTML = "<p style='color: white;'>කිසිදු ප්‍රතිඵලයක් හමු නොවීය.</p>";
            return;
        }

        // ප්‍රතිඵල ලස්සනට පෙන්වීම
        animeList.forEach(anime => {
            const animeCard = `
                <div class="card" style="margin-bottom: 20px;">
                    <span class="tag-rating">⭐ ${anime.score || 'N/A'}</span>
                    <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                    <div class="card-title">${anime.title}</div>
                    <a href="${anime.url}" target="_blank" style="color: #ff416c; font-size: 12px; text-decoration: none; display: block; margin-top: 5px;">View Details</a>
                </div>
            `;
            resultsContainer.innerHTML += animeCard;
        });
    } catch (error) {
        console.error("Search Error:", error);
        resultsContainer.innerHTML = "<p style='color: red; text-align: center; width: 100%;'>දත්ත ලබාගැනීමේදී දෝෂයක් ඇති විය. පසුව නැවත උත්සාහ කරන්න.</p>";
    }
}
