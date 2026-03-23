/* --- 100% වැඩ කරන ස්ථාවර VIDEO PLAYER JS --- */

function startPlay(title) {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('videoFrame');
    
    // 1. කලින් තිබුණු ඕනෑම src එකක් ඉවත් කරන්න
    iframe.src = "";
    
    // 2. ප්ලේයර් එකේ ආරක්ෂක සීමාවන් (CORS) මඟහැරීමට referrerpolicy එකතු කිරීම
    // මෙය අනිවාර්යයි, නැතිනම් GitHub එකෙන් block කරයි!
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    
    // 3. GitHub Pages වල වඩාත් ස්ථාවර vidsrc.xyz Domain එක භාවිතා කිරීම
    const embedUrl = `https://vidsrc.xyz{encodeURIComponent(title)}`;
    
    // 4. වීඩියෝව පූරණය කිරීම
    iframe.src = embedUrl;
    
    // 5. මාතෘකාව පෙන්වීම සහ Modal එක විවෘත කිරීම
    document.getElementById('playingTitle').innerText = "Watching: " + title;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // පිටුව scroll වීම නවත්වයි
}

// ප්ලේයර් එක වැසීම (Close Video)
function closeVideo() {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('videoFrame');
    
    iframe.src = ""; // වීඩියෝව නවත්වයි
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // නැවත scroll කිරීමට ඉඩ දෙයි
}
