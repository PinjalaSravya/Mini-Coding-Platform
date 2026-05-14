// ── Config ──────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";

const LANG_META = {
  python:     { label: "Python 3",    file: "solution.py",   ext: "py" },
  java:       { label: "Java 17",     file: "Solution.java", ext: "java" },
  javascript: { label: "Node.js 18",  file: "solution.js",   ext: "js" },
  c:          { label: "C (GCC)",     file: "solution.c",    ext: "c" },
};

// ── State ────────────────────────────────────────────────────────────────
let state = {
  lang: "python",
  problem: PROBLEMS[0],
  running: false,
  solved: new Set(),
};

// ── DOM refs ─────────────────────────────────────────────────────────────
const $  = (id) => document.getElementById(id);
const codeEl  = $("code");
const stdinEl = $("stdin");
const outputEl = $("output");
const lineNumsEl = $("lineNums");
const statDot  = $("statDot");
const statText = $("statText");
const langStat = $("langStat");
const lineCol  = $("lineCol");
const fileLabel = $("fileLabel");
const runBtn   = $("runBtn");
const submitBtn = $("submitBtn");

// ── Problem List ──────────────────────────────────────────────────────────
function renderProblemList() {
  $("problemList").innerHTML = PROBLEMS.map((p) => {
    const solved = state.solved.has(p.id) ? "✓ " : "";
    return `<div class="problem-card${p.id === state.problem.id ? " active" : ""}" onclick="selectProblem(${p.id})">
      <div class="prob-top">
        <span class="prob-num">#${p.id}</span>
        <span class="prob-title">${solved}${p.title}</span>
        <span class="diff-badge ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
      </div>
      <div class="prob-tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    </div>`;
  }).join("");
}

function selectProblem(id) {
  state.problem = PROBLEMS.find((p) => p.id === id);
  codeEl.value = state.problem.templates[state.lang] || "";
  stdinEl.value = state.problem.testCases[0]?.input || "";
  renderProblemList();
  renderDescription();
  clearOutput();
  clearTestCases();
  updateLines();
}

function renderDescription() {
  $("probTitle").textContent = `#${state.problem.id} ${state.problem.title}`;
  $("probDesc").innerHTML = state.problem.description;
  $("probConstraints").innerHTML = state.problem.constraints
    .map((c) => `<li>${c}</li>`)
    .join("");
}

// ── Language Switching ────────────────────────────────────────────────────
function setLang(lang) {
  state.lang = lang;
  document.querySelectorAll(".lang-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.lang === lang)
  );
  fileLabel.textContent = LANG_META[lang].file;
  langStat.textContent = LANG_META[lang].label;
  codeEl.value = state.problem.templates[lang] || "";
  updateLines();
  addOutputLine("info", `// Switched to ${LANG_META[lang].label}`);
}

// ── Editor Helpers ────────────────────────────────────────────────────────
function updateLines() {
  const lines = codeEl.value.split("\n");
  const before = codeEl.value.substring(0, codeEl.selectionStart);
  const ln = before.split("\n").length;
  const col = before.split("\n").pop().length + 1;
  lineCol.textContent = `Ln ${ln}, Col ${col}`;
  lineNumsEl.innerHTML = lines
    .map((_, i) => `<div class="line-num${i + 1 === ln ? " active" : ""}">${i + 1}</div>`)
    .join("");
  lineNumsEl.scrollTop = codeEl.scrollTop;
}

function syncScroll() {
  lineNumsEl.scrollTop = codeEl.scrollTop;
}

function handleTab(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const s = codeEl.selectionStart, end = codeEl.selectionEnd;
    codeEl.value = codeEl.value.substring(0, s) + "    " + codeEl.value.substring(end);
    codeEl.selectionStart = codeEl.selectionEnd = s + 4;
    updateLines();
  }
}

// ── Output Helpers ────────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function clearOutput() {
  outputEl.innerHTML = `<div class="output-placeholder">▶ Hit Run to execute your code</div>`;
}

