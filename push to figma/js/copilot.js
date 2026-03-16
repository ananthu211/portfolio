/* ================================================================
   COPILOT PAGE — Full-page portfolio AI interface
================================================================ */

'use strict';

/* ── Utils ──────────────────────────────────────────────────── */
const qs  = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
function lerp(a, b, t) { return a + (b - a) * t; }

/* ── Cursor ──────────────────────────────────────────────────── */
const cMouse = { x: -200, y: -200, rx: -200, ry: -200 };
let cRing, cDot;

function setupCursor() {
  cRing = qs('#coCursorRing');
  cDot  = qs('#coCursorDot');
  if (!cRing) return;
  document.addEventListener('mousemove', e => {
    cMouse.x = e.clientX;
    cMouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => { cMouse.x = -200; cMouse.y = -200; });
  requestAnimationFrame(tickCursor);
}

function tickCursor() {
  cMouse.rx = lerp(cMouse.rx, cMouse.x, 0.14);
  cMouse.ry = lerp(cMouse.ry, cMouse.y, 0.14);
  if (cRing) cRing.style.transform = `translate(${cMouse.rx}px,${cMouse.ry}px) translate(-50%,-50%)`;
  if (cDot)  cDot.style.transform  = `translate(${cMouse.x}px,${cMouse.y}px) translate(-50%,-50%)`;
  requestAnimationFrame(tickCursor);
}

/* ── Local knowledge base ────────────────────────────────────── */
const LOCAL_RESPONSES = [
  {
    id: 'work',
    match: /work|project|portfolio|case stud|what.*built|show me|built/i,
    message: "Two enterprise products shipped at Prevalent AI. Both tackle the hardest problem in security UX — making complex, interconnected data feel usable to humans under pressure.",
    canvas: null,
    projectCards: true,
    chips: ["Tell me about Exposure Management", "Tell me about Navigator AI", "What's his design process?"],
    thread: "His projects",
  },
  {
    id: 'p1',
    match: /exposure|ccm|asm|security platform|attack surface|knowledge graph/i,
    message: "Exposure Management unified fragmented security tools around a shared Knowledge Graph. The core insight: analysts don't have a data problem — they have a context problem. Everything else followed from that.",
    canvas: 'p1',
    chips: ["Tell me about Navigator AI", "What's his design process?", "What makes him different?"],
    thread: "Exposure Management",
  },
  {
    id: 'p2',
    match: /navigator|ai assistant|natural language|llm|ai product/i,
    message: "Navigator layers an AI engine on the Exposure Management platform. The defining design decision: no autonomous actions. In high-stakes security, wrong automation is worse than a slow human — trust has to be earned first.",
    canvas: 'p2',
    chips: ["Try the Navigator demo", "Tell me about Exposure Management", "What's his design process?"],
    thread: "Navigator AI",
  },
  {
    id: 'nav_demo',
    match: /demo|try navigator|see it|show.*live|interact|running/i,
    message: "Here it is — Navigator running. This is the actual interface Ananthu designed for Prevalent AI. The UX patterns you see (explainability, source tags, guided queries) are deliberate design decisions, not defaults.",
    canvas: 'nav_demo',
    chips: ["Tell me about Navigator AI", "Show me his projects", "What makes him different?"],
    thread: "Navigator — Live demo",
  },
  {
    id: 'process',
    match: /process|how.*design|approach|workflow|method|research/i,
    message: "Research first. Always. He maps the entire system — data flows, user mental models, failure modes — before picking up Figma. Then progressive disclosure all the way down. Complexity is inevitable; confusion isn't.",
    canvas: 'process',
    chips: ["Show me his projects", "What makes him different?"],
    thread: "Design process",
  },
  {
    id: 'background',
    match: /company|prevalent|experience|background|career|history|years/i,
    message: "4+ years at Prevalent AI as Lead UX. Before that: Staff UX at Tuna Software, Jr. UX at Crypt4Bits. The through-line is always enterprise complexity — making dense, data-heavy systems actually usable.",
    canvas: null,
    chips: ["Show me his projects", "Is he available?"],
    thread: "Background",
  },
  {
    id: 'available',
    match: /availab|hire|open|opportunit|looking|recruit/i,
    message: "Currently leading UX at Prevalent AI. But the right problem has a way of getting his attention. Reach him through the contact section — he's thoughtful with responses, not fast with them.",
    canvas: null,
    chips: ["Show me his projects", "Download his resume"],
    thread: "Availability",
  },
  {
    id: 'resume',
    match: /resume|cv|download/i,
    message: "His resume is still being refined — occupational hazard of being a designer. Reach out directly for the latest version.",
    canvas: null,
    resumeCard: true,
    chips: ["Show me his projects", "Is he available?"],
    thread: "Resume",
  },
  {
    id: 'different',
    match: /different|unique|stand out|special|why him|what.*makes|skill|tool|figma/i,
    message: "He sits at the intersection of AI systems and enterprise security — a niche most designers haven't touched. He thinks in systems first, screens second, and has shipped real products in genuinely complex domains.",
    canvas: 'skills',
    chips: ["Show me his projects", "What's his design process?"],
    thread: "What makes him different",
  },
  {
    id: 'contact',
    match: /contact|reach|email|connect|talk|meet/i,
    message: "The contact section on the portfolio is the best place to start. He's responsive to interesting conversations — not cold outreach.",
    canvas: null,
    chips: ["Show me his projects", "Is he available?"],
    thread: "Contact",
  },
  {
    id: 'constrain_ai',
    match: /constrain|why.*limit|no.*autonom|restrict.*ai|scope.*ai/i,
    message: "Because trust is earned, not assumed. In security, a wrong automated action — blocking a legitimate user, misflagging a control — costs more than a slow human decision. Navigator explains first, acts never. Autonomy comes after trust is established, not before.",
    canvas: 'p2',
    chips: ["Try the Navigator demo", "Tell me about Exposure Management", "What's his design process?"],
    thread: "AI constraints",
  },
  {
    id: 'trust_design',
    match: /trust|explainab|transparent|source|how.*ai.*work|black.?box/i,
    message: "Every Navigator response shows exactly where the answer came from — which asset, which control, which graph relationship. No black-box summaries. Users can interrogate any response. That's not a feature, it's the foundation.",
    canvas: 'p2',
    chips: ["Try the Navigator demo", "Tell me about Navigator AI", "Show me his projects"],
    thread: "Trust in AI design",
  },
  {
    id: 'challenge',
    match: /hard|challeng|difficult|problem|obstacle|tough|biggest/i,
    message: "The hardest part wasn't the interface — it was managing three competing forces simultaneously: existing users needed familiarity, sales needed visible differentiation, and engineering had evolving data pipelines. Every design decision was a negotiation between those three, not an optimization for any one of them.",
    canvas: 'p1',
    chips: ["Tell me about Exposure Management", "Tell me about Navigator AI", "What's his design process?"],
    thread: "Design challenges",
  },
  {
    id: 'users',
    match: /target.*user|who.*use|audience|persona|analyst|ciso|soc/i,
    message: "Two distinct types. CISOs need an executive narrative — what's our exposure, why does it matter, what do I tell the board. SOC analysts need speed — find the thing, understand the context, act. The same platform, two completely different mental models. Both had to work.",
    canvas: null,
    chips: ["Tell me about Exposure Management", "Tell me about Navigator AI", "Show me his projects"],
    thread: "Target users",
  },
  {
    id: 'graph_complexity',
    match: /graph|node|relationship|knowledge graph/i,
    message: "By hiding it until it's needed. The knowledge graph is the engine under the hood — it powers everything — but analysts never see a raw graph view. Relationships surface only when they directly support what the user is trying to do. Complexity is always there; confusion doesn't have to be.",
    canvas: 'p1',
    chips: ["Tell me about Exposure Management", "Tell me about Navigator AI", "What's his design process?"],
    thread: "Graph complexity",
  },
];

const FALLBACK = {
  message: "That's outside my knowledge base — I only know what Ananthu has shared. Try asking about his projects, design process, what makes him different, or whether he's available.",
  canvas: null,
  chips: ["Show me his projects", "What's his design process?", "Is he available?"],
  thread: null,
};

/* ── Canvas data ─────────────────────────────────────────────── */
const CANVAS_DATA = {
  p1: {
    eyebrow: 'Case Study · 01',
    title: 'Exposure Management Platform',
    role: 'Lead UX Designer · Prevalent AI',
    timeline: 'Dec 2024 – Jan 2025 · 8 weeks',
    tags: ['Enterprise UX', 'Cybersecurity', 'Data Visualization', 'Knowledge Graph'],
    overview: 'Evolved an isolated cybersecurity dashboard into a comprehensive Exposure Management platform — shifting analysts from siloed risk assessments to a connected, knowledge-graph-powered view of their entire attack surface.',
    metrics: [
      { val: '8 wks',   key: 'Timeline' },
      { val: '2',       key: 'User types' },
      { val: '3',       key: 'Core flows' },
      { val: '4',       key: 'Design pillars' },
    ],
    pillars: [
      { num: '01', title: 'Connected Exposure Context', desc: 'Knowledge graph as the shared foundation — CCM and ASM built on top, creating a unified view of exposure rather than separate tools.' },
      { num: '02', title: 'Continuous Visibility',      desc: 'Real-time exposure scores with trend data — not a periodic snapshot but a living picture of risk that updates with the environment.' },
      { num: '03', title: 'Action-Oriented Views',      desc: 'Every insight surfaces a clear next step — from CISO-level dashboards down to analyst investigation flows.' },
    ],
    decisions: [
      'Progressive disclosure of graph relationships — complexity revealed only on demand, never upfront',
      'Preserved familiar CCM and ASM entry points to eliminate relearning cost during migration',
      'Non-color-based severity signaling — icons and labels alongside color for full accessibility',
      'Sequenced investigation flows to guide analysts without overwhelming them',
    ],
    chips: ["Tell me about Navigator AI", "What's his design process?", "What makes him different?"],
  },
  p2: {
    eyebrow: 'Case Study · 02',
    title: 'Navigator AI Assistant',
    role: 'Lead UX Designer · Prevalent AI',
    timeline: 'Sep – Oct 2025 · 6 weeks',
    tags: ['AI/UX', 'Conversational Design', 'Cybersecurity', 'Mobile'],
    overview: 'An AI engine layered directly on the Exposure Management platform — letting CISOs and analysts query complex exposure data through natural language, grounded in the Knowledge Graph and deliberately constrained to what\'s actually known.',
    metrics: [
      { val: '6 wks', key: 'Timeline' },
      { val: '2',     key: 'User types' },
      { val: '3',     key: 'Design principles' },
      { val: '0',     key: 'Autonomous actions (by design)' },
    ],
    trustSpectrum: true,
    pillars: [
      { num: '01', title: 'Explainability by Default', desc: 'Every AI response surfaces its sources. No black-box summaries — users can always interrogate the reasoning behind an answer.' },
      { num: '02', title: 'Guided, Not Free-Form',    desc: 'Structured interaction patterns over open chat. In high-stakes security environments, unbounded input creates confusion, not clarity.' },
      { num: '03', title: 'Trust Above Automation',   desc: 'Deliberately no autonomous actions. A wrong automated response in security is worse than a slow human decision.' },
    ],
    decisions: [
      'Scoped strictly to platform data — prevents hallucinated security context that could mislead analysts',
      'Context-aware responses: the AI knows which dashboard the user is on',
      'No autonomous actions shipped — explainability first, autonomy when trust is established',
      'Designed for two distinct mental models: executive narrative (CISO) vs. fast investigation (SOC analyst)',
    ],
    chips: ["Try the Navigator demo", "Tell me about Exposure Management", "What's his design process?"],
    demoChip: true,
  },
};

/* ── Navigator demo data ─────────────────────────────────────── */
const NAV_QUERIES = [
  {
    label: "Finance BU findings",
    query: "What are the critical findings affecting the Finance BU right now?",
    response: {
      text: "There are <strong>3 critical findings</strong> linked to Finance BU assets. The highest-priority is an unpatched RCE vulnerability on <code>api.gateway</code>, connected to 2 compliance controls currently failing in PCI-DSS.",
      sources: ["ASM · api.gateway", "CCM · PCI-DSS 6.3", "Graph · Finance BU"],
      confidence: "High — 3 sources corroborated",
    },
  },
  {
    label: "Cloud exposure",
    query: "How exposed is our cloud infrastructure?",
    response: {
      text: "Cloud exposure score is <strong>74/100</strong> (Critical). 12 assets have unresolved CVEs, 4 are internet-facing with no WAF. The S3 bucket <code>prod-data-lake</code> has public read access — flagged as highest priority.",
      sources: ["ASM · Cloud Assets", "CCM · CIS AWS v1.4", "Graph · Cloud BU"],
      confidence: "High — real-time scan data",
    },
  },
  {
    label: "Remediation due this week",
    query: "Summarise what's due for remediation this week",
    response: {
      text: "7 items are due this week. 2 are overdue: <code>api.gateway</code> (RCE, 3 days late) and a stale service account in Identity. The remaining 5 are medium severity across Compliance and ASM.",
      sources: ["CCM · Remediation Queue", "ASM · Service Accounts", "Graph · Compliance"],
      confidence: "High — synced with ticketing",
    },
  },
];

/* ── State ────────────────────────────────────────────────────── */
let firstMsg  = false;
let isLoading = false;
let canvasKey = null;
let threads   = [];

/* ── DOM refs ─────────────────────────────────────────────────── */
let msgArea, welcome, inputEl, sendBtn, newBtn;
let layout, canvas, canvasLabel, canvasBody, canvasClose;
let threadsList;

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  msgArea     = qs('#coMessages');
  welcome     = qs('#coWelcome');
  inputEl     = qs('#coInput');
  sendBtn     = qs('#coSend');
  newBtn      = qs('#coNewBtn');
  layout      = qs('#coLayout');
  canvas      = qs('#coCanvas');
  canvasLabel = qs('#coCanvasLabel');
  canvasBody  = qs('#coCanvasBody');
  canvasClose = qs('#coCanvasClose');
  threadsList = qs('#coThreads');

  setupCursor();

  /* Send */
  sendBtn.addEventListener('click', () => sendMsg());
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  });

  /* Auto-grow textarea */
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
  });

  /* Starter cards */
  qsa('.co-starter').forEach(btn =>
    btn.addEventListener('click', () => sendMsg(btn.dataset.q))
  );

  /* Canvas close */
  canvasClose.addEventListener('click', closeCanvas);

  /* New chat */
  newBtn.addEventListener('click', resetChat);

  /* Cursor link states */
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a,button,[data-q],.co-proj-card,.co-chip,.cvs-chip,.co-starter,.nav-demo-q');
    if (cRing) cRing.classList.toggle('is-link', !!el);
  });
});

