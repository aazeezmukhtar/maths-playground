/* Local-only rewards and progression. Existing progress points remain untouched as XP. */
(() => {
  "use strict";
  const STORAGE_KEY = "maths-playground-gamification-v1";
  const catalogue = window.PLAYGROUND_GAMIFICATION;
  const emptyState = () => ({ version: 1, coins: 0, levels: {}, inventory: [], equipped: {}, rewardedActivities: [], rewardedQuestions: [] });
  const key = () => window.LearnerProfiles ? window.LearnerProfiles.storageKey(STORAGE_KEY) : STORAGE_KEY;
  const read = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(key()) || "null");
      if (!saved || typeof saved !== "object") return emptyState();
      return {
        ...emptyState(), ...saved,
        coins: Number.isFinite(saved.coins) && saved.coins >= 0 ? Math.floor(saved.coins) : 0,
        levels: saved.levels && typeof saved.levels === "object" ? saved.levels : {},
        inventory: Array.isArray(saved.inventory) ? [...new Set(saved.inventory.filter(id => catalogue.rewards.some(item => item.id === id)))] : [],
        equipped: saved.equipped && typeof saved.equipped === "object" ? saved.equipped : {},
        rewardedActivities: Array.isArray(saved.rewardedActivities) ? saved.rewardedActivities : [],
        rewardedQuestions: Array.isArray(saved.rewardedQuestions) ? saved.rewardedQuestions : []
      };
    } catch { return emptyState(); }
  };
  let state = read();
  const persist = () => {
    try { localStorage.setItem(key(), JSON.stringify(state)); }
    catch { return false; }
    document.dispatchEvent(new CustomEvent("gamificationchange", { detail: { state: getState() } }));
    return true;
  };
  const getState = () => JSON.parse(JSON.stringify(state));
  const levelRecord = id => state.levels[id] || { bestStars: 0, completed: false, rewarded: false, bestPercent: 0 };
  const isUnlocked = level => {
    if (!level) return false;
    if (level.number === 1) return true;
    const previous = catalogue.levels.find(item => item.number === level.number - 1);
    return Boolean(previous && levelRecord(previous.id).bestStars >= 1);
  };
  const recordLevel = (id, percent) => {
    const level = catalogue.levels.find(item => item.id === id);
    if (!level || !isUnlocked(level)) return { accepted: false, stars: 0, coinsAwarded: 0 };
    const safePercent = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
    const stars = safePercent >= 100 ? 3 : safePercent >= 80 ? 2 : safePercent >= 60 ? 1 : 0;
    const previous = levelRecord(id);
    const improved = stars > previous.bestStars;
    state.levels[id] = {
      ...previous,
      completed: previous.completed || stars > 0,
      bestStars: Math.max(previous.bestStars, stars),
      bestPercent: Math.max(previous.bestPercent || 0, safePercent),
      lastPercent: safePercent
    };
    let coinsAwarded = 0;
    if (stars > 0 && !previous.rewarded) {
      coinsAwarded = 20 + stars * 10;
      state.coins += coinsAwarded;
      state.levels[id].rewarded = true;
    }
    const saved = persist();
    return { accepted: saved, stars, bestStars: state.levels[id].bestStars, improved, coinsAwarded };
  };
  const awardQuestion = (questionId, xp = 20, coins = 5) => {
    if (state.rewardedQuestions.includes(questionId)) return false;
    state.rewardedQuestions.push(questionId);
    state.coins += Math.max(0, Math.floor(coins));
    persist();
    return true;
  };
  const resetForCurrentLearner = () => { state = emptyState(); persist(); };
  const awardActivity = (activityId, coins = 10) => {
    if (state.rewardedActivities.includes(activityId)) return 0;
    state.rewardedActivities.push(activityId);
    state.coins += Math.max(0, Math.floor(coins));
    persist();
    return Math.max(0, Math.floor(coins));
  };
  const purchase = id => {
    const item = catalogue.rewards.find(reward => reward.id === id);
    if (!item) return { ok: false, message: "That item is not available." };
    if (state.inventory.includes(id)) return { ok: false, message: "You already own this item." };
    if (state.coins < item.price) return { ok: false, message: "You need more coins for this item." };
    state.coins -= item.price;
    state.inventory.push(id);
    if (!persist()) return { ok: false, message: "Your device could not save this purchase. Check storage and try again." };
    return { ok: true, item };
  };
  const equip = id => {
    const item = catalogue.rewards.find(reward => reward.id === id);
    if (!item || !state.inventory.includes(id)) return false;
    state.equipped[item.kind] = id;
    persist();
    return true;
  };
  const renderShop = () => {
    const host = document.querySelector("#rewards-shop");
    if (!host) return;
    const active = read(); state = active;
    host.replaceChildren();
    const intro = document.createElement("div"); intro.className = "shop-heading";
    const heading = document.createElement("div");
    const title = document.createElement("h3"); title.textContent = "Rewards Shop";
    const description = document.createElement("p"); description.textContent = "Spend your learning coins on fun items. Your XP and stars are never spent.";
    heading.append(title, description);
    const balance = document.createElement("strong"); balance.className = "coin-balance"; balance.textContent = "🪙 " + state.coins + " coins"; balance.setAttribute("aria-live", "polite");
    intro.append(heading, balance); host.append(intro);
    const filter = document.createElement("div"); filter.className = "shop-filters"; filter.setAttribute("role", "group"); filter.setAttribute("aria-label", "Filter rewards");
    const grid = document.createElement("div"); grid.className = "reward-grid";
    let category = "All";
    const categories = ["All", ...new Set(catalogue.rewards.map(item => item.category))];
    const renderItems = () => {
      grid.replaceChildren();
      catalogue.rewards.filter(item => category === "All" || item.category === category).forEach(item => {
        const owned = state.inventory.includes(item.id);
        const card = document.createElement("article"); card.className = "reward-card";
        const icon = document.createElement("span"); icon.className = "reward-icon"; icon.textContent = item.icon; icon.setAttribute("aria-hidden", "true");
        const name = document.createElement("strong"); name.textContent = item.name;
        const meta = document.createElement("small"); meta.textContent = owned ? "Owned" : item.price + " coins";
        const button = document.createElement("button"); button.type = "button"; button.className = "reward-button";
        if (owned) { button.textContent = state.equipped[item.kind] === item.id ? "Equipped ✓" : "Equip"; button.addEventListener("click", () => { equip(item.id); renderItems(); renderEquipped(); }); }
        else { button.textContent = state.coins >= item.price ? "Buy item" : "Not enough coins"; button.disabled = state.coins < item.price; button.addEventListener("click", () => {
          if (!window.confirm("Buy " + item.name + " for " + item.price + " coins?")) return;
          const result = purchase(item.id);
          if (!result.ok) window.alert(result.message);
          renderShop();
        }); }
        card.append(icon, name, meta, button); grid.append(card);
      });
    };
    categories.forEach(name => {
      const button = document.createElement("button"); button.type = "button"; button.className = "shop-filter" + (name === category ? " is-active" : ""); button.textContent = name;
      button.addEventListener("click", () => { category = name; filter.querySelectorAll("button").forEach(b => b.classList.toggle("is-active", b === button)); renderItems(); });
      filter.append(button);
    });
    host.append(filter, grid); renderItems();
  };
  const renderAvatarChip = () => {
    const current = read(); state = current;
    const item = catalogue.rewards.find(reward => reward.id === current.equipped.avatar);
    document.body.dataset.playgroundBackground = current.equipped.background || "";
    document.querySelectorAll('.learner-chip-avatar').forEach(node => {
      if (item) { node.textContent = item.icon; node.classList.add('has-custom-avatar'); }
      else { node.classList.remove('has-custom-avatar'); }
      const chip = node.parentElement;
      if (!chip) return;
      chip.querySelectorAll('.learner-chip-extra').forEach(extra => extra.remove());
      ['sticker', 'outfit', 'decoration'].forEach(kind => {
        const reward = catalogue.rewards.find(entry => entry.id === current.equipped[kind]);
        if (!reward) return;
        const extra = document.createElement('span'); extra.className = 'learner-chip-extra ' + kind; extra.textContent = reward.icon; extra.title = reward.name; extra.setAttribute('aria-hidden', 'true'); chip.append(extra);
      });
    });
  };
  const renderEquipped = () => {
    const host = document.querySelector("#equipped-rewards");
    if (!host) return;
    host.replaceChildren();
    const stateNow = read(); state = stateNow;
    const line = document.createElement("p"); line.className = "equipped-summary";
    const values = Object.entries(state.equipped).map(([kind, id]) => {
      const item = catalogue.rewards.find(reward => reward.id === id);
      return item ? item.icon + " " + item.name : "";
    }).filter(Boolean);
    line.textContent = values.length ? "Your style: " + values.join(" · ") : "Choose your first reward to personalise your profile!";
    host.append(line);
  };
  const renderMap = () => {
    const host = document.querySelector("#challenge-map");
    if (!host) return;
    state = read(); host.replaceChildren();
    const heading = document.createElement("div"); heading.className = "adventure-heading";
    const copy = document.createElement("div"); const title = document.createElement("h3"); title.textContent = "Fraction Adventure";
    const subtitle = document.createElement("p"); subtitle.textContent = "Earn at least one star to unlock the next stop.";
    copy.append(title, subtitle);
    const balance = document.createElement("span"); balance.className = "coin-balance"; balance.textContent = "🪙 " + state.coins;
    heading.append(copy, balance); host.append(heading);
    const path = document.createElement("div"); path.className = "adventure-path";
    catalogue.levels.forEach(level => {
      const record = levelRecord(level.id), unlocked = isUnlocked(level);
      const card = document.createElement("button"); card.type = "button"; card.className = "adventure-level" + (!unlocked ? " is-locked" : "") + (record.bestStars ? " is-complete" : "");
      card.disabled = !unlocked;
      const number = document.createElement("span"); number.className = "adventure-number"; number.textContent = unlocked ? String(level.number) : "🔒";
      const name = document.createElement("strong"); name.textContent = level.title;
      const detail = document.createElement("small"); detail.textContent = unlocked ? level.subtitle : "Earn a star in the previous level to unlock";
      const stars = document.createElement("span"); stars.className = "adventure-stars"; stars.textContent = "★".repeat(record.bestStars) + "☆".repeat(3 - record.bestStars); stars.setAttribute("aria-label", record.bestStars + " of 3 stars");
      card.append(number, name, detail, stars);
      if (unlocked) card.addEventListener("click", () => {
        if (!document.querySelector("#challenge-card")) { location.href = "./modules/fractions/?level=" + encodeURIComponent(level.id); return; }
        document.dispatchEvent(new CustomEvent("challengelevelselected", { detail: { levelId: level.id } }));
        const challenge = document.querySelector("#challenge-card");
        if (challenge) challenge.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      path.append(card);
    });
    host.append(path);
  };
  const api = {
    getState, getLevels: () => catalogue.levels.map(level => ({ ...level })), getLevel: id => catalogue.levels.find(level => level.id === id),
    getLevelRecord: levelRecord, isUnlocked, recordLevel, awardQuestion, awardActivity, purchase, equip, renderShop, renderEquipped, renderMap, resetForCurrentLearner,
    getCoins: () => read().coins, getEquipped: () => ({ ...read().equipped })
  };
  window.PlaygroundGamification = api;
  document.addEventListener("learnerprofilechange", () => { state = read(); renderMap(); renderShop(); renderEquipped(); renderAvatarChip(); });
  document.addEventListener("gamificationchange", () => { state = read(); renderMap(); renderShop(); renderEquipped(); renderAvatarChip(); });
  document.addEventListener("DOMContentLoaded", () => { renderMap(); renderShop(); renderEquipped(); renderAvatarChip(); });
})();