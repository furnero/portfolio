// ========== FIREBASE CONFIG ==========
const firebaseConfig = {
  apiKey: "AIzaSyA7Utd_zH6orCQCiBZkqaMBBLGk7nO8U1U",
  authDomain: "nerowospace.firebaseapp.com",
  projectId: "nerowospace",
  storageBucket: "nerowospace.firebasestorage.app",
  messagingSenderId: "684207013841",
  appId: "1:684207013841:web:6b766633711961155c2af0"
};

let db = null;
let firebaseAvailable = true;

try {
  if (typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  } else {
    console.warn("Firebase SDK not loaded");
    firebaseAvailable = false;
  }
} catch (e) {
  console.error("Firebase init error:", e);
  firebaseAvailable = false;
}

// ========== WINTER THEME AUTO-ENABLE ==========
document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  const isWinterSeason = now.getMonth() === 11; // December = 11
  if (isWinterSeason) {
    document.body.classList.add("winter-theme");
  }
});

// ========== OVERLAY SYSTEM ==========
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

// ========== DISCORD STATUS ==========
function fetchDiscordStatus() {
  const statusDot = document.querySelector(".discord-status-dot-avatar");
  const statusBubble = document.getElementById("discord-status-bubble");
  if (!statusDot) return;

  fetch("https://api.lanyard.rest/v1/users/683815400835645527")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) return;

      const presence = data.data;

      // ---- Presence dot ----
      const status = presence.discord_status;
      statusDot.classList.remove("online", "idle", "dnd", "offline");
      statusDot.classList.add(status);

      // ---- Speech bubble: ONLY custom status ----
      if (statusBubble) {
        const customStatus = (presence.activities || []).find(
          (a) => a.type === 4 && a.state && a.state.trim().length > 0
        );

        if (customStatus) {
          const emoji = customStatus.emoji?.name || "";
          const bubbleText = `${emoji} ${customStatus.state}`.trim();
          statusBubble.textContent = bubbleText;
          statusBubble.classList.add("visible");
        } else {
          statusBubble.textContent = "";
          statusBubble.classList.remove("visible");
        }
      }
    })
    .catch((err) => console.error("Discord status error:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  fetchDiscordStatus();
  setInterval(fetchDiscordStatus, 30000);
});

// Status tooltip
document.addEventListener("DOMContentLoaded", () => {
  const statusDot = document.querySelector(".discord-status-dot-avatar");
  const statusTooltip = document.getElementById("status-tooltip");

  if (statusDot && statusTooltip) {
    statusDot.addEventListener("click", (e) => {
      e.stopPropagation();
      statusTooltip.classList.add("show");
      setTimeout(() => statusTooltip.classList.remove("show"), 3000);
    });
  }
});

// ========== GALLERY & LIGHTBOX ==========
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

// ========== SPOTIFY / GAMING WIDGET ==========
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

      // Priority 1: Spotify
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
      }
      // Priority 2: Gaming (type 0)
      else if (presence.activities && presence.activities.length > 0) {
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

      // Show or hide widget
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
      window.open(link.href, "_blank");
    }
  });

  updateActivityWidget();
  setInterval(updateActivityWidget, 10000);
});