/* ── Local respond ────────────────────────────────────────────── */
function localRespond(text) {
  for (const r of LOCAL_RESPONSES) {
    if (r.match.test(text)) return r;
  }
  return FALLBACK;
}

/* ── Send ─────────────────────────────────────────────────────── */
function sendMsg(forced) {
  if (isLoading) return;
  const text = (forced || inputEl.value).trim();
  if (!text) return;

  isLoading = true;
  inputEl.value = '';
  inputEl.style.height = 'auto';

  if (!firstMsg) activateChat();

  appendUserMsg(text);
  const typingEl = appendTyping();
  scrollToBottom();

  const delay = 600 + Math.random() * 300;
  setTimeout(() => {
    typingEl.remove();
    const resp = localRespond(text);
    if (resp.thread) addThread(resp.thread);
    appendAiMsg(resp);
    if (resp.canvas) openCanvas(resp.canvas);
    scrollToBottom();
    isLoading = false;
  }, delay);
}

/* ── DOM helpers ──────────────────────────────────────────────── */
function activateChat() {
  firstMsg = true;
  welcome.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  welcome.style.opacity = '0';
  welcome.style.transform = 'translateY(-12px)';
  setTimeout(() => { welcome.remove(); }, 320);
  /* Create inner wrapper for messages */
  const inner = document.createElement('div');
  inner.className = 'co-messages-inner';
  inner.id = 'coMsgInner';
  msgArea.appendChild(inner);
}

