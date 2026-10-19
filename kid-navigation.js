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