// ========== FIREBASE COMMENTS SYSTEM ==========
document.addEventListener("DOMContentLoaded", () => {
  const commentsContainer = document.getElementById("comments-container");
  const commentForm = document.getElementById("comment-form");

  if (!firebaseAvailable || !db) {
    if (commentsContainer) {
      commentsContainer.innerHTML = '<p class="error-text">Currently unavailable.</p>';
    }
    if (commentForm) {
      commentForm.style.display = "none";
    }
    return;
  }

  function loadComments() {
    db.collection("comments")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          commentsContainer.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
          return;
        }

        const likedIds = JSON.parse(localStorage.getItem("likedComments")) || [];

        let html = "";
        snapshot.forEach((doc) => {
          const comment = doc.data();
          const commentId = doc.id;
          html += `
            <div class="comment" data-comment-id="${commentId}">
              <strong class="comment-author">${escapeHtml(comment.name)}:</strong>
              <p class="comment-text">${escapeHtml(comment.text)}</p>
              <div class="comment-footer">
                <small class="comment-date">${formatDate(comment.timestamp)}</small>
                <div class="like-section">
                  <button class="like-button ${likedIds.includes(commentId) ? "liked" : ""}">❤️</button>
                  <span class="like-count">${comment.likes || 0}</span>
                </div>
              </div>
            </div>
          `;
        });

        commentsContainer.innerHTML = html;
      })
      .catch((err) => {
        console.error("Error loading comments:", err);
        commentsContainer.innerHTML = '<p class="error-text">Failed to load comments.</p>';
      });
  }

  function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  if (commentForm) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const nameInput = commentForm.querySelector('input[name="name"]');
      const textInput = commentForm.querySelector('textarea[name="text"]');
      
      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      db.collection("comments")
        .add({
          name: name,
          text: text,
          likes: 0,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          commentForm.reset();
          document.getElementById("char-counter").textContent = "80";
          loadComments();
        })
        .catch((err) => console.error("Error adding comment:", err));
    });
  }

  document.addEventListener("click", (e) => {
    const likeButton = e.target.closest(".like-button");
    if (!likeButton || likeButton.classList.contains("liked")) return;

    e.stopPropagation();
    const commentDiv = likeButton.closest(".comment");
    if (!commentDiv) return;

    const commentId = commentDiv.dataset.commentId;
    const likeCountSpan = commentDiv.querySelector(".like-count");

    likeButton.classList.add("liked");

    const commentRef = db.collection("comments").doc(commentId);
    commentRef.update({
      likes: firebase.firestore.FieldValue.increment(1)
    })
    .then(() => {
      const currentLikes = parseInt(likeCountSpan.textContent) || 0;
      likeCountSpan.textContent = currentLikes + 1;

      let likedIds = JSON.parse(localStorage.getItem("likedComments")) || [];
      if (!likedIds.includes(commentId)) {
        likedIds.push(commentId);
        localStorage.setItem("likedComments", JSON.stringify(likedIds));
      }
    })
    .catch((err) => {
      likeButton.classList.remove("liked");
      console.error("Error liking:", err);
    });
  });

  loadComments();
});

// ========== CHARACTER COUNTER ==========
document.addEventListener("DOMContentLoaded", () => {
  const commentInput = document.getElementById("comment-input");
  const charCounter = document.getElementById("char-counter");

  if (commentInput && charCounter) {
    const maxLength = commentInput.getAttribute("maxlength") || 80;
    charCounter.textContent = maxLength;

    commentInput.addEventListener("input", () => {
      charCounter.textContent = maxLength - commentInput.value.length;
    });
  }
});

// ========== ESC KEY TO CLOSE ==========
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".overlay.active").forEach((o) => o.classList.remove("active"));
    document.getElementById("image-lightbox")?.classList.remove("active");
  }
});

// ========== FURRY EASTER EGG: OWO/UWU DETECTOR ==========
let typedSequence = "";
let easterEggTimeout = null;
let easterEggTriggered = 0;

const furryPhrases = [
  "OwO what's this?",
  "*notices you* OwO",
  "UwU",
  "*nuzzles*",
  "rawr x3",
  "*glomps*",
  "*wags tail*",
  "hewwo! ^w^",
  "*boops snoot*",
  "yip yip! 🦊"
];

function triggerOwoEasterEgg() {
  const avatar = document.querySelector(".gradient-border");
  const statusBubble = document.getElementById("discord-status-bubble");
  const container = document.querySelector(".container");
  
  if (!avatar || easterEggTriggered > 0) return;
  
  easterEggTriggered = Date.now();
  
  // Bounce animation on avatar
  avatar.classList.add("owo-bounce");
  
  // Rainbow glow on container
  container.classList.add("owo-glow");
  
  // Show random furry phrase in bubble
  const randomPhrase = furryPhrases[Math.floor(Math.random() * furryPhrases.length)];
  const originalText = statusBubble.textContent;
  const wasVisible = statusBubble.classList.contains("visible");
  
  statusBubble.textContent = randomPhrase;
  statusBubble.classList.add("visible", "owo-bubble");
  
  // Create glitter paws
  createGlitterPaws();
  
  // Play custom sound
  try {
    const sounds = [
      "sounds/owo2.mp3",
      "sounds/owo4.mp3"
    ];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Sound play failed:", e));
  } catch (e) {
    console.log("Audio not supported");
  }
  
  // Reset after animation
  setTimeout(() => {
    avatar.classList.remove("owo-bounce");
    container.classList.remove("owo-glow");
    statusBubble.classList.remove("owo-bubble");
    
    if (!wasVisible) {
      statusBubble.classList.remove("visible");
      statusBubble.textContent = originalText;
    } else {
      statusBubble.textContent = originalText;
    }
    
    easterEggTriggered = 0;
  }, 3000);
}

function createGlitterPaws() {
  const container = document.querySelector(".main-grid");
  
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const paw = document.createElement("div");
      paw.className = "glitter-paw";
      paw.style.left = Math.random() * 100 + "%";
      paw.style.top = Math.random() * 100 + "%";
      
      container.appendChild(paw);
      
      setTimeout(() => paw.remove(), 2000);
    }, i * 100);
  }
}