function getMsgInner() {
  return qs('#coMsgInner') || msgArea;
}

function appendUserMsg(text) {
  const wrap = document.createElement('div');
  wrap.className = 'co-msg co-msg--user';
  wrap.innerHTML = `
    <div class="co-msg-row">
      <div class="co-bubble co-bubble--user">${escHtml(text)}</div>
    </div>`;
  getMsgInner().appendChild(wrap);
}

function appendTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'co-typing';
  wrap.innerHTML = `
    <div class="co-msg-av">✦</div>
    <div class="co-typing-dots">
      <span></span><span></span><span></span>
    </div>`;
  getMsgInner().appendChild(wrap);
  return wrap;
}

function appendAiMsg(resp) {
  const wrap = document.createElement('div');
  wrap.className = 'co-msg co-msg--ai';

  let html = `
    <div class="co-msg-row">
      <div class="co-msg-av">✦</div>
      <div class="co-bubble co-bubble--ai">${escHtml(resp.message)}</div>
    </div>`;

  /* Project cards */
  if (resp.projectCards) {
    html += `
    <div class="co-proj-cards">
      <button class="co-proj-card" data-canvas="p1">
        <span class="co-pcard-num">01</span>
        <div class="co-pcard-info">
          <span class="co-pcard-title">Exposure Management Platform</span>
          <span class="co-pcard-tags">Enterprise UX · Cybersecurity · Knowledge Graph</span>
        </div>
        <span class="co-pcard-arrow">Open in canvas →</span>
      </button>
      <button class="co-proj-card" data-canvas="p2">
        <span class="co-pcard-num">02</span>
        <div class="co-pcard-info">
          <span class="co-pcard-title">Navigator AI Assistant</span>
          <span class="co-pcard-tags">AI/UX · Conversational Design · Cybersecurity</span>
        </div>
        <span class="co-pcard-arrow">Open in canvas →</span>
      </button>
    </div>`;
  }

  /* Resume card */
  if (resp.resumeCard) {
    html += `
    <div class="co-attachment">
      <div class="co-att-icon">PDF</div>
      <div>
        <span class="co-att-name">Ananthu_S_Resume.pdf</span>
        <span class="co-att-meta">Contact him directly for latest version</span>
      </div>
    </div>`;
  }

  /* Canvas open prompt */
  if (resp.canvas) {
    const label = resp.canvas === 'nav_demo' ? 'Navigator — live demo'
                : resp.canvas === 'p1'       ? 'Exposure Management — case study'
                : resp.canvas === 'p2'       ? 'Navigator — case study'
                : resp.canvas === 'process'  ? 'Design process'
                : resp.canvas === 'skills'   ? 'Skills & tools'
                : 'View in canvas';
    html += `
    <button class="co-canvas-prompt" data-canvas="${resp.canvas}">
      <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
        <rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/>
        <rect x="7" y="1" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/>
        <rect x="1" y="7" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/>
        <rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/>
      </svg>
      ${escHtml(label)}
    </button>`;
  }

  /* Follow-up chips */
  if (resp.chips?.length) {
    html += `<div class="co-chips">${
      resp.chips.map(c => `<button class="co-chip" data-q="${escAttr(c)}">${escHtml(c)}</button>`).join('')
    }</div>`;
  }

  wrap.innerHTML = html;

  /* Wire interactive bits */
  qsa('.co-proj-card', wrap).forEach(card =>
    card.addEventListener('click', () => openCanvas(card.dataset.canvas))
  );
  qsa('.co-chip', wrap).forEach(chip =>
    chip.addEventListener('click', () => sendMsg(chip.dataset.q))
  );
  qsa('.co-canvas-prompt', wrap).forEach(btn =>
    btn.addEventListener('click', () => openCanvas(btn.dataset.canvas))
  );

  getMsgInner().appendChild(wrap);
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    msgArea.scrollTop = msgArea.scrollHeight;
  });
}

