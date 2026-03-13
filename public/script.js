// ============================================
// THEME CONFIGURATION
// ============================================
const THEME_CONFIG = {
    activeTheme: 'spring', // Options: 'default', 'winter', 'spring', 'summer', 'autumn', 'eurofurence', 'nordicfuzzcon'
};

const THEMES = {
    winter: {
        primary: '#60a5fa',
        primaryLight: '#93c5fd',
        primaryGlow: 'rgba(96, 165, 250, 0.4)',
        secondary: '#7dd3fc',
        secondaryLight: '#a5f3fc',
        accent: '#e0f2fe'
    },
    spring: {
        primary: '#4ade80',
        primaryLight: '#86efac',
        primaryGlow: 'rgba(74, 222, 128, 0.4)',
        secondary: '#fbbf24',
        secondaryLight: '#fcd34d',
        accent: '#fef3c7'
    },
    summer: {
        primary: '#fb923c',
        primaryLight: '#fdba74',
        primaryGlow: 'rgba(251, 146, 60, 0.4)',
        secondary: '#fbbf24',
        secondaryLight: '#fde047',
        accent: '#fef08a'
    },
    autumn: {
        primary: '#f97316',
        primaryLight: '#fb923c',
        primaryGlow: 'rgba(249, 115, 22, 0.4)',
        secondary: '#dc2626',
        secondaryLight: '#ef4444',
        accent: '#fca5a5'
    },
    eurofurence: {
        primary: '#4a854b',
        primaryLight: '#66b668',
        primaryGlow: 'rgba(59, 130, 246, 0.4)',
        secondary: '#4a854b',
        secondaryLight: '#4a854b',
        accent: '#4a854b'
    },
    nordicfuzzcon: {
        primary: '#06b6d4',
        primaryLight: '#22d3ee',
        primaryGlow: 'rgba(6, 182, 212, 0.4)',
        secondary: '#0891b2',
        secondaryLight: '#06b6d4',
        accent: '#67e8f9'
    },
    default: {
        primary: '#6366f1',
        primaryLight: '#818cf8',
        primaryGlow: 'rgba(99, 102, 241, 0.4)',
        secondary: '#a855f7',
        secondaryLight: '#c084fc',
        accent: '#22d3ee'
    }
};

// ============================================
// THEME APPLICATION
// ============================================
function applyTheme() {
    const themeName = THEME_CONFIG.activeTheme;
    const theme = THEMES[themeName] || THEMES.default;
    
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-light', theme.primaryLight);
    root.style.setProperty('--primary-glow', theme.primaryGlow);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--secondary-light', theme.secondaryLight);
    root.style.setProperty('--accent', theme.accent);
}

document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
});

// ============================================
// OVERLAY SYSTEM
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-overlay]").forEach((button) => {
        button.addEventListener("click", () => {
            const overlayId = button.getAttribute("data-overlay");
            const overlay = document.getElementById(overlayId);
            if (overlay) overlay.classList.add("active");
        });
    });

    document.querySelectorAll(".close-button").forEach((btn) => {
        btn.addEventListener("click", () => {
            btn.closest(".overlay").classList.remove("active");
        });
    });

    document.querySelectorAll(".overlay").forEach((overlay) => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.classList.remove("active");
        });
    });
});

// ============================================
// DISCORD STATUS & AVATAR
// ============================================
let initialLoadComplete = false;

function revealPage() {
    if (!initialLoadComplete) {
        document.body.classList.add("loaded");
        initialLoadComplete = true;
    }
}

function fetchDiscordStatus() {
    const statusDot = document.querySelector(".discord-status-dot-avatar");
//    const statusBubble = document.getElementById("discord-status-bubble");
    const profilePicture = document.querySelector(".profile-picture");
    
    if (!statusDot) return;

    fetch("https://api.lanyard.rest/v1/users/683815400835645527")
        .then((res) => res.json())
        .then((data) => {
            if (!data.success) return;

            const presence = data.data;
            const status = presence.discord_status;

            statusDot.classList.remove("online", "idle", "dnd", "offline"); // Updates status dot
            statusDot.classList.add(status);

            if (profilePicture && presence.discord_user) { // Updates profile picture with Discord avatar dynamically
                const user = presence.discord_user;
                const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
                
                const img = new Image(); // Preloads image before revealing page
                img.onload = revealPage;
                img.onerror = revealPage; // Reveals even if image fails
                img.src = avatarUrl;
                
                // Sets the actual src
                profilePicture.src = avatarUrl;
            } else {
                revealPage();
            }

            // Updates custom status bubble
            //if (statusBubble) {
            //    const customStatus = (presence.activities || []).find(
            //        (a) => a.type === 4 && a.state && a.state.trim().length > 0
            //    );

            //    if (customStatus) {
            //        const emoji = customStatus.emoji?.name || "";
            //        const bubbleText = `${emoji} ${customStatus.state}`.trim();
            //        statusBubble.textContent = bubbleText;
            //        statusBubble.classList.add("visible");
            //    } else {
            //        statusBubble.textContent = "";
            //        statusBubble.classList.remove("visible");
            //    }
            // }
        })
        .catch((err) => {
            console.error("Discord status error:", err);
            revealPage(); // Ensures page reveals even on error
        });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchDiscordStatus();
    setInterval(fetchDiscordStatus, 30000);
    
    setTimeout(revealPage, 2000); // Fallback to Force reveal after 2 seconds if Lanyard hangs
});