// Listen for typing
document.addEventListener("keypress", (e) => {
  // Don't trigger in input fields
  if (e.target.matches("input, textarea")) return;
  
  clearTimeout(easterEggTimeout);
  typedSequence += e.key.toLowerCase();
  
  // Keep only last 6 characters
  if (typedSequence.length > 6) {
    typedSequence = typedSequence.slice(-6);
  }
  
  // Check for owo or uwu
  if (typedSequence.includes("owo") || typedSequence.includes("uwu")) {
    triggerOwoEasterEgg();
    typedSequence = "";
  }
  
  // Reset sequence after 2 seconds of no typing
  easterEggTimeout = setTimeout(() => {
    typedSequence = "";
  }, 2000);
});

// ========== MOBILE SHAKE DETECTION ==========
let lastShakeTime = 0;
let shakeThreshold = 15;
let lastX = 0, lastY = 0, lastZ = 0;

function handleMotion(event) {
  const current = Date.now();
  
  if ((current - lastShakeTime) < 1000) return;
  
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;
  
  const deltaX = Math.abs(acceleration.x - lastX);
  const deltaY = Math.abs(acceleration.y - lastY);
  const deltaZ = Math.abs(acceleration.z - lastZ);
  
  if (deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) {
    lastShakeTime = current;
    triggerOwoEasterEgg();
  }
  
  lastX = acceleration.x;
  lastY = acceleration.y;
  lastZ = acceleration.z;
}

function initShakeDetection() {
  if (typeof DeviceMotionEvent !== "undefined") {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      document.addEventListener("click", () => {
        DeviceMotionEvent.requestPermission()
          .then(response => {
            if (response === "granted") {
              window.addEventListener("devicemotion", handleMotion);
            }
          })
          .catch(console.error);
      }, { once: true });
    } else {
      window.addEventListener("devicemotion", handleMotion);
    }
  }
}

if (/Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
  initShakeDetection();
}

// ========== PAWHOST THEME TOGGLE ==========
document.addEventListener("DOMContentLoaded", () => {
  const pawhostButton = document.getElementById("pawhost-button");
  
  if (pawhostButton) {
    pawhostButton.addEventListener("click", (e) => {
      // Toggle theme
      document.body.classList.toggle("pawhost-theme");
      
      // Save preference
      if (document.body.classList.contains("pawhost-theme")) {
        localStorage.setItem("theme", "pawhost");
      } else {
        localStorage.removeItem("theme");
      }
    });
  }
});

// ========== MINECRAFT SERVER MODAL ==========
document.addEventListener("DOMContentLoaded", () => {
  const minecraftButton = document.getElementById("minecraft-button");
  const minecraftOverlay = document.getElementById("minecraft-overlay");
  const copyIpBtn = document.getElementById("copy-ip-btn");
  const serverIp = document.getElementById("server-ip");

  // Open modal
  if (minecraftButton && minecraftOverlay) {
    minecraftButton.addEventListener("click", () => {
      minecraftOverlay.classList.add("active");
    });
  }

  // Copy IP to clipboard
  if (copyIpBtn && serverIp) {
    copyIpBtn.addEventListener("click", () => {
      const ip = serverIp.textContent;
      
      navigator.clipboard.writeText(ip).then(() => {
        const icon = copyIpBtn.querySelector("i");
        icon.className = "fa-solid fa-check";
        copyIpBtn.classList.add("copied");
        
        setTimeout(() => {
          icon.className = "fa-solid fa-copy";
          copyIpBtn.classList.remove("copied");
        }, 2000);
      }).catch(err => {
        console.error("Failed to copy:", err);
      });
    });
  }
});

// ========== MINECRAFT SERVER MODAL ==========
document.addEventListener("DOMContentLoaded", () => {
  const minecraftOverlay = document.getElementById("minecraft-overlay");
  const copyIpBtn = document.getElementById("copy-ip-btn");
  const serverIp = document.getElementById("server-ip");

  // Copy IP to clipboard
  if (copyIpBtn && serverIp) {
    copyIpBtn.addEventListener("click", () => {
      const ip = serverIp.textContent;
      
      navigator.clipboard.writeText(ip).then(() => {
        const icon = copyIpBtn.querySelector("i");
        icon.className = "fa-solid fa-check";
        copyIpBtn.classList.add("copied");
        
        setTimeout(() => {
          icon.className = "fa-solid fa-copy";
          copyIpBtn.classList.remove("copied");
        }, 2000);
      }).catch(err => {
        console.error("Failed to copy:", err);
      });
    });
  }
});
