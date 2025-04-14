const LANGUAGE_KEY = "language";
const DEFAULT_LANGUAGE = "en";
let currentLanguage = localStorage.getItem(LANGUAGE_KEY) ?? DEFAULT_LANGUAGE;

const SOUND_KEY = "sound";
const DEFAULT_SOUND = "on";
let soundOn = localStorage.getItem(SOUND_KEY) ?? DEFAULT_SOUND;

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

function getRandomQuestion(categoryFilter = "random") {
  const categories = data.categories;

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

function populateCategoryButtons() {
  categoriesGrid.innerHTML = "";

  data.categories.forEach(category => {
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
  questionText.textContent = question;
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
    questionText.textContent = getDisplayText(originalQuestion.en, originalQuestion.zh, originalQuestion.roman);
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

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme(currentTheme);
});

// Initial setup
updateLanguageToggleText();
soundToggle.textContent = soundLabels[soundOn];
applyTheme(currentTheme);
populateCategoryButtons();

card.addEventListener("click", () => {
  if (!lastCategory) drawQuestion("random");

  if (!card.classList.contains("flipped") && lastCategory && originalQuestion) {
    categoryName.textContent = getDisplayText(lastCategory.name.en, lastCategory.name.zh, lastCategory.name.roman);
    questionText.textContent = getDisplayText(originalQuestion.en, originalQuestion.zh, originalQuestion.roman);
  }

  playFlipSound();
  card.classList.toggle("flipped");
});