// ============================================
// GALLERY LIGHTBOX
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    const galleryGrid = document.getElementById("gallery-grid");
    const lightbox = document.getElementById("image-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.querySelector(".lightbox-close");

    if (galleryGrid && lightbox) {
        galleryGrid.addEventListener("click", (e) => {
            const item = e.target.closest(".gallery-item");
            if (!item) return;

            const img = item.querySelector("img");
            const isSpoiler = item.dataset.spoiler === "true";
            const isRevealed = item.classList.contains("revealed");

            if (isSpoiler && !isRevealed) {
                item.classList.add("revealed");
            } else {
                lightboxImg.src = img.src;
                lightbox.classList.add("active");
            }
        });

        lightboxClose?.addEventListener("click", () => lightbox.classList.remove("active"));

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) lightbox.classList.remove("active");
        });
    }
});

// ============================================
// SPOTIFY/ACTIVITY WIDGET
// ============================================
let activityDismissed = false;
let currentActivityId = null;

function updateActivityWidget() {
    const widget = document.getElementById("spotify-widget");
    if (!widget) return;

    fetch("https://api.lanyard.rest/v1/users/683815400835645527")
        .then((res) => res.json())
        .then((data) => {
            if (!data.success) return;

            const presence = data.data;
            let activityData = null;

            if (presence.spotify && presence.listening_to_spotify) {
                activityData = {
                    type: "spotify",
                    id: presence.spotify.track_id,
                    albumArt: presence.spotify.album_art_url,
                    title: presence.spotify.song,
                    subtitle: presence.spotify.artist,
                    link: `https://open.spotify.com/track/${presence.spotify.track_id}`,
                    icon: "fa-brands fa-spotify",
                    label: "Now Playing"
                };
            } else if (presence.activities && presence.activities.length > 0) {
                const gamingActivity = presence.activities.find(
                    (a) => a.name && a.type === 0
                );

                if (gamingActivity) {
                    const gameIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234338ca'/%3E%3Ctext x='50' y='50' font-size='50' text-anchor='middle' dominant-baseline='central'%3E🎮%3C/text%3E%3C/svg%3E";

                    activityData = {
                        type: "gaming",
                        id: gamingActivity.name,
                        albumArt: gameIcon,
                        title: gamingActivity.name,
                        subtitle: gamingActivity.details || gamingActivity.state || "Playing",
                        link: null,
                        icon: "fa-solid fa-gamepad",
                        label: "Playing"
                    };
                }
            }

            if (activityData && !activityDismissed) {
                if (currentActivityId !== activityData.id) {
                    currentActivityId = activityData.id;
                    activityDismissed = false;
                }

                document.getElementById("album-art").src = activityData.albumArt;
                document.getElementById("song-name").textContent = activityData.title;
                document.getElementById("artist-name").textContent = activityData.subtitle;

                const label = widget.querySelector(".spotify-label");
                label.innerHTML = `<i class="${activityData.icon}"></i> ${activityData.label}`;

                const link = document.getElementById("listen-along-link");
                if (activityData.link) {
                    link.href = activityData.link;
                    link.style.display = "flex";
                } else {
                    link.style.display = "none";
                }

                widget.classList.add("visible");
                widget.classList.remove("dismissed");
            } else {
                widget.classList.remove("visible");
                if (!activityData) {
                    activityDismissed = false;
                    currentActivityId = null;
                }
            }
        })
        .catch((err) => {
            console.error("Activity widget error:", err);
            widget.classList.remove("visible");
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const widget = document.getElementById("spotify-widget");
    const closeBtn = document.getElementById("spotify-close");

    closeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        activityDismissed = true;
        widget.classList.add("dismissed");
        widget.classList.remove("visible");
    });

    widget?.addEventListener("click", (e) => {
        if (e.target.closest(".spotify-close")) return;
        const link = document.getElementById("listen-along-link");
        if (link?.href && link.style.display !== "none") {
            window.open(link.href, "_blank\"")
        }
    });

    updateActivityWidget();
    setInterval(updateActivityWidget, 10000);
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll(".overlay.active").forEach((o) => o.classList.remove("active"));
        document.getElementById("image-lightbox")?.classList.remove("active");
    }
});

