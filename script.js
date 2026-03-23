/* --- 100% වැඩ කරන ස්ථාවර ANIME KINGDOM JS --- */

const API_URL = "https://graphql.anilist.co";

// පිටුව ලෝඩ් වන විට Trending සහ Popular ඇනිමේ පෙන්වීම
window.onload = () => {
    fetchAnime("TRENDING_DESC", "trendingGrid");
    fetchAnime("POPULARITY_DESC", "popularGrid");
};

// 1. AniList හරහා ඇනිමේ දත්ත ලබා ගැනීම (GraphQL පාවිච්චි කරලා)
async function fetchAnime(sort, gridId) {
    const query = `
    query {
      Page(perPage: 15) {
        media(sort: ${sort}, type: ANIME) {
          id
          title { english romaji }
          coverImage { extraLarge }
          description
        }
      }
    }`;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        renderCards(data.data.Page.media, gridId);
        document.getElementById('loader').style.display = 'none';
    } catch (e) {
        console.error("Data Fetch Error:", e);
        document.getElementById('loader').innerText = "දත්ත පූරණය කිරීමේ දෝෂයකි!";
    }
}

// 2. සෙවීමේ පහසුකම (Search Function)
async function searchAnime() {
    const queryText = document.getElementById('searchInput').value.trim();
    if (!queryText) return;

    document.getElementById('loader').style.display = 'block';
    const query = `
    query {
      Page(perPage: 18) {
        media(search: "${queryText}", type: ANIME) {
          id
          title { english romaji }
          coverImage { extraLarge }
          description
        }
      }
    }`;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        renderCards(data.data.Page.media, "trendingGrid");
        
        // සර්ච් කළ විට මාතෘකාව වෙනස් කිරීම
        document.querySelector('.row-section h2').innerText = `'${queryText}' සඳහා ප්‍රතිඵල...`;
        document.getElementById('loader').style.display = 'none';
        window.scrollTo(0, 450); // සෙවුම් ප්‍රතිඵල වෙත පිටුව පහළට ගෙන යාම
    } catch (e) {
        alert("සෙවීමේ දෝෂයක් ඇති විය!");
        document.getElementById('loader').style.display = 'none';
    }
}

// 3. පින්තූර සහ කාඩ්පත් නිර්මාණය කිරීම (Cards Rendering)
function renderCards(list, gridId) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = list.map(anime => {
        const title = anime.title.english || anime.title.romaji;
        const img = anime.coverImage.extraLarge;
        // නමේ තියෙන ' ලකුණු ඉවත් කිරීම (Javascript error නොවන්නට)
        const safeTitle = title.replace(/'/g, "");
        
        return `
        <div class="card" onclick="startPlay('${safeTitle}')">
            <div class="tag">HD</div>
            <img src="${img}" referrerpolicy="no-referrer" loading="lazy" alt="${title}">
            <div class="card-title">${title}</div>
        </div>`;
    }).join('');
}

// 4. වීඩියෝව ප්ලේ කිරීම (Embed Player - Fix for GitHub Pages)
function startPlay(title) {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('videoFrame');
    
    // Grey Screen එක එන ප්‍රශ්නය විසඳීමට මෙහිදී referrerpolicy="no-referrer" පාවිච්චි කරයි
    // එමෙන්ම vidsrc.xyz හෝ vidsrc.me GitHub Pages වල වඩාත් ස්ථාවරයි
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    
    // මෙහිදී වඩාත් නිවැරදි සර්වර් එකක් තෝරාගෙන ඇත
    const embedUrl = `https://vidsrc.xyz{encodeURIComponent(title)}`;
    
    iframe.src = embedUrl;
    document.getElementById('playingTitle').innerText = "Watching: " + title;
    
    // Modal එක පෙන්වීම
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // පිටුව scroll වීම නවත්වයි
}

// 5. ප්ලේයර් එක වැසීම (Close Player)
function closeVideo() {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('videoFrame');
    
    iframe.src = ""; // වීඩියෝව නවත්වයි
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // නැවත scroll කිරීමට ඉඩ දෙයි
}