/* ── Canvas ───────────────────────────────────────────────────── */
function openCanvas(key) {
  canvasKey = key;
  canvasBody.innerHTML = '';

  const labels = {
    p1: 'Case Study · Exposure Management',
    p2: 'Case Study · Navigator AI',
    nav_demo: 'Live Demo · Navigator',
    process: 'Design Process',
    skills: 'Skills & Tools',
  };
  canvasLabel.textContent = labels[key] || 'Canvas';

  /* Render content */
  switch (key) {
    case 'p1':       renderProjectCanvas('p1'); break;
    case 'p2':       renderProjectCanvas('p2'); break;
    case 'nav_demo': renderNavDemo(); break;
    case 'process':  renderProcessCanvas(); break;
    case 'skills':   renderSkillsCanvas(); break;
  }

  layout.classList.add('canvas-open');

  /* Animate skill bars after layout settles */
  if (key === 'skills') {
    setTimeout(animateSkillBars, 400);
  }
}

function closeCanvas() {
  layout.classList.remove('canvas-open');
  setTimeout(() => { canvasBody.innerHTML = ''; canvasKey = null; }, 380);
}

/* ── Render: Project case study ───────────────────────────────── */
function renderProjectCanvas(key) {
  const d = CANVAS_DATA[key];

  let html = `
  <div class="cvs-project">
    <div class="cvs-eyebrow">${escHtml(d.eyebrow)}</div>
    <div class="cvs-title">${escHtml(d.title)}</div>
    <div class="cvs-role">${escHtml(d.role)} · ${escHtml(d.timeline)}</div>
    <div class="cvs-tags">${d.tags.map(t => `<span class="cvs-tag">${escHtml(t)}</span>`).join('')}</div>

    <div class="cvs-section-label">Overview</div>
    <div class="cvs-overview">${escHtml(d.overview)}</div>

    <div class="cvs-section-label">By the numbers</div>
    <div class="cvs-metrics">
      ${d.metrics.map(m => `
        <div class="cvs-metric">
          <span class="cvs-metric-val">${escHtml(m.val)}</span>
          <span class="cvs-metric-key">${escHtml(m.key)}</span>
        </div>`).join('')}
    </div>`;

  /* Trust spectrum for p2 */
  if (d.trustSpectrum) {
    html += `
    <div class="cvs-section-label">AI trust spectrum</div>
    <div class="cvs-trust-spectrum">
      <div class="cvs-trust-title">Where Navigator sits — deliberately</div>
      <div class="cvs-spectrum-track">
        <div class="cvs-spectrum-fill"></div>
      </div>
      <div class="cvs-spectrum-nodes">
        <div class="cvs-snode">
          <div class="cvs-snode-dot"></div>
          <div class="cvs-snode-label">Inform</div>
        </div>
        <div class="cvs-snode active">
          <div class="cvs-snode-dot"></div>
          <div class="cvs-snode-label">Explain</div>
          <div class="cvs-snode-badge">Current</div>
        </div>
        <div class="cvs-snode">
          <div class="cvs-snode-dot"></div>
          <div class="cvs-snode-label">Suggest</div>
        </div>
        <div class="cvs-snode">
          <div class="cvs-snode-dot"></div>
          <div class="cvs-snode-label">Automate</div>
        </div>
      </div>
    </div>`;
  }

  html += `
    <div class="cvs-section-label">Design pillars</div>
    <div class="cvs-pillars">
      ${d.pillars.map(p => `
        <div class="cvs-pillar">
          <div class="cvs-pillar-num">${escHtml(p.num)}</div>
          <div class="cvs-pillar-title">${escHtml(p.title)}</div>
          <div class="cvs-pillar-desc">${escHtml(p.desc)}</div>
        </div>`).join('')}
    </div>

    <div class="cvs-section-label">Key design decisions</div>
    <div class="cvs-decisions">
      ${d.decisions.map(dec => `<div class="cvs-decision">${escHtml(dec)}</div>`).join('')}
    </div>

    <div class="cvs-chips">
      ${d.chips.map(c => `<button class="cvs-chip" data-q="${escAttr(c)}">${escHtml(c)}</button>`).join('')}
      ${d.demoChip ? `<button class="cvs-chip" data-canvas="nav_demo" style="color:var(--accent);border-color:rgba(232,213,176,0.2)">Try the Navigator demo →</button>` : ''}
    </div>
  </div>`;

  canvasBody.innerHTML = html;

  qsa('.cvs-chip', canvasBody).forEach(chip => {
    if (chip.dataset.canvas) {
      chip.addEventListener('click', () => openCanvas(chip.dataset.canvas));
    } else {
      chip.addEventListener('click', () => { sendMsg(chip.dataset.q); });
    }
  });
}

