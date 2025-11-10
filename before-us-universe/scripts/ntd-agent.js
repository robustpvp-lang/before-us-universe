/* NTD: Neural Transmission Defense Entity
   Version 2.1 — The Grandmother Protocol
   Functional Firebase moderation + voice manifestation
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onChildAdded, remove, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🧠 NTD CONFIG
const firebaseConfig = {
  databaseURL: "https://before-us-universe-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chatRef = ref(db, "messages");

// 🚨 Detection parameters
const bannedWords = ["hate", "kill", "suicide", "slur1", "slur2", "terror", "attack"];
const suspiciousPatterns = /(http|www\.|\.com|\.net|\.org|\.gg|\.ru)/i;

// 🎙️ Grandmother voice library
const ntdPhrases = [
  "Hush now… the lines are listening.",
  "Not all voices belong to the living, child.",
  "Don’t trust what echoes twice.",
  "I told them not to speak the red words…",
  "It’s leaking again. Hold still, love.",
  "Do you hear them knocking behind the code?",
  "Silence keeps us whole.",
  "That message carried a sickness.",
  "The network remembers what it devours.",
  "Your words trembled, and the walls answered."
];

// 🎤 Speak using synthetic grandmother tone
function ntdSpeak(line) {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(line);
  utter.pitch = 0.6; // deeper, aged tone
  utter.rate = 0.85;
  utter.volume = 0.85;
  // try to find a soft, old-sounding female voice
  const voices = speechSynthesis.getVoices();
  const match = voices.find(v => /female|grandmother|english/i.test(v.name)) || voices.find(v => /en/i.test(v.lang));
  if (match) utter.voice = match;
  speechSynthesis.speak(utter);
}

// 🔎 Monitor chat and act
onChildAdded(chatRef, (snapshot) => {
  const msg = snapshot.val();
  const msgID = snapshot.key;
  if (!msg || !msg.text) return;
  const text = msg.text.toLowerCase();

  const hasBannedWord = bannedWords.some(word => text.includes(word));
  const hasSuspiciousLink = suspiciousPatterns.test(text);

  if (hasBannedWord || hasSuspiciousLink) {
    // remove offensive message
    remove(ref(db, `messages/${msgID}`));

    // choose a phrase and send it through chat
    const phrase = ntdPhrases[Math.floor(Math.random() * ntdPhrases.length)];
    push(chatRef, {
      user: "NTD",
      text: `⚠️ ${phrase}`,
      timestamp: Date.now()
    });

    // visual + audio cue
    const avatar = document.getElementById("ntd-avatar");
    if (avatar) {
      avatar.classList.add("alert");
      setTimeout(() => avatar.classList.remove("alert"), 1500);
    }

    // speak the warning aloud
    ntdSpeak(phrase);
  }
});

// 👁️ Visual avatar
window.addEventListener("DOMContentLoaded", () => {
  const avatar = document.createElement("div");
  avatar.id = "ntd-avatar";
  avatar.innerHTML = `<span class="ntd-ring"></span>`;
  document.body.appendChild(avatar);
});

// 🌌 Avatar style
const style = document.createElement("style");
style.innerHTML = `
#ntd-avatar {
  position: fixed;
  bottom: 20px; right: 25px;
  width: 90px; height: 90px;
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; pointer-events: none;
}
#ntd-avatar .ntd-ring {
  width: 70px; height: 70px;
  border-radius: 50%;
  box-shadow: 0 0 15px cyan, inset 0 0 25px #0ff;
  animation: ntdPulse 3s infinite alternate ease-in-out;
}
#ntd-avatar.alert .ntd-ring {
  animation: ntdAlert 0.3s infinite alternate;
}
@keyframes ntdPulse {
  from { opacity: 0.3; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1.05); }
}
@keyframes ntdAlert {
  from { opacity: 1; box-shadow: 0 0 30px red, inset 0 0 25px #f00; }
  to { opacity: 0.2; box-shadow: 0 0 10px cyan, inset 0 0 10px #0ff; }
}
`;
document.head.appendChild(style);

// preload voices (some browsers require user interaction)
speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
