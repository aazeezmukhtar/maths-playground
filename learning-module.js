/* Renders the shared overview for any module with a matching content definition. */
(() => {
  const modules = window.LEARNING_MODULES;
  const host = document.querySelector("[data-learning-module]");
  if (!host || !modules) return;
  const moduleData = modules[host.dataset.learningModule];
  if (!moduleData) return;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const overview = make("section", "module-overview");
  overview.setAttribute("aria-labelledby", "module-overview-title");
  const heading = make("div", "module-overview-heading");
  heading.append(make("p", "eyebrow", "YOUR LEARNING PATH"));
  heading.append(make("h2", "", "What you will learn"));
  heading.append(make("p", "module-overview-copy", moduleData.overview));
  overview.append(heading);

  const goals = make("ul", "learning-goals");
  goals.setAttribute("aria-label", "Learning goals");
  moduleData.learningGoals.forEach(goal => {
    const item = make("li", "", goal);
    goals.append(item);
  });
  overview.append(goals);

  const lessonHeading = make("h3", "learning-sequence-title", "Choose your next step");
  overview.append(lessonHeading);
  const sequence = make("div", "learning-sequence");
  moduleData.lessons.forEach((lesson, index) => {
    const card = make("article", "learning-step");
    const number = make("span", "learning-step-number", String(index + 1).padStart(2, "0"));
    number.setAttribute("aria-hidden", "true");
    card.append(number);
    const content = make("div", "learning-step-content");
    content.append(make("h4", "", lesson.title));
    content.append(make("p", "", lesson.summary));
    const meta = make("p", "learning-step-meta", lesson.concepts.join(" · "));
    content.append(meta);
    card.append(content);
    const action = make("button", "learning-step-action", "Open →");
    action.type = "button";
    action.addEventListener("click", () => {
      const tab = document.querySelector('[data-panel="' + lesson.tab + '"]');
      if (tab) {
        tab.click();
        document.querySelector("#fraction-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    action.setAttribute("aria-label", "Open " + lesson.title);
    card.append(action);
    sequence.append(card);
  });
  overview.append(sequence);

  const tags = make("div", "module-curriculum-tags");
  tags.setAttribute("aria-label", "Curriculum topics");
  moduleData.curriculumTags.forEach(tag => tags.append(make("span", "", tag)));
  overview.append(tags);

  host.replaceChildren(overview);
})();