/* ── Render: Navigator demo ───────────────────────────────────── */
function renderNavDemo() {
  canvasBody.innerHTML = `
  <div class="cvs-nav-demo">
    <div class="nav-demo-chrome">

      <div class="nav-demo-bar">
        <div class="nav-demo-dot"></div>
        <div class="nav-demo-dot"></div>
        <div class="nav-demo-dot"></div>
        <span class="nav-demo-url">prevalent.ai / navigator</span>
      </div>

      <div class="nav-ctx-bar">
        <div class="nav-ctx-left">
          <span class="nav-ctx-icon">✦</span>
          <span>Navigator</span>
          <span class="nav-ctx-sep">·</span>
          <span class="nav-ctx-dim">Scoped to platform data only</span>
        </div>
        <div class="nav-kg-badge">Knowledge Graph</div>
      </div>

      <div class="nav-demo-queries" id="navDemoQueries">
        ${NAV_QUERIES.map((q, i) =>
          `<button class="nav-demo-q" data-idx="${i}">${escHtml(q.label)}</button>`
        ).join('')}
      </div>

      <div class="nav-chat" id="navChat">
        <div class="nav-empty" id="navEmpty">
          <div class="nav-empty-icon">✦</div>
          <div class="nav-empty-text">Select a query above<br>or type below to start</div>
        </div>
      </div>

      <div class="nav-input-row">
        <input class="nav-input" id="navInput" type="text" placeholder="Ask about your exposure data…" autocomplete="off" />
        <button class="nav-send-btn" id="navSendBtn">↑</button>
      </div>

    </div>

    <div class="nav-demo-note">
      <div class="nav-demo-note-dot"></div>
      <span>This is the actual interface Ananthu designed — running on pre-loaded demo data. Source tags, explainability, and guided queries are deliberate design choices.</span>
    </div>
  </div>`;

  /* Wire Navigator demo interactions */
  const navChat    = qs('#navChat');
  const navEmpty   = qs('#navEmpty');
  const navInput   = qs('#navInput');
  const navSend    = qs('#navSendBtn');
  const queryBtns  = qsa('#navDemoQueries .nav-demo-q');
  let navBusy = false;

  function navSendQuery(idx, customText) {
    if (navBusy) return;
    navBusy = true;
    if (navEmpty) navEmpty.remove();

    /* Disable all query buttons temporarily */
    queryBtns.forEach(b => b.disabled = true);

    const q = NAV_QUERIES[idx];
    const qText = customText || q.query;

    /* User bubble */
    const userRow = document.createElement('div');
    userRow.className = 'nav-row user-row';
    userRow.innerHTML = `<div class="nav-bubble user">${escHtml(qText)}</div>`;
    navChat.appendChild(userRow);
    navChat.scrollTop = navChat.scrollHeight;

    /* Typing */
    const typingRow = document.createElement('div');
    typingRow.className = 'nav-row';
    typingRow.innerHTML = `
      <div class="nav-av">✦</div>
      <div class="nav-typing"><span></span><span></span><span></span></div>`;
    navChat.appendChild(typingRow);
    navChat.scrollTop = navChat.scrollHeight;

    setTimeout(() => {
      typingRow.remove();

      const resp = customText
        ? { text: "Navigator is scoped to pre-loaded demo data. Try one of the preset queries above to see the full experience.", sources: [], confidence: null }
        : q.response;

      const aiRow = document.createElement('div');
      aiRow.className = 'nav-row';
      aiRow.innerHTML = `
        <div class="nav-av">✦</div>
        <div class="nav-bubble ai">
          <p>${resp.text}</p>
          ${resp.sources.length ? `<div class="nav-sources">${resp.sources.map(s => `<span class="nav-stag">${escHtml(s)}</span>`).join('')}</div>` : ''}
        </div>`;
      navChat.appendChild(aiRow);
      navChat.scrollTop = navChat.scrollHeight;

      queryBtns.forEach(b => b.disabled = false);
      navBusy = false;
    }, 900 + Math.random() * 400);
  }

  queryBtns.forEach((btn, i) =>
    btn.addEventListener('click', () => navSendQuery(i))
  );

  function handleNavInput() {
    const val = navInput.value.trim();
    if (!val) return;
    navInput.value = '';
    navSendQuery(0, val);
  }

  navSend.addEventListener('click', handleNavInput);
  navInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleNavInput(); }
  });
}

