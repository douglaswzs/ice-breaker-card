let currentLanguage = localStorage.getItem("language") || "en"; // Load saved language or default to 'en'

const card = document.getElementById("iceBreakerCard");
const categoryName = document.getElementById("categoryName");
const questionText = document.getElementById("questionText");
const languageToggle = document.getElementById("languageToggle");
const categoriesGrid = document.getElementById("categoriesGrid");

// Sound effect
const flipSound = new Audio("flipcard.mp3");

let lastCategory = null;
let originalQuestion = null;

function getDisplayText(en, zh) {
  if (currentLanguage === "en") return en;
  if (currentLanguage === "zh") return zh;
  return `${en} / ${zh}`;
}

function getRandomQuestion(categoryFilter = "random") {
  const categories = data.categories;

  let selectedCategory;
  if (categoryFilter !== "random") {
    selectedCategory = categories.find(c => {
      const en = c.name.en;
      const zh = c.name.zh;
      const both = `${en} / ${zh}`;
      return categoryFilter === en || categoryFilter === zh || categoryFilter === both;
    });
  } else {
    selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  }

  const question = selectedCategory.questions[Math.floor(Math.random() * selectedCategory.questions.length)];

  return {
    category: getDisplayText(selectedCategory.name.en, selectedCategory.name.zh),
    question: getDisplayText(question.en, question.zh),
    originalCategory: selectedCategory,
    originalQuestion: question
  };
}

function populateCategoryButtons() {
  categoriesGrid.innerHTML = "";

  data.categories.forEach(category => {
    const button = document.createElement("button");
    const displayName = getDisplayText(category.name.en, category.name.zh);

    button.textContent = displayName;
    button.className = "category-btn";
    button.dataset.category = displayName;

    button.addEventListener("click", (event) => {
        event.stopPropagation(); // This prevents card click from firing
        flipBackAndDraw(displayName);
      });

    categoriesGrid.appendChild(button);
  });

  // Add "Random" button
  const randomBtn = document.createElement("button");
  randomBtn.className = "category-btn";
  randomBtn.textContent = getDisplayText("Random", "随机");

  randomBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    flipBackAndDraw("random");
  });

  categoriesGrid.appendChild(randomBtn);
}

function flipBackAndDraw(categoryFilter) {
  const isFlipped = card.classList.contains("flipped");
  if (isFlipped) card.classList.remove("flipped");

  drawQuestion(categoryFilter);

  setTimeout(() => {
    playFlipSound();
    card.classList.add("flipped");
  }, 100); // Delay for flip animation
}

function drawQuestion(categoryFilter) {
  const { category, question, originalCategory, originalQuestion: oq } = getRandomQuestion(categoryFilter);
  lastCategory = originalCategory;
  originalQuestion = oq;
  categoryName.textContent = category;
  questionText.textContent = question;
}

function playFlipSound() {
  flipSound.currentTime = 0;
  flipSound.play();
}

languageToggle.addEventListener("click", () => {
  if (currentLanguage === "en") {
    currentLanguage = "zh";
    languageToggle.textContent = "中";
  } else if (currentLanguage === "zh") {
    currentLanguage = "both";
    languageToggle.textContent = "EN + 中";
  } else {
    currentLanguage = "en";
    languageToggle.textContent = "EN";
  }

  localStorage.setItem("language", currentLanguage);
  populateCategoryButtons();

  // Update card back if showing
  if (card.classList.contains("flipped") && lastCategory && originalQuestion) {
    categoryName.textContent = getDisplayText(lastCategory.name.en, lastCategory.name.zh);
    questionText.textContent = getDisplayText(originalQuestion.en, originalQuestion.zh);
  }
});

// Initial setup
languageToggle.textContent =
  currentLanguage === "en" ? "EN" :
  currentLanguage === "zh" ? "中" : "EN + 中";

populateCategoryButtons();

card.addEventListener("click", () => {
  if (!lastCategory) {
    drawQuestion("random");
  }
  if (!card.classList.contains("flipped") && lastCategory && originalQuestion) {
    // Update text before flipping forward
    categoryName.textContent = getDisplayText(lastCategory.name.en, lastCategory.name.zh);
    questionText.textContent = getDisplayText(originalQuestion.en, originalQuestion.zh);
  }

  playFlipSound();
  card.classList.toggle("flipped");
});