// ============================================
// EASTER EGG SYSTEM
// ============================================
// let typedSequence = "";
// let easterEggTimeout = null;
// let easterEggTriggered = 0;

//function triggerOwoEasterEgg() {
//    const avatar = document.querySelector(".gradient-border");
//    const container = document.querySelector(".container");
//
//    if (!avatar || easterEggTriggered > 0) return;
//
//    easterEggTriggered = Date.now();
//    
//    // Add bounce and glow effects
//    avatar.classList.add("owo-bounce");
//    container.classList.add("owo-glow");
//
//    // Spawn glitter paws (reduced amount)
//    createGlitterPaws();
//
//   // Play sound
//    try {
//        const sounds = [
//            "sounds/owo.mp3",
//            "sounds/mc-fox.mp3",
//            "sounds/botw-fox.wav"
//        ];
//        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
//        const audio = new Audio(randomSound);
//        audio.volume = 0.3;
//        audio.play().catch(e => console.log("Sound play failed:", e));
//    } catch (e) {
//        console.log("Audio not supported");
//    }
//
//    // Cleanup effects after animation
//    setTimeout(() => {
//        avatar.classList.remove("owo-bounce");
//        container.classList.remove("owo-glow");
//        easterEggTriggered = 0;
//    }, 2000);
//}

function createGlitterPaws() {
    const container = document.querySelector(".main-grid");
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const paw = document.createElement("div");
            paw.className = "glitter-paw";
            paw.style.left = Math.random() * 80 + 10 + "%";
            paw.style.top = Math.random() * 80 + 10 + "%";
            container.appendChild(paw);
            setTimeout(() => paw.remove(), 1500);
        }, i * 150);
    }
}

document.addEventListener("keypress", (e) => {
    if (e.target.matches("input, textarea")) return;

    clearTimeout(easterEggTimeout);
    typedSequence += e.key.toLowerCase();

    if (typedSequence.length > 6) {
        typedSequence = typedSequence.slice(-6);
    }

    if (typedSequence.includes("owo") || typedSequence.includes("uwu")) {
        triggerOwoEasterEgg();
        typedSequence = "";
    }

    easterEggTimeout = setTimeout(() => {
        typedSequence = "";
    }, 2000);
});

// ============================================
// MOBILE SHAKE DETECTION
// ============================================
//let lastShakeTime = 0;
//let shakeThreshold = 15;
//let lastX = 0, lastY = 0, lastZ = 0;

// function handleMotion(event) {
//    const current = Date.now();
//    if ((current - lastShakeTime) < 1000) return;
//
//    const acceleration = event.accelerationIncludingGravity;
//    if (!acceleration) return;
//
//    const deltaX = Math.abs(acceleration.x - lastX);
//    const deltaY = Math.abs(acceleration.y - lastY);
//    const deltaZ = Math.abs(acceleration.z - lastZ);
//
//    if (deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) {
//        lastShakeTime = current;
//        triggerOwoEasterEgg();
//    }
//
//    lastX = acceleration.x;
//    lastY = acceleration.y;
//    lastZ = acceleration.z;
//}

// function initShakeDetection() {
//    if (typeof DeviceMotionEvent !== "undefined") {
//        if (typeof DeviceMotionEvent.requestPermission === "function") {
//            document.addEventListener("click", () => {
//                DeviceMotionEvent.requestPermission()
//                    .then(response => {
//                        if (response === "granted") {
//                            window.addEventListener("devicemotion", handleMotion);
//                        }
//                    })
//                    .catch(console.error);
//            }, { once: true });
//        } else {
//            window.addEventListener("devicemotion", handleMotion);
//        }
//    }
//}

//if (/Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
//    initShakeDetection();
//}

// ============================================
// PAWHOST THEME TOGGLE
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    const pawhostButton = document.getElementById("pawhost-button");
    if (pawhostButton) {
        pawhostButton.addEventListener("click", (e) => {
            document.body.classList.toggle("pawhost-theme");
            if (document.body.classList.contains("pawhost-theme")) {
                localStorage.setItem("theme", "\"pawhost\"");
            } else {
                localStorage.removeItem("theme");
            }
        });
    }
});

// ============================================
// OTHER CUSTOM FUNCTIONS uwu
// ============================================

(function updateAge() { // Updates age automatically based on given date
    const birth = new Date(2006, 3, 21);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const notYet =
        now.getMonth() < birth.getMonth() ||
        (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
    if (notYet) age--;
    const el = document.getElementById("age-display");
    if (el) el.textContent = age + "y";
    setTimeout(updateAge, 3600000);
})();

