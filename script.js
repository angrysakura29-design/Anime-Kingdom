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

function renderRow(id, list) {
    const container = document.getElementById(id);
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
    renderRow('mostPopular', tvData); // දැනට පරණ ඒවාම දැමුවා
};
