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

document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  const isWinterSeason = now.getMonth() === 11;
  if (isWinterSeason) {
    document.body.classList.add("winter-theme");
  }
});

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

function fetchDiscordStatus() {
  const statusDot = document.querySelector(".discord-status-dot-avatar");
  const statusBubble = document.getElementById("discord-status-bubble");
  if (!statusDot) return;

  fetch("https://api.lanyard.rest/v1/users/683815400835645527")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) return;

      const presence = data.data;
      const status = presence.discord_status;
      statusDot.classList.remove("online", "idle", "dnd", "offline");
      statusDot.classList.add(status);
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
      }
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

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".overlay.active").forEach((o) => o.classList.remove("active"));
    document.getElementById("image-lightbox")?.classList.remove("active");
  }
});

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

  avatar.classList.add("owo-bounce");
  container.classList.add("owo-glow");

  const randomPhrase = furryPhrases[Math.floor(Math.random() * furryPhrases.length)];
  const originalText = statusBubble.textContent;
  const wasVisible = statusBubble.classList.contains("visible");

  statusBubble.textContent = randomPhrase;
  statusBubble.classList.add("visible", "owo-bubble");

  createGlitterPaws();

  try {
    const sounds = [
      "sounds/owo.mp3",
      "sounds/mc-fox.mp3",
      "sounds/botw-fox.wav"
    ];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Sound play failed:", e));
  } catch (e) {
    console.log("Audio not supported");
  }

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

document.addEventListener("DOMContentLoaded", () => {
  const pawhostButton = document.getElementById("pawhost-button");

  if (pawhostButton) {
    pawhostButton.addEventListener("click", (e) => {
      document.body.classList.toggle("pawhost-theme");

      if (document.body.classList.contains("pawhost-theme")) {
        localStorage.setItem("theme", "pawhost");
      } else {
        localStorage.removeItem("theme");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const minecraftButton = document.getElementById("minecraft-button");
  const minecraftOverlay = document.getElementById("minecraft-overlay");
  const copyIpBtn = document.getElementById("copy-ip-btn");
  const serverIp = document.getElementById("server-ip");

  if (minecraftButton && minecraftOverlay) {
    minecraftButton.addEventListener("click", () => {
      minecraftOverlay.classList.add("active");
    });
  }

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

/* Minigames + Firestore-backed leaderboard */

const MINIGAME_NAME_KEY = "neroMinigamePlayerName";
let currentMinigameKey = "reaction";

function getPlayerName() {
  const input = document.getElementById("minigame-player-name");
  return input ? input.value.trim() : "";
}

function getGameConfig(game) {
  if (game === "clicker") {
    return { betterLower: false };
  }
  // reaction + typing: lower is better
  return { betterLower: true };
}

function saveMinigameScore(game, name, value, display) {
  if (!firebaseAvailable || !db || !name) return;
  db.collection("minigameScores")
    .add({
      game,
      name,
      value,
      display,
      ts: firebase.firestore.FieldValue.serverTimestamp()
    })
    .catch((err) => console.error("Error saving score:", err));
}

function renderMinigameLeaderboard(game) {
  const panel = document.getElementById("minigame-leaderboard-panel");
  const listEl = document.getElementById("minigame-leaderboard-list");
  const lastEl = document.getElementById("minigame-leaderboard-last");
  if (!panel || !listEl || !lastEl) return;

  if (!firebaseAvailable || !db) {
    listEl.innerHTML = "<li>Leaderboard unavailable.</li>";
    lastEl.textContent = "No connection to database.";
    return;
  }

  const cfg = getGameConfig(game);
  const scoresRef = db.collection("minigameScores").where("game", "==", game);

  // Top 10
  scoresRef
    .orderBy("value", cfg.betterLower ? "asc" : "desc")
    .limit(10)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        listEl.innerHTML = "<li>No entries yet.</li>";
      } else {
        const items = [];
        let idx = 1;
        snapshot.forEach((doc) => {
          const data = doc.data();
          const safeName = (data.name || "").replace(/[<>]/g, "");
          items.push(
            `<li>#${idx++} ${safeName} — <span class="minigame-highlight">${data.display}</span></li>`
          );
        });
        listEl.innerHTML = items.join("");
      }
    })
    .catch((err) => {
      console.error("Error loading leaderboard:", err);
      listEl.innerHTML = "<li>Failed to load leaderboard.</li>";
    });

  // Most recent entry
  scoresRef
    .orderBy("ts", "desc")
    .limit(1)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        lastEl.textContent = "No entries yet.";
      } else {
        const data = snapshot.docs[0].data();
        const safeName = (data.name || "").replace(/[<>]/g, "");
        lastEl.innerHTML = `${safeName} — <span class="minigame-highlight">${data.display}</span>`;
      }
    })
    .catch((err) => {
      console.error("Error loading last entry:", err);
      lastEl.textContent = "Failed to load last entry.";
    });
}

