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
  en: "zh",
  zh: "zh-yue",
  "zh-yue": "mute"
};

const ttsLabels = {
  mute: "🔇 TTS",
  en: "🗣️ EN",
  zh: "🗣️ 中",
  "zh-yue": "🗣️ 粤"
};


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
const categoriesGrid = document.getElementById("categoriesGrid");

const filterToggle = document.getElementById("filterToggle");
const filterPopup = document.getElementById("categoryFilterPopup");
const categoryCheckboxes = document.getElementById("categoryCheckboxes");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");

let activeCategories = JSON.parse(localStorage.getItem(FILTER_KEY)) || data.categories.map(c => c.name.en);


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

  const question = selectedCategory.questions[Math.floor(Math.random() * selectedCategory.questions.length)];

  return {
    category: getDisplayText(selectedCategory.name.en, selectedCategory.name.zh, selectedCategory.name.roman),
    question: getDisplayText(question.en, question.zh, question.roman),
    originalCategory: selectedCategory,
    originalQuestion: question
  };
}
/// Populate the category buttons based on active categories
function populateCategoryButtons() {
  categoriesGrid.innerHTML = "";

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

  const randomBtn = document.createElement("button");
  randomBtn.className = "category-btn";
  randomBtn.textContent = getDisplayText("Random", "随机", "");
  randomBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    drawAndFlip("random");
  });
  categoriesGrid.appendChild(randomBtn);
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
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = category.name.en;
    checkbox.checked = activeCategories.includes(category.name.en);
    label.appendChild(checkbox);
    label.append(` ${getDisplayText(category.name.en, category.name.zh, category.name.roman)}`);
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



// Initial setup
updateLanguageToggleText();
updateSoundToggleText();
updateTTSoggleText();

applyTheme(currentTheme);
populateCategoryButtons();

// Flipping on the card
card.addEventListener("click", () => {
  if (isSpeaking) return;
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

  utter.lang = ttsSetting === "zh-yue" ? "zh-HK" : ttsSetting;

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