/* ── Render: Process ──────────────────────────────────────────── */
function renderProcessCanvas() {
  const steps = [
    {
      num: '01', title: 'Understand the system',
      points: ['Domain & stakeholder research', 'Existing workflow audit', 'Data flow mapping', 'Failure mode identification'],
    },
    {
      num: '02', title: 'Map the gap',
      points: ['User interviews & shadowing', 'Mental model mapping', 'Journey & pain point analysis', 'Jobs-to-be-done framing'],
    },
    {
      num: '03', title: 'Architect the information',
      points: ['System & IA design first', 'Entry point definition', 'Edge case consideration', 'Hierarchy before aesthetics'],
    },
    {
      num: '04', title: 'Design with progressive disclosure',
      points: ['Complexity revealed on demand', 'Prototype at fidelity of question', 'Design for the 20% non-ideal state', 'Iterate with real users'],
    },
    {
      num: '05', title: 'Ship and stay close',
      points: ['Dev handoff with intent', 'QA loops for design integrity', 'Post-ship observation', 'Backlog fed by real usage'],
    },
  ];

  canvasBody.innerHTML = `
  <div class="cvs-eyebrow">Design Process</div>
  <div class="cvs-title" style="font-size:19px;margin-bottom:4px">How he approaches<br><em style="font-style:italic">complex systems.</em></div>
  <div class="cvs-overview" style="margin-bottom:24px">Research first. Always. The goal is to understand before designing — so every decision is grounded, not guessed.</div>

  <div class="cvs-process-steps">
    ${steps.map(s => `
      <div class="cvs-step">
        <div class="cvs-step-num">${escHtml(s.num)}</div>
        <div>
          <div class="cvs-step-title">${escHtml(s.title)}</div>
          <ul class="cvs-step-points">
            ${s.points.map(p => `<li>${escHtml(p)}</li>`).join('')}
          </ul>
        </div>
      </div>`).join('')}
  </div>

  <div class="cvs-chips" style="margin-top:20px">
    <button class="cvs-chip" data-q="Show me his projects">Show me the work</button>
    <button class="cvs-chip" data-q="Tell me about Navigator AI">See this applied to Navigator</button>
  </div>`;

  qsa('.cvs-chip', canvasBody).forEach(chip =>
    chip.addEventListener('click', () => sendMsg(chip.dataset.q))
  );
}

