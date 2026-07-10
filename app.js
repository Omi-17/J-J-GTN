// ---------------------------------------------------------------------------
// Anaplan Project Hub
// Loads all content from the /data folder so you never edit this file.
// Designed to be resilient: adding/removing items in the JSON just works,
// and a bad or empty file never crashes the whole page.
// ---------------------------------------------------------------------------

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${path} (HTTP ${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`${path} must contain a JSON array ( [ ... ] ).`);
  }
  return data;
}

// Copy helper with a small toast confirmation
async function copyText(text, buttonEl) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers / restricted contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* ignore */
    }
    ta.remove();
  }
  showToast("Copied to clipboard");
  if (buttonEl) {
    buttonEl.innerHTML = ICON_CHECK;
    buttonEl.classList.add("copied");
    setTimeout(() => {
      buttonEl.innerHTML = ICON_COPY;
      buttonEl.classList.remove("copied");
    }, 1200);
  }
}

// SVG icons (inline so there are no external dependencies)
const ICON_COPY =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const ICON_CHECK =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
}

// Render a small inline message inside a container (empty state / error)
function renderMessage(container, msg, isError) {
  const p = document.createElement("p");
  p.className = isError ? "state-msg state-error" : "state-msg";
  p.textContent = msg;
  container.appendChild(p);
}

// ---------------------------------------------------------------------------
// Section 1: Quick Links
// ---------------------------------------------------------------------------
async function renderLinks() {
  const container = document.getElementById("links-list");
  container.innerHTML = "";
  try {
    const links = await loadJSON("data/links.json");
    const valid = links.filter((l) => l && l.label && l.url);
    if (valid.length === 0) {
      renderMessage(container, "No links yet. Add some in data/links.json.");
      return;
    }
    valid.forEach((link) => {
      const a = document.createElement("a");
      a.href = link.url;
      a.textContent = link.label;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      container.appendChild(a);
    });
  } catch (err) {
    console.error(err);
    renderMessage(container, "Could not load links.json — check the file.", true);
  }
}

// ---------------------------------------------------------------------------
// Section 2: Model Details
// ---------------------------------------------------------------------------
async function renderModels() {
  const select = document.getElementById("model-select");
  const wsEl = document.getElementById("workspace-id");
  const modelEl = document.getElementById("model-id");
  const copyBtn = document.getElementById("copy-model");

  // Reset the dropdown to just the placeholder before (re)building
  select.innerHTML =
    '<option value="" disabled selected>Select a Model…</option>';
  const resetCard = () => {
    wsEl.textContent = "—";
    modelEl.textContent = "—";
    copyBtn.hidden = true;
    copyBtn.onclick = null;
  };
  resetCard();

  try {
    const models = await loadJSON("data/models.json");
    const valid = models.filter((m) => m && m.name);

    if (valid.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.disabled = true;
      opt.textContent = "No models in data/models.json";
      select.appendChild(opt);
      select.disabled = true;
      return;
    }
    select.disabled = false;

    valid.forEach((m, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = m.name;
      select.appendChild(opt);
    });

    select.onchange = () => {
      const m = valid[Number(select.value)];
      if (!m) {
        resetCard();
        return;
      }
      const ws = m.workspaceId || "—";
      const md = m.modelId || "—";
      wsEl.textContent = ws;
      modelEl.textContent = md;
      copyBtn.innerHTML = ICON_COPY;
      copyBtn.hidden = false;
      copyBtn.onclick = () =>
        copyText(`Workspace Id: ${ws}\nModel Id: ${md}`, copyBtn);
    };
  } catch (err) {
    console.error(err);
    const opt = document.createElement("option");
    opt.value = "";
    opt.disabled = true;
    opt.textContent = "Error loading models.json";
    select.appendChild(opt);
    select.disabled = true;
  }
}

// ---------------------------------------------------------------------------
// Section 3: AD Groups
// ---------------------------------------------------------------------------
async function renderADGroups() {
  const list = document.getElementById("adgroups-list");
  const copyAllBtn = document.getElementById("copy-all-groups");
  list.innerHTML = "";
  copyAllBtn.hidden = true;
  copyAllBtn.onclick = null;
  copyAllBtn.innerHTML = ICON_COPY;
  try {
    const groups = await loadJSON("data/adgroups.json");
    // Accept either ["NAME", ...] or [{ "name": "NAME" }, ...]
    const names = groups
      .map((g) => (typeof g === "string" ? g : g && g.name))
      .filter((n) => typeof n === "string" && n.trim() !== "");

    if (names.length > 0) {
      copyAllBtn.hidden = false;
      copyAllBtn.title = `Copy all ${names.length} AD groups`;
      copyAllBtn.setAttribute("aria-label", `Copy all ${names.length} AD groups`);
      copyAllBtn.onclick = () => copyText(names.join("\n"), copyAllBtn);
    }

    if (names.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-row";
      renderMessage(li, "No AD groups yet. Add some in data/adgroups.json.");
      list.appendChild(li);
      return;
    }

    names.forEach((name) => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.className = "group-name";
      span.textContent = name;

      const btn = document.createElement("button");
      btn.className = "copy-btn icon-btn";
      btn.innerHTML = ICON_COPY;
      btn.title = "Copy AD group";
      btn.setAttribute("aria-label", "Copy AD group");
      btn.onclick = () => copyText(name, btn);

      li.appendChild(span);
      li.appendChild(btn);
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    const li = document.createElement("li");
    li.className = "empty-row";
    renderMessage(li, "Could not load adgroups.json — check the file.", true);
    list.appendChild(li);
  }
}

// ---------------------------------------------------------------------------
// Boot — each section renders independently so one failure can't break others
// ---------------------------------------------------------------------------
(function init() {
  renderLinks();
  renderModels();
  renderADGroups();
})();
