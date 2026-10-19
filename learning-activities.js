/* Reusable written-lesson, multiple-choice, and matching activity renderer. */
(() => {
  const host = document.querySelector("[data-learning-activities]");
  const library = window.LEARNING_ACTIVITIES;
  if (!host || !library) return;
  const moduleId = host.dataset.learningActivities;
  const content = library[moduleId];
  if (!content) return;

  const STORAGE_KEY = "maths-playground-learning-activities-v1";
  const storageKey = () => window.LearnerProfiles ? window.LearnerProfiles.storageKey(STORAGE_KEY) : STORAGE_KEY;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (text, className, onClick) => {
    const node = make("button", className, text);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  };
  const readProgress = () => {
    try {
      const all = JSON.parse(localStorage.getItem(storageKey()) || "{}");
      return all[moduleId] || {};
    } catch { return {}; }
  };
  const awardPoints = points => {
    if (!Number.isFinite(points) || points <= 0) return;
    try {
      const key = window.LearnerProfiles ? window.LearnerProfiles.storageKey("maths-playground-progress-v1") : "maths-playground-progress-v1";
      const progress = JSON.parse(localStorage.getItem(key) || "{}");
      progress.points = Math.max(0, Number(progress.points) || 0) + points;
      localStorage.setItem(key, JSON.stringify({
        points: 0, practiceCorrect: 0, practiceAnswered: 0,
        challengeCorrect: 0, challengeAnswered: 0, ...progress
      }));
      document.dispatchEvent(new CustomEvent("learningprogresschange"));
    } catch { /* Activity works even if local storage is unavailable. */ }
  };
  const saveResult = (activityId, result) => {
    try {
      const all = JSON.parse(localStorage.getItem(storageKey()) || "{}");
      const moduleProgress = all[moduleId] || {};
      moduleProgress[activityId] = result;
      all[moduleId] = moduleProgress;
      localStorage.setItem(storageKey(), JSON.stringify(all));
    } catch { /* Activities still work when storage is unavailable. */ }
    document.dispatchEvent(new CustomEvent("learningprogresschange"));
    renderSummary();
  };
  const getResult = id => readProgress()[id] || {};
  const sectionTitle = (eyebrow, title, description) => {
    const header = make("header", "activity-library-heading");
    header.append(make("p", "eyebrow", eyebrow), make("h2", "", title));
    if (description) header.append(make("p", "activity-library-intro", description));
    return header;
  };

  const lessonSection = make("section", "written-lessons");
  lessonSection.id = "written-lessons";
  lessonSection.append(sectionTitle("READ · UNDERSTAND · REMEMBER", "Learn the idea", "Read each short explanation, then try the activities below."));
  content.lessons.forEach((lesson, index) => {
    const article = make("article", "written-lesson");
    article.append(make("p", "written-lesson-step", "LESSON " + (index + 1)));
    article.append(make("h3", "", lesson.title));
    article.append(make("p", "written-lesson-intro", lesson.intro));
    lesson.sections.forEach(section => {
      const block = make("div", "written-lesson-block");
      block.append(make("h4", "", section.heading));
      section.paragraphs.forEach(paragraph => block.append(make("p", "", paragraph)));
      article.append(block);
    });
    const key = make("aside", "written-lesson-key");
    key.append(make("span", "", "💡"), make("p", "", lesson.keyIdea));
    article.append(key);
    lessonSection.append(article);
  });
  host.append(lessonSection);

  const activitiesSection = make("section", "reusable-activities");
  activitiesSection.id = "learning-practice";
  activitiesSection.append(sectionTitle("NOW YOU TRY", "Practice what you learned", "No account is needed. Your activity results are saved on this device when browser storage is available."));
  const activityGrid = make("div", "reusable-activity-grid");
  content.activities.forEach(activity => {
    const card = make("article", "reusable-activity-card");
    card.append(make("p", "activity-kind", activity.type === "quiz" ? "QUICK QUIZ" : "MATCHING GAME"));
    card.append(make("h3", "", activity.title));
    card.append(make("p", "activity-instructions", activity.instructions));
    const resultLine = make("p", "activity-saved-result");
    resultLine.dataset.resultFor = activity.id;
    card.append(resultLine);
    const panel = make("div", "reusable-activity-panel");
    panel.dataset.activityId = activity.id;
    if (activity.type === "quiz") renderQuiz(activity, panel);
    if (activity.type === "matching") renderMatching(activity, panel);
    card.append(panel);
    activityGrid.append(card);
  });
  activitiesSection.append(activityGrid);
  host.append(activitiesSection);

  function renderQuiz(activity, panel) {
    let index = 0;
    let selected = "";
    let checked = false;
    let score = 0;
    let correctCount = 0;
    let answered = 0;
    const prompt = make("h4", "reusable-question");
    const counter = make("p", "reusable-counter");
    const options = make("div", "reusable-options");
    options.setAttribute("role", "group");
    options.setAttribute("aria-label", activity.title + " answers");
    const feedback = make("p", "reusable-feedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    const hint = button("💡 Hint", "activity-secondary-button", () => {
      feedback.textContent = activity.questions[index].hint;
      feedback.className = "reusable-feedback is-hint";
    });
    const action = button("Check answer →", "activity-primary-button", checkAnswer);
    panel.append(counter, prompt, options, feedback, hint, action);

    function drawQuestion() {
      const question = activity.questions[index];
      selected = "";
      checked = false;
      counter.textContent = "QUESTION " + (index + 1) + " OF " + activity.questions.length;
      prompt.textContent = question.prompt;
      options.replaceChildren();
      question.options.forEach(option => {
        const choice = button(option, "reusable-option", () => {
          if (checked) return;
          selected = option;
          [...options.children].forEach(child => child.classList.toggle("is-selected", child.dataset.value === option));
          options.querySelectorAll("button").forEach(child => child.setAttribute("aria-pressed", String(child.dataset.value === option)));
        });
        choice.dataset.value = option;
        choice.setAttribute("aria-pressed", "false");
        options.append(choice);
      });
      feedback.textContent = "";
      feedback.className = "reusable-feedback";
      hint.hidden = false;
      action.hidden = false;
      action.disabled = true;
      action.textContent = "Check answer →";
    }
    function checkAnswer() {
      if (!checked) {
        if (!selected) return;
        checked = true;
        answered++;
        const question = activity.questions[index];
        const correct = selected === question.answer;
        if (correct) { score += activity.pointsPerCorrect; correctCount++; }
        feedback.textContent = (correct ? "Correct! " : "Not quite. ") + question.explanation;
        feedback.className = "reusable-feedback " + (correct ? "is-correct" : "is-try-again");
        options.querySelectorAll("button").forEach(child => {
          child.disabled = true;
          if (child.dataset.value === question.answer) child.classList.add("is-answer");
          else if (child.dataset.value === selected && !correct) child.classList.add("is-wrong");
        });
        hint.hidden = true;
        action.disabled = false;
        action.textContent = index === activity.questions.length - 1 ? "Finish quiz →" : "Next question →";
        if (index === activity.questions.length - 1) {
          if (!getResult(activity.id).complete) awardPoints(score);
          saveResult(activity.id, { complete: true, correct: correctCount, answered, points: score });
        }
      } else if (index < activity.questions.length - 1) {
        index++;
        drawQuestion();
      } else {
        counter.textContent = "QUIZ COMPLETE";
        prompt.textContent = "You scored " + correctCount + " out of " + activity.questions.length + ".";
        options.replaceChildren();
        feedback.textContent = "You earned " + score + " points in this activity. Read the explanations again whenever you need a reminder.";
        feedback.className = "reusable-feedback is-correct";
        hint.hidden = true;
        action.textContent = "Try again";
        action.onclick = null;
        action.replaceWith(button("Try again ↻", "activity-primary-button", () => {
          panel.replaceChildren();
          renderQuiz(activity, panel);
        }));
      }
    }
    drawQuestion();
  }

  function renderMatching(activity, panel) {
    const prompt = make("p", "matching-prompt", "First choose a word, then choose its meaning.");
    const board = make("div", "matching-board");
    const terms = make("div", "matching-column");
    const meanings = make("div", "matching-column");
    terms.append(make("h4", "", "Words"));
    meanings.append(make("h4", "", "Meanings"));
    const feedback = make("p", "reusable-feedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    const pairs = activity.pairs.map(pair => ({...pair, matched:false}));
    const shuffled = activity.pairs.map(pair => pair.meaning).sort(() => Math.random() - 0.5);
    let selectedTerm = "";
    let matchedCount = 0;
    const termButtons = [];
    const meaningButtons = [];
    pairs.forEach(pair => {
      const b = button(pair.term, "matching-choice", () => {
        if (pair.matched) return;
        selectedTerm = pair.term;
        termButtons.forEach(item => { item.classList.toggle("is-selected", item.dataset.value === selectedTerm); item.setAttribute("aria-pressed", String(item.dataset.value === selectedTerm)); });
        if (selectedTerm) feedback.textContent = "Now choose the matching meaning.";
      });
      b.dataset.value = pair.term;
      b.setAttribute("aria-pressed", "false");
      termButtons.push(b);
      terms.append(b);
    });
    shuffled.forEach(meaning => {
      const b = button(meaning, "matching-choice", () => {
        if (!selectedTerm) {
          feedback.textContent = "Choose a word first.";
          feedback.className = "reusable-feedback is-hint";
          return;
        }
        const pair = pairs.find(item => item.term === selectedTerm);
        if (pair && pair.meaning === meaning) {
          pair.matched = true; matchedCount++;
          const termButton = termButtons.find(item => item.dataset.value === selectedTerm);
          termButton.disabled = true; termButton.classList.remove("is-selected"); termButton.classList.add("is-matched");
          b.disabled = true; b.classList.add("is-matched");
          selectedTerm = "";
          termButtons.forEach(item => item.setAttribute("aria-pressed", "false"));
          feedback.textContent = matchedCount === pairs.length ? activity.successMessage : "That's a match! Find the next pair.";
          feedback.className = "reusable-feedback is-correct";
          if (matchedCount === pairs.length) {
            if (!getResult(activity.id).complete) awardPoints(matchedCount * 5);
            saveResult(activity.id, { complete: true, matched: matchedCount, points: matchedCount * 5 });
          }
        } else {
          feedback.textContent = "Not that one. Try another meaning.";
          feedback.className = "reusable-feedback is-try-again";
        }
      });
      b.dataset.value = meaning;
      meaningButtons.push(b);
      meanings.append(b);
    });
    board.append(terms, meanings);
    const reset = button("Start again ↻", "activity-secondary-button", () => {
      selectedTerm = ""; matchedCount = 0;
      pairs.forEach(pair => pair.matched = false);
      termButtons.forEach(item => { item.disabled = false; item.classList.remove("is-matched", "is-selected"); item.setAttribute("aria-pressed", "false"); });
      meaningButtons.forEach(item => { item.disabled = false; item.classList.remove("is-matched"); });
      feedback.textContent = ""; feedback.className = "reusable-feedback";
    });
    panel.append(prompt, board, feedback, reset);
  }

  function renderSummary() {
    const saved = readProgress();
    host.querySelectorAll("[data-result-for]").forEach(node => {
      const result = saved[node.dataset.resultFor];
      node.textContent = result && result.complete
        ? "✓ Completed · " + (result.points || 0) + " activity points"
        : "Not completed yet";
      node.classList.toggle("has-saved-result", Boolean(result && result.complete));
    });
  }
  renderSummary();
})();