/* Progress summary and achievements for the home dashboard.
   Milestones are derived from profile-scoped local progress; no new account or server data is created. */
(() => {
  "use strict";
  const progressKey = "maths-playground-progress-v1";
  const activitiesKey = "maths-playground-learning-activities-v1";
  const scopedKey = key => window.LearnerProfiles ? window.LearnerProfiles.storageKey(key) : key;
  const read = key => {
    try {
      const value = JSON.parse(localStorage.getItem(scopedKey(key)) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  };
  const achievements = [
    { id: "first-step", icon: "🌱", title: "First Steps", description: "Try your first question or finish an activity.", earned: s => s.questions > 0 || s.completed > 0 },
    { id: "practice-star", icon: "⭐", title: "Practice Star", description: "Answer five practice questions correctly.", earned: s => s.practiceCorrect >= 5 },
    { id: "challenge-explorer", icon: "🧭", title: "Challenge Explorer", description: "Try five challenge questions.", earned: s => s.challenges >= 5 },
    { id: "activity-finisher", icon: "🏅", title: "Activity Finisher", description: "Complete two learning activities.", earned: s => s.completed >= 2 },
    { id: "point-collector", icon: "💛", title: "XP Collector", description: "Collect 100 experience points.", earned: s => s.points >= 100 }
  ];
  function getStats() {
    const progress = read(progressKey);
    const activities = read(activitiesKey);
    let completed = 0;
    Object.values(activities).forEach(module => {
      if (!module || typeof module !== "object") return;
      Object.values(module).forEach(result => { if (result && result.complete) completed++; });
    });
    return {
      points: Math.max(0, Number(progress.points) || 0),
      questions: Math.max(0, Number(progress.practiceAnswered) || 0),
      practiceCorrect: Math.max(0, Number(progress.practiceCorrect) || 0),
      challenges: Math.max(0, Number(progress.challengeAnswered) || 0),
      completed
    };
  }
  function render() {
    const grid = document.getElementById("achievement-grid");
    const summary = document.getElementById("progress-summary");
    if (!grid || !summary) return;
    const stats = getStats();
    const earned = achievements.filter(item => item.earned(stats)).length;
    summary.textContent = `You have ${stats.points} XP, completed ${stats.completed} learning activities, and tried ${stats.questions + stats.challenges} questions. ${earned} of ${achievements.length} achievements unlocked — keep going!`;
    grid.replaceChildren();
    achievements.forEach(item => {
      const unlocked = item.earned(stats);
      const card = document.createElement("article");
      card.className = "achievement-card" + (unlocked ? " is-earned" : "");
      card.setAttribute("aria-label", item.title + (unlocked ? ", achievement unlocked" : ", not yet unlocked"));
      const icon = document.createElement("span");
      icon.className = "achievement-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = item.icon;
      const title = document.createElement("strong");
      title.textContent = item.title;
      const description = document.createElement("p");
      description.textContent = item.description;
      const state = document.createElement("span");
      state.className = "achievement-state";
      state.textContent = unlocked ? "Unlocked ✓" : "Keep going";
      card.append(icon, title, description, state);
      grid.append(card);
    });
  }
  document.addEventListener("learningprogresschange", render);
  window.addEventListener("storage", render);
  render();
})();