/* ── Render: Skills ───────────────────────────────────────────── */
function renderSkillsCanvas() {
  const groups = [
    {
      label: 'Design craft',
      skills: [
        { name: 'UI & Visual Design',       pct: 92 },
        { name: 'Interaction Design',        pct: 90 },
        { name: 'Prototyping (Figma)',        pct: 95 },
        { name: 'Design Systems',            pct: 88 },
      ],
    },
    {
      label: 'Product thinking',
      skills: [
        { name: 'Systems & IA Thinking',     pct: 93 },
        { name: 'Product Strategy',          pct: 82 },
        { name: 'UX Research',               pct: 85 },
        { name: 'Accessibility (WCAG)',       pct: 80 },
      ],
    },
    {
      label: 'Domain expertise',
      skills: [
        { name: 'AI/LLM Product UX',         pct: 88 },
        { name: 'Enterprise Security UX',    pct: 90 },
        { name: 'Data Visualization',        pct: 80 },
        { name: 'Conversational Design',     pct: 78 },
      ],
    },
  ];

  canvasBody.innerHTML = `
  <div class="cvs-eyebrow">Skills & Tools</div>
  <div class="cvs-title" style="font-size:19px;margin-bottom:16px">What he brings<br><em style="font-style:italic">to the table.</em></div>

  ${groups.map(g => `
    <div class="cvs-skill-group">
      <div class="cvs-skill-group-title">${escHtml(g.label)}</div>
      <div class="cvs-skill-bars">
        ${g.skills.map(s => `
          <div class="cvs-skill-row">
            <span class="cvs-skill-name">${escHtml(s.name)}</span>
            <div class="cvs-skill-track">
              <div class="cvs-skill-fill" data-pct="${s.pct}" style="width:0%"></div>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('')}

  <div class="cvs-chips" style="margin-top:16px">
    <button class="cvs-chip" data-q="Show me his projects">See it in his work</button>
    <button class="cvs-chip" data-q="What's his design process?">See his process</button>
  </div>`;

  qsa('.cvs-chip', canvasBody).forEach(chip =>
    chip.addEventListener('click', () => sendMsg(chip.dataset.q))
  );
}

function animateSkillBars() {
  qsa('.cvs-skill-fill', canvasBody).forEach((bar, i) => {
    setTimeout(() => {
      bar.style.width = bar.dataset.pct + '%';
    }, i * 55);
  });
}

/* ── Threads sidebar ─────────────────────────────────────────── */
function addThread(label) {
  if (threads.includes(label)) return;
  threads.push(label);

  const emptyEl = qs('.co-threads-empty', threadsList);
  if (emptyEl) emptyEl.remove();

  const el = document.createElement('div');
  el.className = 'co-thread is-active';
  el.innerHTML = `<span class="co-thread-dot"></span>${escHtml(label)}`;
  threadsList.appendChild(el);

  /* Remove active from previous */
  qsa('.co-thread').forEach(t => t.classList.remove('is-active'));
  el.classList.add('is-active');
}

/* ── Reset ───────────────────────────────────────────────────── */
function resetChat() {
  firstMsg  = false;
  isLoading = false;
  threads   = [];
  closeCanvas();

  /* Re-insert welcome */
  msgArea.innerHTML = `
    <div class="co-welcome" id="coWelcome">
      <div class="co-welcome-glyph">✦</div>
      <h1 class="co-welcome-title">Ask me anything<br><em>about Ananthu.</em></h1>
      <p class="co-welcome-sub">I know his work, his process, and what makes him tick.<br>Start below or pick a prompt.</p>
      <div class="co-starter-grid">
        <button class="co-starter" data-q="Show me his projects">
          <span class="co-starter-icon">◈</span>
          <div class="co-starter-body">
            <span class="co-starter-title">See his work</span>
            <span class="co-starter-desc">Two shipped enterprise products</span>
          </div>
        </button>
        <button class="co-starter" data-q="What's his design process?">
          <span class="co-starter-icon">◎</span>
          <div class="co-starter-body">
            <span class="co-starter-title">Design process</span>
            <span class="co-starter-desc">Research-first, systems thinking</span>
          </div>
        </button>
        <button class="co-starter co-starter--featured" data-q="Try the Navigator demo">
          <span class="co-starter-icon">✦</span>
          <div class="co-starter-body">
            <span class="co-starter-title">Try Navigator — live</span>
            <span class="co-starter-desc">The AI product he designed, running now</span>
          </div>
          <span class="co-starter-badge">Interactive</span>
        </button>
        <button class="co-starter" data-q="What makes him different?">
          <span class="co-starter-icon">◇</span>
          <div class="co-starter-body">
            <span class="co-starter-title">Why Ananthu?</span>
            <span class="co-starter-desc">The intersection nobody else occupies</span>
          </div>
        </button>
      </div>
    </div>`;

  welcome = qs('#coWelcome');
  qsa('.co-starter').forEach(btn =>
    btn.addEventListener('click', () => sendMsg(btn.dataset.q))
  );

  /* Reset threads */
  threadsList.innerHTML = '<div class="co-threads-empty">Start a conversation below — topics will appear here.</div>';
}

/* ── Helpers ─────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}
