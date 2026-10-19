/* Local learner profiles for Al-Jaleel Academy Learning Playground.
   All profile data stays in this browser. This is a convenience lock, not device-level security. */
(() => {
  "use strict";
  const PROFILES_KEY = "aljaleel-learning-profiles-v1";
  const ACTIVE_KEY = "aljaleel-active-learner-v1";
  const LEGACY_PROGRESS = "maths-playground-progress-v1";
  const LEGACY_ACTIVITIES = "maths-playground-learning-activities-v1";
  const nativeGet = key => localStorage.getItem(key);
  const nativeSet = (key, value) => localStorage.setItem(key, value);
  const nativeRemove = key => localStorage.removeItem(key);
  let overlay, panel, notice, currentProfile = null;
  const attempts = Object.create(null), lockUntil = Object.create(null);
  const safeJSON = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
  const readProfiles = () => { const v = safeJSON(nativeGet(PROFILES_KEY), []); return Array.isArray(v) ? v.filter(p => p && typeof p.id === "string" && typeof p.name === "string") : []; };
  const writeProfiles = profiles => nativeSet(PROFILES_KEY, JSON.stringify(profiles));
  const activeId = () => { try { return sessionStorage.getItem(ACTIVE_KEY); } catch { return null; } };
  const profileById = id => readProfiles().find(p => p.id === id) || null;
  const profileStorageKey = key => {
    const id = activeId();
    if (!id) return key;
    if (key === LEGACY_PROGRESS) return "maths-playground-profile-" + id + "-progress-v1";
    if (key === LEGACY_ACTIVITIES) return "maths-playground-profile-" + id + "-learning-activities-v1";
    return key;
  };
  const dispatchProfileChange = () => {
    currentProfile = profileById(activeId());
    document.dispatchEvent(new CustomEvent("learnerprofilechange", { detail: { profile: currentProfile ? { id: currentProfile.id, name: currentProfile.name } : null } }));
    updateProfileChip();
  };
  const randomBytes = length => {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  };
  const deriveVerifier = async (secret, salt) => {
    if (!crypto.subtle) throw new Error("PIN protection requires HTTPS or localhost. Open the official app link and try again.");
    const encoder = new TextEncoder();
    const material = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 120000, hash: "SHA-256" }, material, 256);
    return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, "0")).join("");
  };
  const equal = (a, b) => {
    if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
    let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  };
  const makeButton = (label, cls, action) => {
    const b = document.createElement("button"); b.type = "button"; b.className = cls || "learner-button"; b.textContent = label; b.addEventListener("click", action); return b;
  };
  const makeField = (labelText, type, opts = {}) => {
    const wrap = document.createElement("label"); wrap.className = "learner-field";
    const span = document.createElement("span"); span.textContent = labelText;
    const input = document.createElement("input"); input.type = type; input.autocomplete = opts.autocomplete || "off"; input.required = opts.required !== false;
    if (opts.maxLength) input.maxLength = opts.maxLength;
    if (opts.inputMode) input.inputMode = opts.inputMode;
    if (opts.pattern) input.pattern = opts.pattern;
    if (opts.placeholder) input.placeholder = opts.placeholder;
    wrap.append(span, input); return { wrap, input };
  };
  const setNotice = msg => { if (notice) notice.textContent = msg || ""; };
  const action = (label, fn, cls) => makeButton(label, cls || "learner-button", fn);
  const showPanel = (title, subtitle = "") => {
    panel.replaceChildren();
    const h = document.createElement("h2"); h.textContent = title; panel.append(h);
    if (subtitle) { const p = document.createElement("p"); p.className = "learner-subtitle"; p.textContent = subtitle; panel.append(p); }
    notice = document.createElement("p"); notice.className = "learner-notice"; notice.setAttribute("role", "status"); notice.setAttribute("aria-live", "polite"); panel.append(notice);
    return panel;
  };
  const addBack = fn => panel.append(action("← Back", fn, "learner-text-button"));
  const addForm = fields => { const form = document.createElement("form"); form.className = "learner-form"; fields.forEach(f => form.append(f.wrap)); form.addEventListener("submit", e => e.preventDefault()); panel.append(form); return form; };
  const showOverlay = () => {
    if (overlay) { overlay.hidden = false; document.body.classList.add("learner-gate-open"); return; }
    overlay = document.createElement("div"); overlay.className = "learner-gate"; overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true"); overlay.setAttribute("aria-labelledby", "learner-gate-title");
    const card = document.createElement("section"); card.className = "learner-gate-card";
    const brand = document.createElement("p"); brand.className = "learner-brand"; brand.textContent = "✳ Al-Jaleel Academy";
    const tagline = document.createElement("p"); tagline.className = "learner-tagline"; tagline.textContent = "Learning Playground · Learn · Play · Grow";
    const hidden = document.createElement("span"); hidden.id = "learner-gate-title"; hidden.className = "learner-visually-hidden"; hidden.textContent = "Learner profile";
    panel = document.createElement("div"); panel.className = "learner-gate-panel"; card.append(brand, tagline, hidden, panel); overlay.append(card); document.body.append(overlay); document.body.classList.add("learner-gate-open");
  };
  const hideOverlay = () => { if (overlay) overlay.hidden = true; document.body.classList.remove("learner-gate-open"); };
  const initials = name => name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
  const updateProfileChip = () => {
    if (!currentProfile) return;
    document.querySelectorAll(".topbar-right").forEach(right => {
      let chip = right.querySelector(".learner-switch-button");
      if (!chip) {
        chip = makeButton("", "learner-switch-button", () => { try { sessionStorage.removeItem(ACTIVE_KEY); } catch {} currentProfile = null; showOverlay(); renderChooser(); });
        chip.setAttribute("aria-label", "Switch learner"); right.prepend(chip);
      }
      chip.replaceChildren();
      const avatar = document.createElement("span"); avatar.className = "learner-chip-avatar"; avatar.textContent = initials(currentProfile.name);
      const name = document.createElement("span"); name.className = "learner-chip-name"; name.textContent = currentProfile.name;
      const small = document.createElement("small"); small.textContent = "Switch"; chip.append(avatar, name, small); chip.title = "Switch learner profile";
    });
    const hero = document.querySelector(".hero-copy");
    if (hero && !hero.querySelector(".learner-welcome")) { const p = document.createElement("p"); p.className = "learner-welcome"; p.setAttribute("aria-live", "polite"); hero.prepend(p); }
    const greeting = document.querySelector(".learner-welcome");
    if (greeting) greeting.textContent = "Welcome back, " + currentProfile.name + "! Ready for another adventure?";
  };
  const migrateLegacyProgress = id => {
    const progress = nativeGet(LEGACY_PROGRESS), activities = nativeGet(LEGACY_ACTIVITIES);
    const pKey = "maths-playground-profile-" + id + "-progress-v1";
    const aKey = "maths-playground-profile-" + id + "-learning-activities-v1";
    if (progress && !nativeGet(pKey)) nativeSet(pKey, progress);
    if (activities && !nativeGet(aKey)) nativeSet(aKey, activities);
    // Legacy keys remain intact as a safety copy.
  };
  const enterProfile = profile => {
    try { sessionStorage.setItem(ACTIVE_KEY, profile.id); } catch {}
    currentProfile = profile; hideOverlay(); dispatchProfileChange(); window.location.reload();
  };
  const renderChooser = () => {
    showOverlay();
    const profiles = readProfiles();
    showPanel(profiles.length ? "Who's learning today?" : "Let's create your learning space", profiles.length ? "Choose your name, then enter your 4-digit PIN." : "Create a local learner profile. No online account is needed.");
    if (profiles.length) {
      const list = document.createElement("div"); list.className = "learner-profile-list";
      profiles.forEach(profile => {
        const b = makeButton("", "learner-profile-choice", () => renderPinEntry(profile));
        const avatar = document.createElement("span"); avatar.className = "learner-profile-avatar"; avatar.textContent = initials(profile.name);
        const copy = document.createElement("span"); copy.className = "learner-profile-copy";
        const name = document.createElement("strong"); name.textContent = profile.name;
        const hint = document.createElement("small"); hint.textContent = "Enter PIN to continue"; copy.append(name, hint);
        const arrow = document.createElement("span"); arrow.className = "learner-profile-arrow"; arrow.textContent = "→";
        b.append(avatar, copy, arrow); list.append(b);
      });
      panel.append(list, action("+ Add another learner", renderCreateProfile, "learner-button learner-button-primary"), action("Manage profiles", renderManageProfiles, "learner-text-button"), action("Import a backup", importBackup, "learner-text-button"));
    } else {
      panel.append(action("Create first learner profile", renderCreateProfile, "learner-button learner-button-primary"));
      if (nativeGet(LEGACY_PROGRESS) || nativeGet(LEGACY_ACTIVITIES)) { const p = document.createElement("p"); p.className = "learner-migration-note"; p.textContent = "Your existing learning progress will be copied into the first profile without deleting the original records."; panel.append(p); }
      panel.append(action("Import a backup", importBackup, "learner-text-button"));
    }
  };
  const renderCreateProfile = () => {
    showPanel("Create a learner profile", "Choose a name and a memorable 4-digit PIN. Ask a parent or teacher to keep the recovery code safe.");
    const name = makeField("Learner's name", "text", { autocomplete: "name", maxLength: 50, placeholder: "Enter your name" });
    const pin = makeField("Choose a 4-digit PIN", "password", { inputMode: "numeric", pattern: "[0-9]{4}", maxLength: 4, autocomplete: "new-password", placeholder: "••••" });
    const confirm = makeField("Confirm the PIN", "password", { inputMode: "numeric", pattern: "[0-9]{4}", maxLength: 4, autocomplete: "new-password", placeholder: "••••" });
    const form = addForm([name, pin, confirm]);
    const submit = action("Create profile →", async () => {
      const learnerName = name.input.value.trim().replace(/\s+/g, " "), value = pin.input.value;
      if (!learnerName) return setNotice("Please enter the learner's name.");
      if (!/^\d{4}$/.test(value)) return setNotice("The PIN must contain exactly 4 digits.");
      if (value !== confirm.input.value) return setNotice("The PINs do not match.");
      if (readProfiles().length >= 30) return setNotice("This device has reached the 30-profile limit.");
      submit.disabled = true;
      try {
        const id = "learner-" + randomBytes(8), pinSalt = randomBytes(16), recoveryCode = randomBytes(5).toUpperCase().match(/.{1,2}/g).join("-");
        const recoverySalt = randomBytes(16);
        const profile = { id, name: learnerName, version: 1, pinSalt, pinVerifier: await deriveVerifier(value, pinSalt), recoverySalt, recoveryVerifier: await deriveVerifier(recoveryCode, recoverySalt), createdAt: new Date().toISOString() };
        const profiles = readProfiles(), first = profiles.length === 0; profiles.push(profile); writeProfiles(profiles);
        if (first) migrateLegacyProgress(id);
        showRecoveryCode(profile, recoveryCode);
      } catch (error) { setNotice(error && error.message ? error.message : "We couldn't create the profile. Please try again."); }
      finally { submit.disabled = false; }
    }, "learner-button learner-button-primary");
    form.append(submit); panel.append(action("← Back to profiles", renderChooser, "learner-text-button"));
  };
  const showRecoveryCode = (profile, code) => {
    showPanel("Keep this recovery code safe", "A parent or teacher should write it down and keep it private. It will not be shown again.");
    const box = document.createElement("div"); box.className = "learner-recovery-code"; box.textContent = code;
    const warning = document.createElement("p"); warning.className = "learner-migration-note"; warning.textContent = "Anyone with this code can reset this learner's PIN. Store it somewhere safe, separate from the device.";
    panel.append(box, warning);
    panel.append(action("Copy recovery code", () => {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(() => setNotice("Recovery code copied. Keep it private.")).catch(() => setNotice("Please write down the code shown above."));
      else setNotice("Please write down the code shown above.");
    }, "learner-button"));
    panel.append(action("I've saved the code — continue", () => enterProfile(profile), "learner-button learner-button-primary"));
  };
  const renderPinEntry = profile => {
    showPanel("Welcome, " + profile.name + "!", "Enter your 4-digit PIN to continue.");
    const pin = makeField("4-digit PIN", "password", { inputMode: "numeric", pattern: "[0-9]{4}", maxLength: 4, autocomplete: "current-password", placeholder: "••••" });
    const form = addForm([pin]);
    const submit = action("Unlock my learning →", async () => {
      if ((lockUntil[profile.id] || 0) > Date.now()) return setNotice("Too many tries. Please wait a little and try again.");
      if (!/^\d{4}$/.test(pin.input.value)) return setNotice("Enter all 4 digits of your PIN.");
      submit.disabled = true;
      try {
        const actual = await deriveVerifier(pin.input.value, profile.pinSalt);
        if (equal(actual, profile.pinVerifier)) { attempts[profile.id] = 0; enterProfile(profile); }
        else {
          attempts[profile.id] = (attempts[profile.id] || 0) + 1;
          if (attempts[profile.id] >= 5) { lockUntil[profile.id] = Date.now() + 30000; attempts[profile.id] = 0; setNotice("Too many incorrect PINs. Please wait 30 seconds."); }
          else setNotice("That PIN isn't correct. Please try again.");
          pin.input.value = ""; pin.input.focus();
        }
      } catch (error) { setNotice(error.message || "PIN verification failed. Try again."); }
      finally { submit.disabled = false; }
    }, "learner-button learner-button-primary");
    form.append(submit);
    panel.append(action("Forgot PIN? Use recovery code", () => renderRecovery(profile), "learner-text-button"));
    addBack(renderChooser);
  };
  const renderRecovery = profile => {
    showPanel("Parent/teacher recovery", "Enter the recovery code saved when " + profile.name + "'s profile was created.");
    const recovery = makeField("Recovery code", "text", { maxLength: 32, placeholder: "AB12-CD34-EF" });
    const pin = makeField("New 4-digit PIN", "password", { inputMode: "numeric", pattern: "[0-9]{4}", maxLength: 4, autocomplete: "new-password", placeholder: "••••" });
    const confirm = makeField("Confirm new PIN", "password", { inputMode: "numeric", pattern: "[0-9]{4}", maxLength: 4, autocomplete: "new-password", placeholder: "••••" });
    const form = addForm([recovery, pin, confirm]);
    const submit = action("Reset PIN →", async () => {
      const code = recovery.input.value.trim().toUpperCase(), value = pin.input.value;
      if (!code) return setNotice("Enter the parent/teacher recovery code.");
      if (!/^\d{4}$/.test(value)) return setNotice("The new PIN must contain exactly 4 digits.");
      if (value !== confirm.input.value) return setNotice("The new PINs do not match.");
      submit.disabled = true;
      try {
        const actual = await deriveVerifier(code, profile.recoverySalt);
        if (!equal(actual, profile.recoveryVerifier)) return setNotice("That recovery code is not correct.");
        const salt = randomBytes(16), updated = { ...profile, pinSalt: salt, pinVerifier: await deriveVerifier(value, salt) };
        writeProfiles(readProfiles().map(p => p.id === profile.id ? updated : p));
        renderPinEntry(updated); setNotice("PIN updated. Enter your new PIN to continue.");
      } catch (error) { setNotice(error.message || "PIN reset failed. Please try again."); }
      finally { submit.disabled = false; }
    }, "learner-button learner-button-primary");
    form.append(submit); addBack(() => renderPinEntry(profile));
  };
  const renderManageProfiles = () => {
    showPanel("Manage learner profiles", "Rename a learner, remove a profile, or back up this device's learning data.");
    readProfiles().forEach(profile => {
      const row = document.createElement("div"); row.className = "learner-manage-row";
      const label = document.createElement("strong"); label.textContent = profile.name; row.append(label);
      row.append(action("Rename", () => renderRename(profile), "learner-small-button"));
      row.append(action("Delete", () => renderDelete(profile), "learner-small-button learner-danger-button"));
      panel.append(row);
    });
    panel.append(action("Export backup", exportBackup, "learner-button learner-button-primary"), action("Import backup", importBackup, "learner-button"));
    addBack(renderChooser);
  };
  const renderRename = profile => {
    showPanel("Rename learner", "Their learning progress will stay with this profile.");
    const name = makeField("New name", "text", { maxLength: 50 }); name.input.value = profile.name;
    const form = addForm([name]);
    form.append(action("Save name", () => {
      const value = name.input.value.trim().replace(/\s+/g, " "); if (!value) return setNotice("Enter a name.");
      writeProfiles(readProfiles().map(p => p.id === profile.id ? { ...p, name: value } : p)); dispatchProfileChange(); renderManageProfiles();
    }, "learner-button learner-button-primary"));
    addBack(renderManageProfiles);
  };
  const renderDelete = profile => {
    showPanel("Delete " + profile.name + "?", "This permanently removes the profile and its saved progress on this device. Export a backup first if you may need it.");
    panel.append(action("Yes, delete this profile", () => {
      writeProfiles(readProfiles().filter(p => p.id !== profile.id));
      nativeRemove("maths-playground-profile-" + profile.id + "-progress-v1");
      nativeRemove("maths-playground-profile-" + profile.id + "-learning-activities-v1");
      if (activeId() === profile.id) { try { sessionStorage.removeItem(ACTIVE_KEY); } catch {} currentProfile = null; }
      renderManageProfiles();
    }, "learner-button learner-danger-button"));
    addBack(renderManageProfiles);
  };
  const backupKeys = () => {
    const keys = [PROFILES_KEY, LEGACY_PROGRESS, LEGACY_ACTIVITIES];
    readProfiles().forEach(p => keys.push("maths-playground-profile-" + p.id + "-progress-v1", "maths-playground-profile-" + p.id + "-learning-activities-v1"));
    return [...new Set(keys)];
  };
  const exportBackup = () => {
    const data = { app: "Al-Jaleel Academy Learning Playground", version: 1, exportedAt: new Date().toISOString(), storage: {} };
    backupKeys().forEach(key => { const value = nativeGet(key); if (value !== null) data.storage[key] = value; });
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "al-jaleel-learning-playground-backup.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Backup exported. Keep the file private because it contains profile and learning data.");
  };
  const importBackup = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json,application/json";
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0]; if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "Al-Jaleel Academy Learning Playground" || !data.storage || typeof data.storage !== "object") throw new Error("This doesn't look like a Learning Playground backup.");
        const existing = readProfiles(), incoming = safeJSON(data.storage[PROFILES_KEY], []);
        if (!Array.isArray(incoming)) throw new Error("The backup profile data is invalid.");
        const merged = new Map(existing.map(p => [p.id, p]));
        incoming.forEach(p => { if (p && typeof p.id === "string" && typeof p.name === "string") merged.set(p.id, p); });
        if (merged.size > 30) throw new Error("This backup would exceed the 30-profile limit.");
        Object.entries(data.storage).forEach(([key, value]) => {
          if (key === PROFILES_KEY || key === LEGACY_PROGRESS || key === LEGACY_ACTIVITIES || /^maths-playground-profile-[a-zA-Z0-9-]+-(?:progress|learning-activities)-v1$/.test(key)) {
            if (typeof value === "string") nativeSet(key, value);
          }
        });
        writeProfiles([...merged.values()]); setNotice("Backup imported. Select a learner to continue."); renderChooser();
      } catch (error) { setNotice(error.message || "Could not import this backup."); }
    });
    input.click();
  };
  const mountManageShortcut = () => {
    document.querySelectorAll(".topbar-right").forEach(right => {
      if (right.querySelector(".learner-manage-shortcut")) return;
      const b = makeButton("Profiles", "learner-manage-shortcut", () => { showOverlay(); renderManageProfiles(); });
      b.setAttribute("aria-label", "Manage learner profiles"); right.append(b);
    });
  };
  const boot = () => {
    if (!document.body) return;
    showOverlay();
    const profiles = readProfiles(), id = activeId();
    if (id && profiles.some(p => p.id === id)) { currentProfile = profileById(id); hideOverlay(); dispatchProfileChange(); }
    else { try { sessionStorage.removeItem(ACTIVE_KEY); } catch {} renderChooser(); }
    mountManageShortcut();
    window.LearnerProfiles = {
      getActiveProfile: () => currentProfile ? { id: currentProfile.id, name: currentProfile.name } : null,
      storageKey: profileStorageKey,
      exportBackup,
      openProfileChooser: () => { try { sessionStorage.removeItem(ACTIVE_KEY); } catch {} currentProfile = null; renderChooser(); }
    };
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true }); else boot();
})();