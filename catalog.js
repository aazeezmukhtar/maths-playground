(() => {
  const catalog = window.LEARNING_CATALOG;
  if (!catalog || !Array.isArray(catalog.subjects)) return;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const statusLabel = status => ({
    available: "Ready to explore",
    "coming-soon": "Coming soon",
    planned: "Planned"
  }[status] || "In development");

  function createCard({ title, symbol, description, ages, status, route, meta }) {
    const card = make(route ? "a" : "article", "catalog-card" + (status === "available" ? " is-available" : " is-planned"));
    if (route) card.href = (document.body.dataset.root || "./") + route;
    const top = make("div", "catalog-card-top");
    top.append(make("span", "catalog-symbol", symbol || "✦"));
    top.append(make("span", "catalog-status status-" + (status || "planned"), statusLabel(status)));
    card.append(top);
    card.append(make("h2", "catalog-card-title", title));
    card.append(make("p", "catalog-card-description", description));
    const foot = make("div", "catalog-card-footer");
    foot.append(make("span", "catalog-age", ages ? "Ages " + ages : "All stages"));
    if (meta) foot.append(make("span", "catalog-meta", meta));
    if (route) foot.append(make("span", "catalog-arrow", "→"));
    card.append(foot);
    return card;
  }

  const subjectGrid = document.querySelector("[data-catalog-view='subjects']");
  if (subjectGrid) {
    catalog.subjects.forEach(subject => {
      subjectGrid.append(createCard({
        title: subject.title,
        symbol: subject.symbol,
        description: subject.description,
        ages: subject.ages,
        status: subject.status,
        route: subject.route || "",
        meta: Array.isArray(subject.modules) ? subject.modules.length + (subject.modules.length === 1 ? " module" : " modules") : ""
      }));
    });
  }

  const moduleGrid = document.querySelector("[data-catalog-view='mathematics']");
  if (moduleGrid) {
    const maths = catalog.subjects.find(subject => subject.id === "mathematics");
    if (maths && Array.isArray(maths.modules)) {
      maths.modules.forEach(module => moduleGrid.append(createCard({
        title: module.title,
        symbol: ({ fractions: "½", numbers: "123", geometry: "△ ○ □" })[module.id] || "✦",
        description: module.description,
        ages: module.ages,
        status: module.status,
        route: module.route,
        meta: Array.isArray(module.curriculumTags) ? module.curriculumTags.join(" · ") : ""
      })));
    }
  }

  const logicGrid = document.querySelector("[data-catalog-view='logic']");
  if (logicGrid) {
    const logic = catalog.subjects.find(subject => subject.id === "logic");
    if (logic && Array.isArray(logic.modules)) {
      logic.modules.forEach(module => logicGrid.append(createCard({
        title: module.title, symbol: "🧩", description: module.description,
        ages: module.ages, status: module.status, route: module.route,
        meta: Array.isArray(module.curriculumTags) ? module.curriculumTags.join(" · ") : ""
      })));
    }
  }
})();