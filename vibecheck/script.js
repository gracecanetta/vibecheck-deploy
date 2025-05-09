document.addEventListener("DOMContentLoaded", () => {
  let selectedMood = "";
  let moodData = [];

  const moodButtons = document.querySelectorAll(".mood-btn");
  const submitBtn = document.getElementById("submitBtn");
  const historyList = document.getElementById("historyList");
  const emptyState = document.getElementById("emptyState");
  const weeklyVibe = document.getElementById("weeklyVibe");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const modeLabel = document.getElementById("modeLabel");
  const modeEmoji = document.getElementById("modeEmoji");
  const noteInput = document.getElementById("note");
  const charCount = document.getElementById("charCount");
  
  noteInput.addEventListener("input", () => {
    charCount.textContent = `${noteInput.value.length}/45`;
  });

  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
    modeLabel.textContent = "Light Mode";
    modeEmoji.textContent = "☀️";
  }

  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
  
    const isDark = document.body.classList.contains("dark-mode");
  
    localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
  
    modeLabel.textContent = isDark ? "Light Mode" : "Dark Mode";
    modeEmoji.textContent = isDark ? "☀️" : "🌙";
  });

  // Mood button click
  moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedMood = button.textContent;
      moodButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });

  // Submit entry
  submitBtn.addEventListener("click", () => {
    const note = noteInput.value.trim();
    if (!selectedMood) {
      alert("Please select a mood.");
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entry = { mood: selectedMood, note: note, date: date };

    let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];
    moodHistory.unshift(entry);
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));

    moodData.push({ date: date, mood: selectedMood });
    addEntryToDOM(entry);
    updateWeeklyVibe();

    noteInput.value = "";
    charCount.textContent = "0/45";
    selectedMood = "";
    moodButtons.forEach((btn) => btn.classList.remove("active"));
  });

  function updateEmptyState() {
    emptyState.style.display = historyList.children.length === 0 ? "block" : "none";
  }

  function addEntryToDOM(entry) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
  <div class="entry-header">
    <div class="entry-text">
      <div><strong>${entry.mood}</strong> <small>${entry.date}</small></div>
      <div>${entry.note}</div>
    </div>
    <div class="entry-options">
      <button class="dots-btn">⋯</button>
      <div class="dropdown hidden">
       <button class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
`;
    historyList.prepend(listItem);

    const dotsBtn = listItem.querySelector(".dots-btn");
    const dropdown = listItem.querySelector(".dropdown");
    dotsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
    
      // Close any open dropdowns
      document.querySelectorAll(".dropdown").forEach(d => d.classList.add("hidden"));
    
      // Toggle this one
      dropdown.classList.toggle("hidden");
    });
    
    listItem.querySelector(".delete-btn").addEventListener("click", () => {
      listItem.remove();
      deleteFromLocalStorage(entry);
      updateEmptyState();
      updateWeeklyVibe();
    });

    updateEmptyState();
  }

  function updateWeeklyVibe() {
    const savedEntries = JSON.parse(localStorage.getItem("moodHistory")) || [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    const recentEntries = savedEntries.filter((entry) => new Date(entry.date) >= oneWeekAgo);
  
    const weeklyVibe = document.getElementById("weeklyVibe");
    const weeklyAffirmation = document.getElementById("weeklyAffirmation");
  
    if (recentEntries.length === 0) {
      weeklyVibe.textContent = "No moods logged yet 📭";
      weeklyVibe.classList.add("placeholder");
      weeklyAffirmation.textContent = "";
      return;
    }

    // Count most common mood
    const moodCounts = {};
    recentEntries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
  
    let topMood = "";
    let topCount = 0;
    for (const mood in moodCounts) {
      if (moodCounts[mood] > topCount) {
        topMood = mood;
        topCount = moodCounts[mood];
      }
    }
  
    // Affirmation messages by mood
    const affirmations = {
      "😴": "Rest is productive too. Be kind to yourself.",
      "😐": "Even neutral days are steps forward.",
      "🙂": "A calm mind is a strong mind.",
      "😁": "You're radiating good energy!",
      "🤩": "Keep chasing what lights you up.",
      "🥺": "It’s okay to feel deeply. You’re not alone.",
      "😎": "You're handling life like a pro."
    };
  
    const mostRecentMood = savedEntries[0].mood;
    weeklyVibe.classList.remove("placeholder");
    weeklyVibe.textContent = mostRecentMood;
    weeklyAffirmation.textContent = affirmations[topMood] || "You're doing your best — and that’s enough.";
  
    weeklyVibe.style.visibility = "visible";
    weeklyAffirmation.style.visibility = "visible";
  }

  function deleteFromLocalStorage(entryToDelete) {
    let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];
    moodHistory = moodHistory.filter((entry) =>
      entry.mood !== entryToDelete.mood || entry.note !== entryToDelete.note || entry.date !== entryToDelete.date
    );
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
  }

  function loadSavedEntries() {
    const savedEntries = JSON.parse(localStorage.getItem("moodHistory")) || [];
    savedEntries.reverse().forEach((entry) => {
      addEntryToDOM(entry);
      moodData.push({ date: entry.date, mood: entry.mood });
    });
    updateWeeklyVibe();
    updateEmptyState();

    const app = document.getElementById("app");
    if (app) {
      app.style.display = "block";
      requestAnimationFrame(() => {
        app.classList.add("show");
      });
    }
  }

  loadSavedEntries();

  // ⬇️ Add this just before the final closing bracket
  window.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach(d => d.classList.add("hidden"));
  });
});