function addOutputLine(type, text) {
  const placeholder = outputEl.querySelector(".output-placeholder");
  if (placeholder) placeholder.remove();
  const div = document.createElement("div");
  div.className = `out-line ${type}`;
  div.innerHTML = esc(text);
  outputEl.appendChild(div);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function addDivider() {
  const div = document.createElement("div");
  div.className = "out-line divider";
  outputEl.appendChild(div);
}

// ── Test Case UI ──────────────────────────────────────────────────────────
function clearTestCases() {
  $("testCases").innerHTML = state.problem.testCases
    .map((tc, i) => `
      <div class="tc-row" id="tc-${i}">
        <div class="tc-status tc-pending" id="tc-icon-${i}">○</div>
        <span class="tc-label">Case ${i + 1}</span>
        <span class="tc-expected">→ ${esc(tc.expected)}</span>
      </div>`)
    .join("");
}

function updateTestCase(i, passed, got) {
  const row = $(`tc-${i}`);
  const icon = $(`tc-icon-${i}`);
  if (!row || !icon) return;
  icon.className = `tc-status ${passed ? "tc-pass" : "tc-fail"}`;
  icon.textContent = passed ? "✓" : "✗";
  if (!passed) {
    const gotEl = document.createElement("span");
    gotEl.className = "tc-got";
    gotEl.textContent = `got: ${got || "empty"}`;
    row.appendChild(gotEl);
  }
}

// ── Status Bar ────────────────────────────────────────────────────────────
function setStatus(s) {
  if (s === "running") {
    statDot.className = "stat-dot running";
    statText.textContent = "Running";
    runBtn.disabled = true;
    submitBtn.disabled = true;
    runBtn.classList.add("running");
  } else {
    statDot.className = "stat-dot idle";
    statText.textContent = "Idle";
    runBtn.disabled = false;
    submitBtn.disabled = false;
    runBtn.classList.remove("running");
  }
}

// ── API: Run (custom stdin) ───────────────────────────────────────────────
async function runCode() {
  if (state.running) return;
  state.running = true;
  setStatus("running");
  clearOutput();
  addOutputLine("info", "// Running with custom input...");

  try {
    const res = await fetch(`${API_BASE}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: codeEl.value,
        language: state.lang,
        stdin: stdinEl.value,
      }),
    });
    const data = await res.json();

    if (data.stdout) data.stdout.split("\n").forEach((l) => addOutputLine("stdout", l));
    if (data.stderr) data.stderr.split("\n").forEach((l) => addOutputLine("stderr", l));
    if (!data.stdout && !data.stderr) addOutputLine("muted", "// (no output)");
    if (data.time_ms !== undefined) addOutputLine("info", `// Finished in ${data.time_ms}ms`);

  } catch (err) {
    addOutputLine("stderr", "// Could not reach backend. Is Flask running on port 5000?");
    addOutputLine("info", "// Start it: python backend/app.py");
  }

  state.running = false;
  setStatus("idle");
}

// ── API: Submit (test cases) ──────────────────────────────────────────────
async function submitCode() {
  if (state.running) return;
  state.running = true;
  setStatus("running");
  clearOutput();
  clearTestCases();
  addOutputLine("info", `// Submitting: ${state.problem.title}`);

  try {
    const res = await fetch(`${API_BASE}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: codeEl.value,
        language: state.lang,
        problem_id: state.problem.id,
      }),
    });
    const data = await res.json();

    data.results.forEach((r, i) => {
      updateTestCase(i, r.passed, r.got);
      addOutputLine(
        r.passed ? "success" : "fail",
        `Case ${r.case}: ${r.passed ? "PASSED ✓" : `FAILED ✗  (expected: ${r.expected}, got: ${r.got || "empty"})`}${r.time_ms ? ` [${r.time_ms}ms]` : ""}`
      );
      if (r.stderr) addOutputLine("stderr", `  stderr: ${r.stderr}`);
    });

    addDivider();
    addOutputLine(
      data.all_passed ? "success" : "fail",
      data.all_passed
        ? `✓ All ${data.total} test cases passed! Problem solved.`
        : `${data.passed} / ${data.total} test cases passed`
    );

    if (data.all_passed) state.solved.add(state.problem.id);
    renderProblemList();

  } catch (err) {
    addOutputLine("stderr", "// Could not reach backend. Is Flask running on port 5000?");
  }

  state.running = false;
  setStatus("idle");
}

// ── Init ──────────────────────────────────────────────────────────────────
codeEl.addEventListener("click",  updateLines);
codeEl.addEventListener("keyup",  updateLines);
codeEl.addEventListener("scroll", syncScroll);
codeEl.addEventListener("keydown", handleTab);

renderProblemList();
renderDescription();
clearTestCases();
codeEl.value = state.problem.templates[state.lang];
stdinEl.value = state.problem.testCases[0]?.input || "";
updateLines();
