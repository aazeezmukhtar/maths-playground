/* Small, direct navigation helpers for young learners. */
(() => {
  "use strict";
  const one = selector => document.querySelector(selector);
  const scrollTo = selector => one(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openTab = name => {
    const button = one('[data-panel="' + name + '"]');
    if (button) button.click();
    scrollTo("#fraction-workspace");
  };
  document.addEventListener("DOMContentLoaded", () => {
    const agePathPicker = document.querySelector("[data-age-path-picker]");
    if (agePathPicker) {
      agePathPicker.querySelectorAll("[data-age-path]").forEach(button => {
        button.addEventListener("click", () => {
          const path = button.dataset.agePath;
          document.documentElement.dataset.agePath = path;
          try { localStorage.setItem("maths-playground-age-path-v1", path); } catch (_) {}
          agePathPicker.querySelectorAll("[data-age-path]").forEach(card => card.setAttribute("aria-pressed", String(card === button)));
          const target = path === "early" ? '[data-fraction-activity="learn"]' : path === "primary" ? '[data-fraction-activity="shade"]' : '[data-fraction-activity="adventure"]';
          const activity = document.querySelector(target);
          if (activity) activity.click();
        });
      });
      try {
        const saved = localStorage.getItem("maths-playground-age-path-v1");
        if (saved) {
          document.documentElement.dataset.agePath = saved;
          agePathPicker.querySelectorAll("[data-age-path]").forEach(card => card.setAttribute("aria-pressed", String(card.dataset.agePath === saved)));
        }
      } catch (_) {}
    }
    const ageButtons = [...document.querySelectorAll("[data-module-age]")];
    const ageHint = document.querySelector("[data-module-age-hint]");
    const activityCards = [...document.querySelectorAll("[data-fraction-activity]")];
    const ageSettings = {
      early: { hint: "Start with pictures and simple steps. Try Learn with pizza or Shade the shape.", hidden: ["compare", "detective", "adventure"], first: "learn" },
      primary: { hint: "Practise what you know with matching, shading, and comparing fractions.", hidden: ["detective"], first: "shade" },
      explorer: { hint: "Ready for a challenge? Try every activity and earn adventure stars.", hidden: [], first: "adventure" }
    };
    const setModuleAge = (path, launch = false) => {
      const settings = ageSettings[path] || ageSettings.primary;
      document.documentElement.dataset.agePath = path;
      ageButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.moduleAge === path)));
      activityCards.forEach(card => {
        const hidden = settings.hidden.includes(card.dataset.fractionActivity);
        card.hidden = hidden;
      });
      if (ageHint) ageHint.textContent = settings.hint;
      try { localStorage.setItem("maths-playground-age-path-v1", path); } catch (_) {}
      if (launch) document.querySelector('[data-fraction-activity="' + settings.first + '"]')?.click();
    };
    ageButtons.forEach(button => button.addEventListener("click", () => setModuleAge(button.dataset.moduleAge)));
    let savedAgePath = "primary";
    try { savedAgePath = localStorage.getItem("maths-playground-age-path-v1") || "primary"; } catch (_) {}
    setModuleAge(savedAgePath);
    document.querySelectorAll("[data-fraction-activity]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.fractionActivity;
        const goToWorkspace = panel => {
          const tab = one('[data-panel="' + panel + '"]');
          if (tab) tab.click();
          scrollTo("#fraction-workspace");
        };
        if (action === "learn") { goToWorkspace("learn"); return; }
        if (["shade", "match", "compare", "detective"].includes(action)) {
          goToWorkspace("practice");
          const activity = one('[data-practice-mode="' + action + '"]');
          if (activity) activity.click();
          return;
        }
        if (action === "adventure") {
          const map = one("#challenge-map");
          const firstOpen = map && [...map.querySelectorAll(".adventure-level:not(.is-locked)")][0];
          if (firstOpen) firstOpen.click();
          else goToWorkspace("challenge");
          scrollTo("#challenge-card");
        }
      });
    });
    document.querySelectorAll("[data-kid-action]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.kidAction;
        if (action === "learn") openTab("learn");
        if (action === "play") {
          const map = one("#challenge-map");
          const firstOpen = map && [...map.querySelectorAll(".adventure-level:not(.is-locked)")][0];
          if (firstOpen) {
            firstOpen.click();
            if (one("#challenge-card")) scrollTo("#challenge-card");
            else scrollTo("#challenge-map");
          } else {
            openTab("challenge");
          }
        }
        if (action === "rewards") scrollTo("#rewards-shop");
      });
    });
    const params = new URLSearchParams(location.search);
    if (params.has("level") && one("#fraction-workspace")) {
      const challengeTab = one('[data-panel="challenge"]');
      if (challengeTab) challengeTab.click();
      requestAnimationFrame(() => scrollTo("#challenge-card"));
    }
    document.querySelectorAll('a[href="#rewards-shop"],a[href="#my-rewards"]').forEach(link => {
      link.addEventListener("click", () => requestAnimationFrame(() => scrollTo("#rewards-shop")));
    });
  });
})();