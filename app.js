// =======================
// Constants & LocalStorage Keys
// =======================
const LANGUAGE_KEY = "language";
const DEFAULT_LANGUAGE = "en";
const SOUND_KEY = "sound";
const DEFAULT_SOUND = "on";
const TTS_KEY = "ttsSetting";
const DEFAULT_TTS = "mute";
const RANDOM_MODE_KEY = "randomMode";
const THEME_KEY = "theme";
const DEFAULT_THEME = "light";
const FILTER_KEY = "activeCategories";
const FLIP_BACK_DELAY = 500;

// =======================
// Global State
// =======================
let currentLanguage = localStorage.getItem(LANGUAGE_KEY) ?? DEFAULT_LANGUAGE;
let soundOn = localStorage.getItem(SOUND_KEY) ?? DEFAULT_SOUND;
let ttsSetting = localStorage.getItem(TTS_KEY) || DEFAULT_TTS;
let isSpeaking = false;
let randomMode = localStorage.getItem(RANDOM_MODE_KEY) === "true";
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = localStorage.getItem(THEME_KEY) || (prefersDark ? "dark" : "light");
let activeCategories = JSON.parse(localStorage.getItem(FILTER_KEY)) || data.categories.map(c => c.name.en);
let seenQuestions = JSON.parse(localStorage.getItem("seenQuestions") || "{}");

// =======================
// DOM Elements
// =======================
const card = document.getElementById("iceBreakerCard");
const categoryName = document.getElementById("categoryName");
const questionText = document.getElementById("questionText");
const languageToggle = document.getElementById("languageToggle");
const soundToggle = document.getElementById("soundToggle");
const themeToggle = document.getElementById("themeToggle");
const ttsToggle = document.getElementById("ttsToggle");
const categoriesGrid = document.getElementById("categoriesGrid");
const resetQuestions = document.getElementById("resetQuestions");
const filterToggle = document.getElementById("filterToggle");
const filterPopup = document.getElementById("categoryFilterPopup");
const categoryCheckboxes = document.getElementById("categoryCheckboxes");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const randomModeToggle = document.getElementById("randomModeToggle");
const toast = document.getElementById("toast");

randomModeToggle.textContent = randomMode ? "🎲 Random Mode: On" : "🎲 Random Mode: Off";

// =======================
// Labels & Cycles
// =======================
const languageCycle = {
  en: "zh",
  zh: "en+zh",
  "en+zh": "en+zh+roman",
  "en+zh+roman": "en"
};
const languageLabels = {
  en: "EN",
  zh: "中",
  "en+zh": "EN + 中",
  "en+zh+roman": "EN + 中 + 拼音"
};
const soundLabels = {
  on: "🔊 Sound",
  off: "🔇 Muted"
};
const ttsCycle = {
  mute: "en",
  en: "zh-CN",
  "zh-CN": "zh-HK",
  "zh-HK": "mute"
};
const ttsLabels = {
  mute: "🔇 TTS",
  en: "🗣️ EN",
  "zh-CN": "🗣️ 中",
  "zh-HK": "🗣️ 粤"
};
const themeLabels = {
  dark: "☀️",
  light: "🌙"
};
// =======================
// Utility Functions
// =======================
function getDisplayText(en, zh, roman) {
  switch (currentLanguage) {
    case "zh": return zh;
    case "en+zh": return `${en} / ${zh}`;
    case "en+zh+roman": return `${en} / ${zh} / ${roman}`;
    default: return en;
  }
}

function renderQuestionHTML(en, zh, roman) {
  let html = "";
  if (["en", "en+zh", "en+zh+roman"].includes(currentLanguage)) html += `<div class="line en">${en}</div>`;
  if (["zh", "en+zh", "en+zh+roman"].includes(currentLanguage)) html += `<div class="line zh">${zh}</div>`;
  if (currentLanguage === "en+zh+roman") html += `<div class="line roman">${roman}</div>`;
  return html;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  updateToggleText(themeToggle, themeLabels, theme);
}
function updateToggleText(toggle, labels, currentValue) {
  toggle.textContent = labels[currentValue];
}

function showToast(message) {
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => toast.className = "toast", 2500);
}