function initReactionGame(root) {
  root.innerHTML = `
    <div class="minigame">
      <div class="minigame-title">Reaction Fox</div>
      <div class="minigame-description">
        Wait for the button to glow, then click as fast as you can.
      </div>
      <button class="minigame-target" id="reaction-target">Start</button>
      <div class="minigame-stat" id="reaction-status"></div>
      <div class="minigame-stat">
        Best: <span class="minigame-highlight" id="reaction-best">–</span>
      </div>
    </div>
  `;

  const target = root.querySelector("#reaction-target");
  const status = root.querySelector("#reaction-status");
  const bestEl = root.querySelector("#reaction-best");

  let timeoutId = null;
  let startTime = null;
  let best = null;
  let waiting = false;

  function reset() {
    waiting = false;
    startTime = null;
    target.classList.remove("ready");
    target.textContent = "Start";
    status.textContent = "";
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function schedule() {
    waiting = true;
    status.textContent = "Wait for green...";
    target.textContent = "Wait...";
    const delay = 1000 + Math.random() * 2000;
    timeoutId = setTimeout(() => {
      target.classList.add("ready");
      target.textContent = "Click!";
      status.textContent = "Click now!";
      startTime = performance.now();
    }, delay);
  }

  target.addEventListener("click", () => {
    if (!waiting && !startTime) {
      reset();
      schedule();
      return;
    }

    if (waiting && !startTime) {
      reset();
      status.textContent = "Too soon, try again.";
      return;
    }

    if (startTime) {
      const reaction = performance.now() - startTime;
      const rounded = Math.round(reaction);
      status.textContent = `Your reaction time: ${rounded} ms`;
      if (best === null || reaction < best) {
        best = reaction;
        bestEl.textContent = `${rounded} ms`;
      }

      const name = getPlayerName();
      if (name) {
        saveMinigameScore("reaction", name, reaction, `${rounded} ms`);
        renderMinigameLeaderboard("reaction");
      }

      reset();
    }
  });
}

function initClickerGame(root) {
  root.innerHTML = `
    <div class="minigame">
      <div class="minigame-title">Paw Clicker</div>
      <div class="minigame-description">
        You have 10 seconds to click as many paws as you can.
      </div>
      <button class="minigame-primary-btn" id="clicker-start">Start round</button>
      <div class="minigame-stat">
        Time left: <span class="minigame-highlight" id="clicker-time">10</span>s
      </div>
      <div class="minigame-stat">
        Score: <span class="minigame-highlight" id="clicker-score">0</span>
        &nbsp;|&nbsp; Best: <span class="minigame-highlight" id="clicker-best">0</span>
      </div>
      <button class="minigame-target" id="clicker-target">🐾 Tap me</button>
    </div>
  `;

  const startBtn = root.querySelector("#clicker-start");
  const target = root.querySelector("#clicker-target");
  const timeEl = root.querySelector("#clicker-time");
  const scoreEl = root.querySelector("#clicker-score");
  const bestEl = root.querySelector("#clicker-best");

  let time = 10;
  let score = 0;
  let best = 0;
  let intervalId = null;
  let running = false;

  function stop() {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    startBtn.disabled = false;
    target.disabled = true;

    const name = getPlayerName();
    if (name && score > 0) {
      saveMinigameScore("clicker", name, score, `${score} clicks`);
      renderMinigameLeaderboard("clicker");
    }
  }

  function start() {
    if (running) return;
    running = true;
    time = 10;
    score = 0;
    timeEl.textContent = time;
    scoreEl.textContent = score;
    startBtn.disabled = true;
    target.disabled = false;

    intervalId = setInterval(() => {
      time -= 1;
      timeEl.textContent = time;
      if (time <= 0) {
        if (score > best) {
          best = score;
          bestEl.textContent = best;
        }
        stop();
      }
    }, 1000);
  }

  startBtn.addEventListener("click", start);

  target.addEventListener("click", () => {
    if (!running) return;
    score += 1;
    scoreEl.textContent = score;
    target.style.transform = "scale(0.95)";
    setTimeout(() => {
      target.style.transform = "";
    }, 80);
  });

  target.disabled = true;
}

function initTypingGame(root) {
  const phrases = [
    "foxes are very valid",
    "paws on keyboard",
    "owo type fast",
    "linux and fluffy tails"
  ];

  root.innerHTML = `
    <div class="minigame">
      <div class="minigame-title">Typing Rush</div>
      <div class="minigame-description">
        Type the sentence as fast as you can without mistakes.
      </div>
      <div class="minigame-stat">
        Target: <span class="minigame-highlight" id="typing-target"></span>
      </div>
      <input class="minigame-input" id="typing-input" placeholder="Start typing to begin..." />
      <div class="minigame-stat">
        Last: <span class="minigame-highlight" id="typing-last">–</span>
        &nbsp;|&nbsp; Best: <span class="minigame-highlight" id="typing-best">–</span>
      </div>
    </div>
  `;

  const targetEl = root.querySelector("#typing-target");
  const input = root.querySelector("#typing-input");
  const lastEl = root.querySelector("#typing-last");
  const bestEl = root.querySelector("#typing-best");

  let current = "";
  let startTime = null;
  let best = null;

  function newPhrase() {
    current = phrases[Math.floor(Math.random() * phrases.length)];
    targetEl.textContent = current;
    input.value = "";
    startTime = null;
    input.style.borderColor = "var(--glass-border)";
  }

  input.addEventListener("input", () => {
    if (!current) return;
    if (!startTime && input.value.length > 0) {
      startTime = performance.now();
    }

    if (current.startsWith(input.value)) {
      input.style.borderColor = "var(--glass-border)";
    } else {
      input.style.borderColor = "#ef4444";
    }

    if (input.value === current && startTime) {
      const time = performance.now() - startTime;
      const seconds = (time / 1000).toFixed(2);
      lastEl.textContent = `${seconds}s`;
      if (best === null || time < best) {
        best = time;
        bestEl.textContent = `${seconds}s`;
      }

      const name = getPlayerName();
      if (name) {
        saveMinigameScore("typing", name, time, `${seconds}s`);
        renderMinigameLeaderboard("typing");
      }

      newPhrase();
    }
  });

  newPhrase();
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("minigame-content");
  const gameButtons = document.querySelectorAll(".minigame-select");
  const leaderboardBtn = document.getElementById("minigame-leaderboard-btn");
  const leaderboardPanel = document.getElementById("minigame-leaderboard-panel");
  const playerNameInput = document.getElementById("minigame-player-name");

  // Check if mobile - disable minigames on small screens
  function isMobile() {
    return window.innerWidth <= 768;
  }

  if (isMobile()) {
    // Don't initialize minigames on mobile
    return;
  }

  if (playerNameInput) {
    const savedName = localStorage.getItem(MINIGAME_NAME_KEY);
    if (savedName) playerNameInput.value = savedName;
    playerNameInput.addEventListener("input", () => {
      localStorage.setItem(MINIGAME_NAME_KEY, playerNameInput.value.trim());
    });
  }

  if (leaderboardBtn && leaderboardPanel) {
    leaderboardBtn.addEventListener("click", () => {
      leaderboardPanel.classList.toggle("visible");
      if (leaderboardPanel.classList.contains("visible")) {
        renderMinigameLeaderboard(currentMinigameKey);
      }
    });
  }

  if (!container || !gameButtons.length) return;

  const games = {
    reaction: initReactionGame,
    clicker: initClickerGame,
    typing: initTypingGame
  };

  function loadGame(key) {
    const init = games[key];
    if (!init) return;
    currentMinigameKey = key;

    gameButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.game === key);
    });
    container.innerHTML = "";
    init(container);

    if (leaderboardPanel && leaderboardPanel.classList.contains("visible")) {
      renderMinigameLeaderboard(currentMinigameKey);
    }
  }

  gameButtons.forEach(btn => {
    btn.addEventListener("click", () => loadGame(btn.dataset.game));
  });

  // Load default game
  loadGame("reaction");
});
