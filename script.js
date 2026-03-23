/* --- 100% වැඩ කරන ස්ථාවර VIDEO PLAYER JS --- */

function startPlay(title) {
    const modal = document.getElementById('video-modal');
    const wrapper = document.getElementById('iframeWrapper');
    
    // වැරදීමක් වෙන්න බැරි විදියට ලින්ක් එක මෙහෙම හදමු
    // vidsrc.me එක GitHub Pages වලට වඩාත් ස්ථාවරයි
    const baseUrl = "https://vidsrc.me";
    const finalUrl = baseUrl + encodeURIComponent(title);
    
    wrapper.innerHTML = `
        <iframe 
            src="${finalUrl}" 
            referrerpolicy="no-referrer" 
            allowfullscreen 
            allow="autoplay; encrypted-media">
        </iframe>
    `;
    
    document.getElementById('playingTitle').innerText = "Watching: " + title;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}


// ප්ලේයර් එක වැසීම (Close Video)
function closeVideo() {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('videoFrame');
    
    iframe.src = ""; // වීඩියෝව නවත්වයි
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // නැවත scroll කිරීමට ඉඩ දෙයි
}