function speakText(q) {
  if (ttsSetting === "mute") return;
  const utter = new SpeechSynthesisUtterance();
  utter.text = ttsSetting === "en" ? q.en : q.zh;
  utter.lang = ttsSetting;
  utter.onstart = () => isSpeaking = true;
  utter.onend = utter.onerror = () => isSpeaking = false;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

// =======================
// Question Drawing & Flipping
// =======================
let lastCategory = null;
let originalQuestion = null;

function getRandomQuestion(categoryFilter = "random") {
  const categories = data.categories.filter(c => activeCategories.includes(c.name.en));
  let selected = categoryFilter === "random"
    ? categories[Math.floor(Math.random() * categories.length)]
    : categories.find(c => [c.name.en, c.name.zh, `${c.name.en} / ${c.name.zh}`].includes(categoryFilter));
  if (!selected) return null;

  const categoryKey = selected.name.en;
  seenQuestions[categoryKey] = seenQuestions[categoryKey] || [];
  const allQuestions = selected.questions;
  const unseen = allQuestions.map((_, i) => i).filter(i => !seenQuestions[categoryKey].includes(i));
  if (unseen.length === 0) {
    seenQuestions[categoryKey] = [];
    localStorage.setItem("seenQuestions", JSON.stringify(seenQuestions));
    return getRandomQuestion(categoryFilter);
  }
  const randomIdx = unseen[Math.floor(Math.random() * unseen.length)];
  seenQuestions[categoryKey].push(randomIdx);
  localStorage.setItem("seenQuestions", JSON.stringify(seenQuestions));
  const q = allQuestions[randomIdx];
  return { category: getDisplayText(selected.name.en, selected.name.zh, selected.name.roman), question: getDisplayText(q.en, q.zh, q.roman), originalCategory: selected, originalQuestion: q };
}

function drawQuestion(categoryFilter) {
  const result = getRandomQuestion(categoryFilter);
  if (!result) return;
  ({ originalCategory: lastCategory, originalQuestion } = result);
  categoryName.textContent = result.category;
  questionText.innerHTML = renderQuestionHTML(originalQuestion.en, originalQuestion.zh, originalQuestion.roman);
}

function flipForward() {
  if (soundOn === "on") {
    try {
      flipSound.currentTime = 0;
      flipSound.play();
    } catch {}
  }
  if (card?.classList.contains("flipped")) {
    card.classList.toggle("flipped");
  } else {
    card?.classList.add("flipped");
  }
}

function drawAndFlip(categoryFilter) {
  const showNew = () => {
    drawQuestion(categoryFilter);
    flipForward();
    if (card?.classList.contains("flipped") && originalQuestion) speakText(originalQuestion);
  };
  if (card?.classList.contains("flipped")) {
    card?.classList.remove("flipped");
    setTimeout(showNew, FLIP_BACK_DELAY);
  } else showNew();
}

// =======================
// Event Listeners
// =======================
function setupEventListeners() {
  languageToggle?.addEventListener("click", () => {
    currentLanguage = languageCycle[currentLanguage] || "en";
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    updateToggleText(languageToggle, languageLabels, currentLanguage);
    populateCategoryButtons();
    if (card?.classList.contains("flipped") && originalQuestion) {
      drawQuestion(lastCategory.name.en);
    }
  });

  soundToggle?.addEventListener("click", () => {
    soundOn = soundOn === "on" ? "off" : "on";
    localStorage.setItem(SOUND_KEY, soundOn);
    updateToggleText(soundToggle, soundLabels, soundOn);
  });

  themeToggle?.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, currentTheme);
    applyTheme(currentTheme);
  });

  ttsToggle?.addEventListener("click", () => {
    ttsSetting = ttsCycle[ttsSetting];
    localStorage.setItem(TTS_KEY, ttsSetting);
    updateToggleText(ttsToggle, ttsLabels, ttsSetting);
  });

  resetQuestions?.addEventListener("click", () => {
    seenQuestions = {};
    localStorage.removeItem("seenQuestions");
    populateCategoryCheckboxes();
    showToast("✅ Question history has been reset!");
  });

  randomModeToggle?.addEventListener("click", () => {
    randomMode = !randomMode;
    localStorage.setItem(RANDOM_MODE_KEY, randomMode);
    randomModeToggle.textContent = randomMode ? "🎲 Random Mode: On" : "🎲 Random Mode: Off";
    populateCategoryButtons();
  });

  filterToggle?.addEventListener("click", () => {
    filterPopup?.classList.toggle("show");
    populateCategoryCheckboxes();
  });

  applyFiltersBtn?.addEventListener("click", () => {
    activeCategories = Array.from(categoryCheckboxes?.querySelectorAll("input[type='checkbox']") || [])
      .filter(cb => cb.checked).map(cb => cb.value);
    localStorage.setItem(FILTER_KEY, JSON.stringify(activeCategories));
    filterPopup?.classList.remove("show");
    populateCategoryButtons();
  });

  document?.addEventListener("click", (e) => {
    if (!filterPopup?.contains(e.target) && !filterToggle?.contains(e.target)) {
      filterPopup?.classList.remove("show");
    }
  });

  card?.addEventListener("click", () => {
    if (!lastCategory) drawQuestion("random");
    if (!card.classList.contains("flipped") && originalQuestion) {
      drawQuestion(lastCategory.name.en);
    }
    flipForward();
    if (card.classList.contains("flipped") && originalQuestion) {
      speakText(originalQuestion);
    }
  });
}


// =======================
// UI Population
// =======================
function populateCategoryButtons() {
  categoriesGrid.innerHTML = "";
  const addBtn = (text, category) => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.textContent = text;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      drawAndFlip(category);
    });
    categoriesGrid.appendChild(btn);
  };
  if (randomMode) return addBtn(getDisplayText("Random", "随机", "Suíjī"), "random");
  data.categories.forEach(cat => {
    if (!activeCategories.includes(cat.name.en)) return;
    const label = getDisplayText(cat.name.en, cat.name.zh, cat.name.roman);
    addBtn(label, label);
  });
}

function populateCategoryCheckboxes() {
  categoryCheckboxes.innerHTML = "";
  data.categories.forEach(cat => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = cat.name.en;
    checkbox.checked = activeCategories.includes(cat.name.en);

    const label = document.createElement("label");
    label.appendChild(checkbox);
    const total = cat.questions.length;
    const seen = (seenQuestions[cat.name.en] || []).length;
    label.append(` ${getDisplayText(cat.name.en, cat.name.zh, cat.name.roman)} (${seen}/${total})`);

    categoryCheckboxes.appendChild(label);
  });
}

// =======================
// Initialization
// =======================
const flipSound = new Audio("flipcard.mp3");
flipSound?.addEventListener("error", () => console.warn("⚠️ Flip sound failed to load."));

window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introScreen");
  intro.classList.add("show");
  setTimeout(() => intro.remove(), 2000);

  updateToggleText(languageToggle, languageLabels, currentLanguage);
  updateToggleText(soundToggle, soundLabels, soundOn);
  updateToggleText(ttsToggle, ttsLabels, ttsSetting);
  applyTheme(currentTheme);
  populateCategoryButtons();
  setupEventListeners();
});
