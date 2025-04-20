const LANGUAGE_KEY = "language";
const DEFAULT_LANGUAGE = "en";
let currentLanguage = localStorage.getItem(LANGUAGE_KEY) ?? DEFAULT_LANGUAGE;
const FILTER_KEY = "activeCategories";

const SOUND_KEY = "sound";
const DEFAULT_SOUND = "on";
let soundOn = localStorage.getItem(SOUND_KEY) ?? DEFAULT_SOUND;

const TTS_KEY = "ttsSetting";
const DEFAULT_TTS = "mute";
let ttsSetting = localStorage.getItem(TTS_KEY) || DEFAULT_TTS;
let isSpeaking = false;
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
const RANDOM_MODE_KEY = "randomMode";
let randomMode = localStorage.getItem(RANDOM_MODE_KEY) === "true";

const THEME_KEY = "theme";
const DEFAULT_THEME = "light";
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = localStorage.getItem(THEME_KEY) || (prefersDark ? "dark" : "light");

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
randomModeToggle.textContent = randomMode ? "🎲 Random Mode: On" : "🎲 Random Mode: Off";


let activeCategories = JSON.parse(localStorage.getItem(FILTER_KEY)) || data.categories.map(c => c.name.en);
let seenQuestions = JSON.parse(localStorage.getItem("seenQuestions") || "{}");

const flipSound = new Audio("flipcard.mp3");

flipSound.addEventListener("error", () => {
  console.warn("⚠️ Flip sound failed to load.");
});

let lastCategory = null;
let originalQuestion = null;

const FLIP_BACK_DELAY = 500;

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

function getDisplayText(en, zh, roman) {
  switch (currentLanguage) {
    case "zh": return zh;
    case "en+zh": return `${en} / ${zh}`;
    case "en+zh+roman": return `${en} / ${zh} / ${roman}`;
    default: return en;
  }
}

// ✅ New helper function to return question HTML per language mode
function renderQuestionHTML(en, zh, roman) {
  let html = "";

  if (currentLanguage === "en" || currentLanguage === "en+zh" || currentLanguage === "en+zh+roman") {
    html += `<div class="line en">${en}</div>`;
  }

  if (currentLanguage === "zh" || currentLanguage === "en+zh" || currentLanguage === "en+zh+roman") {
    html += `<div class="line zh">${zh}</div>`;
  }

  if (currentLanguage === "en+zh+roman") {
    html += `<div class="line roman">${roman}</div>`;
  }

  return html;
}

function getRandomQuestion(categoryFilter = "random") {
  const categories = data.categories.filter(c => activeCategories.includes(c.name.en));

  let selectedCategory = (categoryFilter === "random")
    ? categories[Math.floor(Math.random() * categories.length)]
    : categories.find(c => {
        const { en, zh } = c.name;
        return [en, zh, `${en} / ${zh}`].includes(categoryFilter);
      });

  if (!selectedCategory) return null;

  const categoryKey = selectedCategory.name.en;
  seenQuestions[categoryKey] = seenQuestions[categoryKey] || [];

  const allQuestions = selectedCategory.questions;
  const unseenIndices = allQuestions
    .map((_, idx) => idx)
    .filter(idx => !seenQuestions[categoryKey].includes(idx));

  if (unseenIndices.length === 0) {
    // All questions have been shown, reset
    seenQuestions[categoryKey] = [];
    localStorage.setItem("seenQuestions", JSON.stringify(seenQuestions));
    return getRandomQuestion(categoryFilter); // try again after reset
  }

  const randomIdx = unseenIndices[Math.floor(Math.random() * unseenIndices.length)];
  seenQuestions[categoryKey].push(randomIdx);
  localStorage.setItem("seenQuestions", JSON.stringify(seenQuestions));

  const question = allQuestions[randomIdx];

  return {
    category: getDisplayText(selectedCategory.name.en, selectedCategory.name.zh, selectedCategory.name.roman),
    question: getDisplayText(question.en, question.zh, question.roman),
    originalCategory: selectedCategory,
    originalQuestion: question
  };
}

/// Populate the category buttons based on active categories
function populateCategoryButtons() {
  function populateRandomButton() {
    const randomBtn = document.createElement("button");
    randomBtn.className = "category-btn";
    randomBtn.textContent = getDisplayText("Random", "随机", "Suíjī");
    randomBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      drawAndFlip("random");
    });
    categoriesGrid.appendChild(randomBtn);
  }

  categoriesGrid.innerHTML = "";

  if (randomMode) {
    populateRandomButton();
    return;
  }

  data.categories.forEach(category => {
    if (!activeCategories.includes(category.name.en)) return;

    const button = document.createElement("button");
    button.textContent = getDisplayText(category.name.en, category.name.zh, category.name.roman);
    button.className = "category-btn";
    button.dataset.category = button.textContent;
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      drawAndFlip(button.textContent);
    });
    categoriesGrid.appendChild(button);
  });

  // populateRandomButton();
}


function drawQuestion(categoryFilter) {
  const { category, question, originalCategory, originalQuestion: oq } = getRandomQuestion(categoryFilter);
  lastCategory = originalCategory;
  originalQuestion = oq;
  categoryName.textContent = category;
  questionText.innerHTML = renderQuestionHTML(oq.en, oq.zh, oq.roman);

}

function playFlipSound() {
  if (soundOn === "on") {
    try {
      flipSound.currentTime = 0;
      flipSound.play().catch((err) => {
        console.warn("⚠️ Sound play error:", err);
      });
    } catch (err) {
      console.warn("⚠️ Flip sound error:", err);
    }
  }
}

function flipBack() {
  card.classList.remove("flipped");
}

function flipForward() {
  playFlipSound();
  card.classList.add("flipped");
}

function drawAndFlip(categoryFilter) {
  const showNewQuestion = () => {
    drawQuestion(categoryFilter);
    flipForward();

    if (card.classList.contains("flipped") && lastCategory && originalQuestion) {
      speakText(originalQuestion);
    }
  };

  if (card.classList.contains("flipped")) {
    card.classList.remove("flipped");
    setTimeout(showNewQuestion, FLIP_BACK_DELAY);
  } else {
    showNewQuestion();
  }
}

function updateLanguageToggleText() {
  languageToggle.textContent = languageLabels[currentLanguage] || "EN";
}

languageToggle.addEventListener("click", () => {
  currentLanguage = languageCycle[currentLanguage] || "en";
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  updateLanguageToggleText();
  populateCategoryButtons();

  if (card.classList.contains("flipped") && lastCategory && originalQuestion) {
    categoryName.textContent = getDisplayText(lastCategory.name.en, lastCategory.name.zh, lastCategory.name.roman);
    questionText.innerHTML = renderQuestionHTML(originalQuestion.en, originalQuestion.zh, originalQuestion.roman);
  }
});

soundToggle.addEventListener("click", () => {
  soundOn = soundOn === "on" ? "off" : "on";
  localStorage.setItem(SOUND_KEY, soundOn);
  soundToggle.textContent = soundLabels[soundOn];
});

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}
// Apply the theme based on the current setting
themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme(currentTheme);
});

// Filter category functionality
filterToggle.addEventListener("click", () => {
  filterPopup.classList.toggle("show");
  populateCategoryCheckboxes();
});
//  Populate the filter checkboxes with categories
function populateCategoryCheckboxes() {
  categoryCheckboxes.innerHTML = "";
  data.categories.forEach(category => {
    const enName = category.name.en;
    const zhName = category.name.zh;
    const romanName = category.name.roman;

    const total = category.questions.length;
    const seen = (seenQuestions[enName] || []).length;
    const statLabel = ` (${seen}/${total})`;

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = enName;
    checkbox.checked = activeCategories.includes(enName);

    label.appendChild(checkbox);
    label.append(` ${getDisplayText(enName, zhName, romanName)}${statLabel}`);
    categoryCheckboxes.appendChild(label);
  });
}
//
applyFiltersBtn.addEventListener("click", () => {
  const checkboxes = categoryCheckboxes.querySelectorAll("input[type='checkbox']");
  activeCategories = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  localStorage.setItem(FILTER_KEY, JSON.stringify(activeCategories)); // ✅ save to localStorage
  filterPopup.classList.remove("show");
  populateCategoryButtons();
});
// dismiss the filter popup when clicking outside of it
document.addEventListener("click", (e) => {
  const isClickInside = filterPopup.contains(e.target) || filterToggle.contains(e.target);
  if (!isClickInside) {
    filterPopup.classList.remove("show");
  }
});


randomModeToggle.addEventListener("click", () => {
  randomMode = !randomMode;
  localStorage.setItem(RANDOM_MODE_KEY, randomMode);
  randomModeToggle.textContent = randomMode ? "🎲 Random Mode: On" : "🎲 Random Mode: Off";
  populateCategoryButtons();
});


resetQuestions.addEventListener("click", () => {
  seenQuestions = {};
  localStorage.removeItem("seenQuestions");
  populateCategoryCheckboxes();
  showToast("✅ Question history has been reset!");
});
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";

  setTimeout(() => {
    toast.className = "toast"; // hide after 2.5 seconds
  }, 2500);
}

// Initial setup
updateLanguageToggleText();
updateSoundToggleText();
updateTTSoggleText();

applyTheme(currentTheme);
populateCategoryButtons();

// Flipping on the card
card.addEventListener("click", () => {
  //  if (isSpeaking) return;
  if (!lastCategory) drawQuestion("random");

  if (!card.classList.contains("flipped") && lastCategory && originalQuestion) {
    categoryName.textContent = getDisplayText(lastCategory.name.en, lastCategory.name.zh, lastCategory.name.roman);
    questionText.innerHTML = renderQuestionHTML(originalQuestion.en, originalQuestion.zh, originalQuestion.roman);
  }

  playFlipSound();
  card.classList.toggle("flipped");

  if (card.classList.contains("flipped") && lastCategory && originalQuestion) {
    speakText(originalQuestion);
  }
});
function updateSoundToggleText() {
  soundToggle.textContent = soundLabels[soundOn];
}
function updateTTSoggleText() {
  ttsToggle.textContent = ttsLabels[ttsSetting];
}
// Text-to-Speech functionality
ttsToggle.addEventListener("click", () => {
  ttsSetting = ttsCycle[ttsSetting];
  localStorage.setItem(TTS_KEY, ttsSetting);
  ttsToggle.textContent = ttsLabels[ttsSetting];
});
//  Text-to-Speech settings
function speakText(question) {
  if (ttsSetting === "mute") return;

  const utter = new SpeechSynthesisUtterance();
  utter.text =
    ttsSetting === "en"
      ? question.en
      : question.zh; // Cantonese also uses zh for now

  utter.lang = ttsSetting;

  utter.onstart = () => {
    isSpeaking = true;
  };

  utter.onend = () => {
    isSpeaking = false;
  };

  utter.onerror = () => {
    isSpeaking = false;
  };

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}