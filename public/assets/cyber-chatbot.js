/**
 * CYBERPRO AI ASSISTANT v2.0 — ULTRA-PREMIUM FUTURISTIC CLIENT ENGINE
 * Preserves /api/chat & /api/chat/config contracts, adds Glassmorphism HUD,
 * Intelligent Welcome Screen, Smooth Stream Typing, Stop, Regenerate, Copy & History.
 */
(function () {
  'use strict';

  if (window.__CYBERPRO_CHATBOT_INITIALIZED__) return;
  window.__CYBERPRO_CHATBOT_INITIALIZED__ = true;

  const ACTIVE_SESSION_KEY = 'cyberpro_chat_active_v2';
  const THREADS_KEY = 'cyberpro_chat_threads_v2';
  const MODE_STORAGE_KEY = 'cyberpro_ai_mode_v1';
  const MAX_SAVED_THREADS = 12;

  const MODEL_OPTIONS = [
    {
      id: 'cyberpro',
      title: 'CyberPro',
      desc: 'Strictly CyberPro website, Student LMS, live class & courses',
      placeholder: 'Ask only CyberPro: where is dashboard, live class, CCCE...'
    },
    {
      id: 'ethical_hacking',
      title: 'Ethical Hacking',
      desc: 'Strictly ethical hacking, defense & authorized labs',
      placeholder: 'Ask strictly about ethical hacking, OWASP, Nmap, SOC...'
    },
    {
      id: 'worldwide',
      title: 'Worldwide',
      desc: 'World knowledge, math, quotes & general Q&A',
      placeholder: 'Ask anything worldwide — science, history, math, or quotes...'
    },
    {
      id: 'code',
      title: 'Code',
      desc: 'Programming, Python/JS/SQL/Bash, debugging & code',
      placeholder: 'Ask for Python, JavaScript, SQL, Bash, algorithms or code review...'
    }
  ];

  const LEGACY_MODE_MAP = {
    neural_core_4_2: 'worldwide',
    soc_defense_4_0: 'ethical_hacking',
    ccce_mentor_pro: 'cyberpro',
    owasp_auditor: 'code'
  };

  function normalizeModeId(raw) {
    const mapped = LEGACY_MODE_MAP[raw] || raw;
    return MODEL_OPTIONS.some(m => m.id === mapped) ? mapped : 'worldwide';
  }

  const CAPABILITY_CHIPS = [
    { id: 'cyberpro', icon: '&#9672;', label: 'CyberPro', mode: 'cyberpro' },
    { id: 'ethical_hacking', icon: '&#9876;', label: 'Ethical Hacking', mode: 'ethical_hacking' },
    { id: 'worldwide', icon: '&#127760;', label: 'Worldwide', mode: 'worldwide' },
    { id: 'code', icon: '&lt;/&gt;', label: 'Code', mode: 'code' }
  ];

  const PLUS_STARTERS = [
    { label: 'Where is Dashboard & Live Class?', badge: 'CYBERPRO', mode: 'cyberpro', query: 'Where is the dashboard in CyberPro and where do live classes happen?' },
    { label: 'CCCE 6-Month Syllabus', badge: 'CYBERPRO', mode: 'cyberpro', query: 'Tell me about the CCCE course duration, 27 modules, and 180+ tools.' },
    { label: '5 Phases of Ethical Hacking', badge: 'ETHICAL', mode: 'ethical_hacking', query: 'Explain the 5 phases of ethical hacking and authorized reconnaissance methodology.' },
    { label: 'Safe Parameterized SQL Query', badge: 'CODE', mode: 'code', query: 'Write a safe parameterized SQL query example in Python to prevent SQL Injection.' },
    { label: 'Global Knowledge Question', badge: 'WORLD', mode: 'worldwide', query: 'Explain quantum computing in simple terms.' }
  ];

  const WELCOME_INTRO_TEXT =
    "Choose your assistant mode below: Worldwide for general world Q&A, Ethical Hacking for strict security thinking, CyberPro for Student LMS/dashboard/live classes & courses only, or Code for programming.";

  const QUICK_ACTIONS = [
    {
      id: 'courses',
      label: 'CyberPro Courses & CCCE',
      mode: 'cyberpro',
      query: 'What cybersecurity courses and CCCE modules does CyberPro offer?',
      accent: 'green',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
    },
    {
      id: 'lms-dashboard',
      label: 'Where is Dashboard & Live Class?',
      mode: 'cyberpro',
      query: 'Where is the dashboard in CyberPro and where do live classes happen?',
      accent: 'cyan',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>'
    },
    {
      id: 'ethical-hacking',
      label: 'Ethical Hacking Mode',
      mode: 'ethical_hacking',
      query: 'Explain the 5 phases of ethical hacking and authorized lab methodology.',
      accent: 'mint',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
    },
    {
      id: 'code-mode',
      label: 'Code Assistant Mode',
      mode: 'code',
      query: 'Write a safe parameterized SQL query and input validation example in Python.',
      accent: 'cyan',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
    },
    {
      id: 'support',
      label: 'Admissions & Support',
      mode: 'cyberpro',
      query: 'How do I contact CyberPro support or speak to admissions?',
      accent: 'mint',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
    },
    {
      id: 'ask-anything',
      label: 'Ask Worldwide Question',
      mode: 'worldwide',
      action: 'focus_input',
      accent: 'green',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    }
  ];

  const NEURAL_CORE_SVG = `<img src="/assets/cyber-ai-launcher-poster.jpg" alt="CyberPro AI" class="cyber-mask-avatar-img">`;

  const LAUNCHER_MASK_HTML = `
    <video class="cyber-launcher-mask-video" id="cyber-launcher-mask-video" autoplay loop muted playsinline preload="auto" poster="/assets/cyber-ai-launcher-poster.jpg" aria-hidden="true">
      <source src="/assets/cyber-ai-launcher-mask.mp4" type="video/mp4">
    </video>
  `;

  const USER_AVATAR_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  `;

  let sessionId = createSessionId();
  let chatHistory = [];
  let savedThreads = [];
  let isOpen = false;
  let isMaximized = false;
  let isGenerating = false;
  let welcomeTypedDone = false;
  let welcomeTimer = null;
  let activeAbortController = null;
  let activeStreamTimer = null;
  let codeSnippetStore = [];
  let activeModelId = 'worldwide';

  try {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode) {
      activeModelId = normalizeModeId(savedMode);
    }
  } catch (e) {}

  function getModelOption(id) {
    const cleanId = normalizeModeId(id);
    return MODEL_OPTIONS.find(m => m.id === cleanId) || MODEL_OPTIONS[0];
  }

  function applyModelUi(modeId, options = {}) {
    const opt = getModelOption(modeId);
    activeModelId = opt.id;
    try { localStorage.setItem(MODE_STORAGE_KEY, opt.id); } catch (e) {}

    const pillLbl = document.getElementById('cyber-model-label');
    if (pillLbl) pillLbl.textContent = opt.title;

    const headerChip = document.getElementById('cyber-header-mode-chip');
    if (headerChip) headerChip.textContent = opt.title.toUpperCase();

    const input = document.getElementById('cyber-chat-input');
    if (input) {
      input.placeholder = opt.placeholder;
      if (options.focus) {
        focusComposerWithPulse();
      }
    }

    document.querySelectorAll('#cyber-model-menu .cyber-model-option').forEach(btn => {
      const isMatch = btn.getAttribute('data-model-id') === opt.id;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    document.querySelectorAll('#cyber-mode-chips-row .cyber-mode-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-chip-mode') === opt.id);
    });
  }

  function createSessionId() {
    return 'csess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
  }

  // ---------------------------------------------------------------------------
  // Session & Thread History Persistence
  // ---------------------------------------------------------------------------
  function loadState() {
    try {
      const rawThreads = localStorage.getItem(THREADS_KEY);
      savedThreads = rawThreads ? JSON.parse(rawThreads) : [];
      if (!Array.isArray(savedThreads)) savedThreads = [];
    } catch (e) {
      savedThreads = [];
    }

    try {
      const rawActive = sessionStorage.getItem(ACTIVE_SESSION_KEY) || localStorage.getItem(ACTIVE_SESSION_KEY);
      if (rawActive) {
        const parsed = JSON.parse(rawActive);
        if (parsed && Array.isArray(parsed.messages)) {
          sessionId = parsed.sessionId || sessionId;
          chatHistory = parsed.messages;
          return;
        }
      }
    } catch (e) {}

    chatHistory = [];
    saveActiveSession();
  }

  function saveActiveSession() {
    const payload = JSON.stringify({
      sessionId: sessionId,
      updatedAt: Date.now(),
      messages: chatHistory
    });
    try { sessionStorage.setItem(ACTIVE_SESSION_KEY, payload); } catch (e) {}
    try { localStorage.setItem(ACTIVE_SESSION_KEY, payload); } catch (e) {}
  }

  function saveThreadsStore() {
    try {
      localStorage.setItem(THREADS_KEY, JSON.stringify(savedThreads.slice(0, MAX_SAVED_THREADS)));
    } catch (e) {}
  }

  function archiveCurrentThreadIfNonEmpty() {
    const hasUserMsg = chatHistory.some(m => m.role === 'user');
    if (!hasUserMsg) return;

    const firstUser = chatHistory.find(m => m.role === 'user');
    const title = firstUser ? firstUser.content.replace(/\s+/g, ' ').trim().slice(0, 60) : 'CyberPro Session';

    savedThreads = savedThreads.filter(t => t.sessionId !== sessionId);
    savedThreads.unshift({
      sessionId: sessionId,
      title: title,
      updatedAt: Date.now(),
      messages: chatHistory.slice(-40)
    });
    savedThreads = savedThreads.slice(0, MAX_SAVED_THREADS);
    saveThreadsStore();
  }

  function startNewConversation() {
    stopActiveGeneration({ silent: true });
    archiveCurrentThreadIfNonEmpty();
    sessionId = createSessionId();
    chatHistory = [];
    welcomeTypedDone = false;
    saveActiveSession();
    hideClearConfirm();
    hideHistoryDrawer();
    renderAllMessages();
  }

  function loadSavedThread(threadSessionId) {
    const target = savedThreads.find(t => t.sessionId === threadSessionId);
    if (!target) return;
    stopActiveGeneration({ silent: true });
    archiveCurrentThreadIfNonEmpty();
    sessionId = target.sessionId;
    chatHistory = Array.isArray(target.messages) ? target.messages.slice() : [];
    welcomeTypedDone = true;
    saveActiveSession();
    hideHistoryDrawer();
    renderAllMessages();
  }

  // ---------------------------------------------------------------------------
  // Clipboard Helper (Works over HTTPS & Local HTTP)
  // ---------------------------------------------------------------------------
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    return new Promise((resolve) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
      resolve();
    });
  }

  // ---------------------------------------------------------------------------
  // Safe Rich Markdown Formatter (Code Blocks, Lists, Headings, Links)
  // ---------------------------------------------------------------------------
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sanitizeUrl(url) {
    const trimmed = String(url || '').trim();
    if (/^(https?:\/\/|mailto:|\/[^/])/i.test(trimmed)) return trimmed;
    return '#';
  }

  function formatInlineMarkdown(escapedLine) {
    let s = escapedLine;
    // Inline code
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic (avoid breaking underscores in URLs or bullet markers)
    s = s.replace(/(^|\s)\*([^*]+)\*(?=\s|[.,!?:;]|$)/g, '$1<em>$2</em>');
    // Links [label](url)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, rawUrl) {
      const safeUrl = sanitizeUrl(rawUrl.replace(/&amp;/g, '&'));
      const lower = safeUrl.toLowerCase();
      if (lower.includes('wa.me') || lower.includes('whatsapp.com')) {
        return `<a href="${escapeHTML(safeUrl)}" target="_blank" rel="noopener noreferrer" class="cyber-inline-cta">
          <svg style="width:13px;height:13px;fill:currentColor;" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z"/></svg>
          <span>${label}</span>
        </a>`;
      }
      if (safeUrl.startsWith('/')) {
        return `<a href="${escapeHTML(safeUrl)}">${label}</a>`;
      }
      return `<a href="${escapeHTML(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
    return s;
  }

  function formatMarkdown(rawText) {
    if (!rawText) return '';
    const codePlaceholders = [];

    // 1. Extract fenced code blocks before escaping line-by-line
    let textWithTokens = String(rawText).replace(/```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g, function (m, lang, code) {
      const idx = codeSnippetStore.length;
      const cleanCode = code.replace(/^\n+|\n+$/g, '');
      codeSnippetStore.push(cleanCode);
      const token = `__CYBER_CODE_BLOCK_${codePlaceholders.length}__`;
      codePlaceholders.push(`
        <div class="cyber-code-block">
          <div class="cyber-code-header">
            <span>${escapeHTML(lang || 'code')}</span>
            <button type="button" class="cyber-code-copy" data-snippet-idx="${idx}">Copy</button>
          </div>
          <pre><code>${escapeHTML(cleanCode)}</code></pre>
        </div>
      `);
      return '\n' + token + '\n';
    });

    const lines = escapeHTML(textWithTokens).split('\n');
    const out = [];
    let listType = null; // 'ul' | 'ol' | null

    function closeList() {
      if (listType) {
        out.push(`</${listType}>`);
        listType = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      if (!trimmed) {
        closeList();
        continue;
      }

      if (/^__CYBER_CODE_BLOCK_\d+__$/.test(trimmed)) {
        closeList();
        out.push(trimmed);
        continue;
      }

      if (/^###\s+/.test(trimmed)) {
        closeList();
        out.push('<h4>' + formatInlineMarkdown(trimmed.replace(/^###\s+/, '')) + '</h4>');
      } else if (/^##\s+/.test(trimmed)) {
        closeList();
        out.push('<h3>' + formatInlineMarkdown(trimmed.replace(/^##\s+/, '')) + '</h3>');
      } else if (/^#\s+/.test(trimmed)) {
        closeList();
        out.push('<h2>' + formatInlineMarkdown(trimmed.replace(/^#\s+/, '')) + '</h2>');
      } else if (/^&gt;\s+/.test(trimmed)) {
        closeList();
        out.push('<blockquote>' + formatInlineMarkdown(trimmed.replace(/^&gt;\s+/, '')) + '</blockquote>');
      } else if (/^(?:•|-|\*)\s+/.test(trimmed)) {
        if (listType !== 'ul') {
          closeList();
          out.push('<ul>');
          listType = 'ul';
        }
        out.push('<li>' + formatInlineMarkdown(trimmed.replace(/^(?:•|-|\*)\s+/, '')) + '</li>');
      } else if (/^\d+\.\s+/.test(trimmed)) {
        if (listType !== 'ol') {
          closeList();
          out.push('<ol>');
          listType = 'ol';
        }
        out.push('<li>' + formatInlineMarkdown(trimmed.replace(/^\d+\.\s+/, '')) + '</li>');
      } else {
        closeList();
        out.push('<p>' + formatInlineMarkdown(trimmed) + '</p>');
      }
    }
    closeList();

    let finalHtml = out.join('');
    codePlaceholders.forEach((blockHtml, idx) => {
      finalHtml = finalHtml.replace(`__CYBER_CODE_BLOCK_${idx}__`, () => blockHtml);
    });

    return finalHtml;
  }

  function wireCodeCopyButtons(rootEl) {
    rootEl.querySelectorAll('.cyber-code-copy').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-snippet-idx'), 10);
        const code = codeSnippetStore[idx] || '';
        copyText(code).then(() => {
          const orig = this.textContent;
          this.textContent = 'Copied!';
          this.style.color = '#39ff14';
          setTimeout(() => {
            this.textContent = orig;
            this.style.color = '';
          }, 1600);
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Widget Construction
  // ---------------------------------------------------------------------------
  function buildWidget() {
    if (document.getElementById('cyber-chatbot-launcher')) return;

    // 1. Premium Floating AI Button
    const launcher = document.createElement('button');
    launcher.id = 'cyber-chatbot-launcher';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Meet CyberPro AI - Open Assistant');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = `
      <span class="cyber-launcher-sonar"></span>
      <span class="cyber-launcher-sonar-2"></span>
      <span class="cyber-launcher-orbit"></span>
      <span class="cyber-launcher-tooltip" role="tooltip">
        <span class="dot"></span>
        <span>Meet CyberPro AI</span>
        <span class="tip-sub">Neural Mentor</span>
      </span>
      <span class="cyber-launcher-icon">${LAUNCHER_MASK_HTML}</span>
      <svg class="cyber-launcher-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <span class="cyber-launcher-status-pill" aria-hidden="true">
        <span class="status-dot"></span>
        <span>AI ONLINE</span>
      </span>
    `;

    // 2. Futuristic Glassmorphic Assistant Panel
    const win = document.createElement('div');
    win.id = 'cyber-chatbot-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-modal', 'false');
    win.setAttribute('aria-label', 'CyberPro AI Assistant');

    const particlesHTML = [
      { left: '12%', top: '22%', px: '14px', py: '-30px', dur: '8s', delay: '0s', cls: '' },
      { left: '28%', top: '72%', px: '-12px', py: '-40px', dur: '11s', delay: '1.2s', cls: 'mint' },
      { left: '48%', top: '38%', px: '10px', py: '-28px', dur: '9.5s', delay: '2.1s', cls: 'cyan' },
      { left: '72%', top: '18%', px: '-14px', py: '-34px', dur: '10s', delay: '0.6s', cls: '' },
      { left: '84%', top: '58%', px: '-10px', py: '-36px', dur: '8.5s', delay: '1.8s', cls: 'mint' },
      { left: '18%', top: '85%', px: '16px', py: '-44px', dur: '12s', delay: '0.4s', cls: 'cyan' },
      { left: '62%', top: '82%', px: '-8px', py: '-32px', dur: '9s', delay: '2.6s', cls: '' },
      { left: '90%', top: '30%', px: '-15px', py: '-25px', dur: '10.5s', delay: '1.5s', cls: 'mint' }
    ].map(p =>
      `<span class="cyber-particle ${p.cls}" style="left:${p.left};top:${p.top};--px:${p.px};--py:${p.py};--dur:${p.dur};--delay:${p.delay};"></span>`
    ).join('');

    win.innerHTML = `
      <div class="cyber-ambient-fx" aria-hidden="true">${particlesHTML}</div>

      <!-- Header -->
      <div class="cyber-chat-header">
        <div class="cyber-header-scan" aria-hidden="true"></div>
        <div class="cyber-header-left">
          <div class="cyber-header-avatar">
            ${NEURAL_CORE_SVG}
            <div class="cyber-avatar-status"></div>
          </div>
          <div class="cyber-header-info">
            <div class="cyber-header-title-row">
              <span class="cyber-header-title">CYBERPRO AI</span>
              <span class="cyber-header-chip" id="cyber-header-mode-chip">${escapeHTML(getModelOption(activeModelId).title.toUpperCase())}</span>
            </div>
            <div class="cyber-header-sub">
              <span class="indicator">●</span>
              <span>AI ONLINE • Zero-Trust Encrypted</span>
            </div>
          </div>
        </div>

        <div class="cyber-header-actions">
          <button type="button" class="cyber-action-btn" id="cyber-chat-history-btn" title="Conversation History" aria-label="Conversation History">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M12 7v5l3 2"/>
            </svg>
          </button>
          <button type="button" class="cyber-action-btn danger" id="cyber-chat-clear" title="Clear Chat" aria-label="Clear Chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          <button type="button" class="cyber-action-btn" id="cyber-chat-maximize" title="Expand / Restore" aria-label="Expand Window">
            <svg id="cyber-max-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
          <button type="button" class="cyber-action-btn" id="cyber-chat-close" title="Close Assistant" aria-label="Close Assistant">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Inline Clear Chat Confirmation Strip -->
      <div class="cyber-confirm-bar" id="cyber-confirm-clear-bar" role="region" aria-label="Clear chat confirmation">
        <span>Start a fresh session & clear view?</span>
        <div class="cyber-confirm-actions">
          <button type="button" class="cyber-confirm-btn primary" id="cyber-confirm-clear-yes">Clear Chat</button>
          <button type="button" class="cyber-confirm-btn" id="cyber-confirm-clear-no">Cancel</button>
        </div>
      </div>

      <!-- Slide-Down Conversation History Drawer -->
      <div class="cyber-history-drawer" id="cyber-history-drawer" aria-label="Saved conversation history">
        <div class="cyber-history-head">
          <span>Session History</span>
          <button type="button" class="cyber-history-new-btn" id="cyber-history-new-btn">+ New Chat</button>
        </div>
        <div class="cyber-history-list" id="cyber-history-list"></div>
      </div>

      <!-- Messages Stream -->
      <div class="cyber-chat-messages" id="cyber-chat-msg-container"></div>

      <!-- Footer / Claude-Gemini Inspired Composer -->
      <div class="cyber-chat-footer">
        <form class="cyber-input-form" id="cyber-chat-form">
          <div class="cyber-composer-box" id="cyber-composer-box">
            <textarea
              class="cyber-chat-input"
              id="cyber-chat-input"
              placeholder="${escapeHTML(getModelOption(activeModelId).placeholder)}"
              rows="1"
              maxlength="1400"
              aria-label="Message CyberPro AI"
            ></textarea>

            <div class="cyber-composer-toolbar">
              <div class="cyber-composer-left">
                <button type="button" class="cyber-plus-btn" id="cyber-plus-btn" title="Quick Topics & Prompts" aria-label="Open quick topics menu" aria-expanded="false">+</button>
                <div class="cyber-plus-menu" id="cyber-plus-menu" role="menu" aria-label="Quick topic starters">
                  ${PLUS_STARTERS.map((s, idx) => `
                    <button type="button" class="cyber-plus-item" data-plus-idx="${idx}" role="menuitem">
                      <span>${escapeHTML(s.label)}</span>
                      <span style="font-size:9px;color:#00ff41;opacity:0.85;">${escapeHTML(s.badge)}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="cyber-composer-right">
                <div class="cyber-model-wrap">
                  <button type="button" class="cyber-model-trigger" id="cyber-model-trigger" aria-haspopup="listbox" aria-expanded="false" title="Switch CyberPro AI Mode">
                    <span id="cyber-model-label">${escapeHTML(getModelOption(activeModelId).title)}</span>
                    <svg class="cyber-model-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  <div class="cyber-model-menu" id="cyber-model-menu" role="listbox" aria-label="Select CyberPro AI Intelligence Mode">
                    ${MODEL_OPTIONS.map(m => `
                      <button type="button" class="cyber-model-option${m.id === activeModelId ? ' active' : ''}" data-model-id="${escapeHTML(m.id)}" role="option" aria-selected="${m.id === activeModelId ? 'true' : 'false'}">
                        <span class="cyber-model-opt-text">
                          <span class="cyber-model-opt-title">${escapeHTML(m.title)}</span>
                          <span class="cyber-model-opt-desc">${escapeHTML(m.desc)}</span>
                        </span>
                        <span class="cyber-model-opt-check" aria-hidden="true">✓</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <button type="submit" class="cyber-send-btn" id="cyber-chat-send" title="Send Message" aria-label="Send Message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/>
                    <polyline points="5 12 12 5 19 12"/>
                  </svg>
                </button>
                <button type="button" class="cyber-stop-btn" id="cyber-chat-stop" title="Stop Generating" aria-label="Stop Generating">
                  <span class="stop-square"></span>
                  <span>Stop</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div class="cyber-mode-chips-row" id="cyber-mode-chips-row" aria-label="Quick specialist modes">
          ${CAPABILITY_CHIPS.map(c => `
            <button type="button" class="cyber-mode-chip${c.mode === activeModelId ? ' active' : ''}" data-chip-id="${escapeHTML(c.id)}" data-chip-mode="${escapeHTML(c.mode)}">
              <span class="chip-ico" aria-hidden="true">${c.icon}</span>
              <span>${escapeHTML(c.label)}</span>
            </button>
          `).join('')}
        </div>

        <div class="cyber-chat-subfooter">
          <span>CyberPro Neural Defense • Secure Session</span>
          <a href="https://wa.me/9176668762325?text=Hi%20CYBERPRO%20Admissions%20Desk%2C%20I%20would%20like%20to%20speak%20with%20a%20counselor." target="_blank" rel="noopener noreferrer" class="cyber-subfooter-link">
            <span>Talk to Admissions &rarr;</span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    syncLauncherVideo(true);
    setupEventListeners(launcher, win);
    renderAllMessages();
    verifyBackendConfig();
  }

  function verifyBackendConfig() {
    fetch('/api/chat/config', { method: 'GET' })
      .then(r => r.ok ? r.json() : null)
      .then(cfg => {
        if (cfg && cfg.enabled === false) {
          const pill = document.querySelector('#cyber-chatbot-launcher .cyber-launcher-status-pill span:last-child');
          if (pill) pill.textContent = 'STANDBY';
        }
      })
      .catch(() => {});
  }

  // ---------------------------------------------------------------------------
  // Event Listeners
  // ---------------------------------------------------------------------------
  function setupEventListeners(launcher, win) {
    launcher.addEventListener('click', toggleChat);

    const closeBtn = document.getElementById('cyber-chat-close');
    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    const maxBtn = document.getElementById('cyber-chat-maximize');
    if (maxBtn) maxBtn.addEventListener('click', toggleMaximize);

    const clearBtn = document.getElementById('cyber-chat-clear');
    const clearYes = document.getElementById('cyber-confirm-clear-yes');
    const clearNo = document.getElementById('cyber-confirm-clear-no');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        hideHistoryDrawer();
        const bar = document.getElementById('cyber-confirm-clear-bar');
        if (!bar) return;
        if (chatHistory.length === 0) {
          startNewConversation();
          return;
        }
        bar.classList.toggle('visible');
      });
    }
    if (clearYes) clearYes.addEventListener('click', startNewConversation);
    if (clearNo) clearNo.addEventListener('click', hideClearConfirm);

    const historyBtn = document.getElementById('cyber-chat-history-btn');
    const historyNewBtn = document.getElementById('cyber-history-new-btn');
    if (historyBtn) historyBtn.addEventListener('click', toggleHistoryDrawer);
    if (historyNewBtn) historyNewBtn.addEventListener('click', startNewConversation);

    const stopBtn = document.getElementById('cyber-chat-stop');
    if (stopBtn) {
      stopBtn.addEventListener('click', function () {
        stopActiveGeneration({ silent: false });
      });
    }

    const input = document.getElementById('cyber-chat-input');
    const form = document.getElementById('cyber-chat-form');

    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });

      input.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = (input.value || '').trim();
        if (!text || isGenerating) return;
        input.value = '';
        input.style.height = 'auto';
        sendMessage(text);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        const modelMenu = document.getElementById('cyber-model-menu');
        const plusMenu = document.getElementById('cyber-plus-menu');
        const drawer = document.getElementById('cyber-history-drawer');
        const confirmBar = document.getElementById('cyber-confirm-clear-bar');
        if ((modelMenu && modelMenu.classList.contains('visible')) || (plusMenu && plusMenu.classList.contains('visible'))) {
          hideComposerPopovers();
        } else if (drawer && drawer.classList.contains('visible')) {
          hideHistoryDrawer();
        } else if (confirmBar && confirmBar.classList.contains('visible')) {
          hideClearConfirm();
        } else {
          closeChat();
        }
      }
    });

    const modelTrigger = document.getElementById('cyber-model-trigger');
    const modelMenu = document.getElementById('cyber-model-menu');
    const plusBtn = document.getElementById('cyber-plus-btn');
    const plusMenu = document.getElementById('cyber-plus-menu');

    if (modelTrigger && modelMenu) {
      modelTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        if (plusMenu) {
          plusMenu.classList.remove('visible');
          if (plusBtn) { plusBtn.classList.remove('open'); plusBtn.setAttribute('aria-expanded', 'false'); }
        }
        const willOpen = !modelMenu.classList.contains('visible');
        modelMenu.classList.toggle('visible', willOpen);
        modelTrigger.classList.toggle('open', willOpen);
        modelTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      modelMenu.querySelectorAll('.cyber-model-option').forEach(optBtn => {
        optBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          const chosenId = this.getAttribute('data-model-id');
          applyModelUi(chosenId, { focus: true });
          hideComposerPopovers();
        });
      });
    }

    if (plusBtn && plusMenu) {
      plusBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (modelMenu) {
          modelMenu.classList.remove('visible');
          if (modelTrigger) { modelTrigger.classList.remove('open'); modelTrigger.setAttribute('aria-expanded', 'false'); }
        }
        const willOpen = !plusMenu.classList.contains('visible');
        plusMenu.classList.toggle('visible', willOpen);
        plusBtn.classList.toggle('open', willOpen);
        plusBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      plusMenu.querySelectorAll('.cyber-plus-item').forEach(itemBtn => {
        itemBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          const idx = parseInt(this.getAttribute('data-plus-idx'), 10);
          const starter = PLUS_STARTERS[idx];
          hideComposerPopovers();
          if (starter && starter.query) {
            if (starter.mode) applyModelUi(starter.mode);
            sendMessage(starter.query);
          }
        });
      });
    }

    document.querySelectorAll('#cyber-mode-chips-row .cyber-mode-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        const cid = this.getAttribute('data-chip-id');
        const cObj = CAPABILITY_CHIPS.find(x => x.id === cid);
        if (!cObj) return;
        applyModelUi(cObj.mode, { focus: true });
      });
    });

    win.addEventListener('click', function (e) {
      if (!e.target.closest('.cyber-model-wrap') && !e.target.closest('.cyber-composer-left')) {
        hideComposerPopovers();
      }
    });
  }

  function hideComposerPopovers() {
    const modelMenu = document.getElementById('cyber-model-menu');
    const modelTrigger = document.getElementById('cyber-model-trigger');
    const plusMenu = document.getElementById('cyber-plus-menu');
    const plusBtn = document.getElementById('cyber-plus-btn');
    if (modelMenu) modelMenu.classList.remove('visible');
    if (modelTrigger) {
      modelTrigger.classList.remove('open');
      modelTrigger.setAttribute('aria-expanded', 'false');
    }
    if (plusMenu) plusMenu.classList.remove('visible');
    if (plusBtn) {
      plusBtn.classList.remove('open');
      plusBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function hideClearConfirm() {
    const bar = document.getElementById('cyber-confirm-clear-bar');
    if (bar) bar.classList.remove('visible');
  }

  function hideHistoryDrawer() {
    const drawer = document.getElementById('cyber-history-drawer');
    const btn = document.getElementById('cyber-chat-history-btn');
    if (drawer) drawer.classList.remove('visible');
    if (btn) btn.classList.remove('active');
  }

  function toggleHistoryDrawer() {
    hideClearConfirm();
    const drawer = document.getElementById('cyber-history-drawer');
    const btn = document.getElementById('cyber-chat-history-btn');
    if (!drawer) return;
    const willOpen = !drawer.classList.contains('visible');
    if (willOpen) {
      renderHistoryList();
      drawer.classList.add('visible');
      if (btn) btn.classList.add('active');
    } else {
      hideHistoryDrawer();
    }
  }

  function renderHistoryList() {
    const listEl = document.getElementById('cyber-history-list');
    if (!listEl) return;

    if (!savedThreads || savedThreads.length === 0) {
      listEl.innerHTML = `<div class="cyber-history-empty">No archived sessions yet. Previous chats appear here automatically.</div>`;
      return;
    }

    listEl.innerHTML = savedThreads.map(t => {
      const timeStr = new Date(t.updatedAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' });
      const activeCls = t.sessionId === sessionId ? ' active' : '';
      return `
        <button type="button" class="cyber-history-item${activeCls}" data-thread-id="${escapeHTML(t.sessionId)}">
          <span class="cyber-history-item-title">${escapeHTML(t.title || 'CyberPro Conversation')}</span>
          <span class="cyber-history-item-meta">${escapeHTML(timeStr)} • ${(t.messages || []).length} msgs</span>
        </button>
      `;
    }).join('');

    listEl.querySelectorAll('.cyber-history-item').forEach(btn => {
      btn.addEventListener('click', function () {
        loadSavedThread(this.getAttribute('data-thread-id'));
      });
    });
  }

  function toggleChat(e) {
    const launcher = document.getElementById('cyber-chatbot-launcher');
    if (e && e.detail > 0 && launcher) launcher.blur();
    isOpen ? closeChat() : openChat();
  }

  function focusInputSafely(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch (_) {
      try { el.focus(); } catch (__) {}
    }
  }

  function syncLauncherVideo(shouldPlay) {
    const vid = document.getElementById('cyber-launcher-mask-video');
    if (!vid) return;
    if (shouldPlay) {
      vid.muted = true;
      vid.loop = true;
      const p = vid.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else if (!vid.paused) {
      vid.pause();
    }
  }

  function openChat() {
    const win = document.getElementById('cyber-chatbot-window');
    const launcher = document.getElementById('cyber-chatbot-launcher');
    if (!win) return;
    win.classList.add('open');
    if (launcher) {
      launcher.classList.add('is-open');
      launcher.setAttribute('aria-expanded', 'true');
    }
    syncLauncherVideo(false);
    isOpen = true;
    animateWelcomeIntroIfReady();
    setTimeout(() => {
      const input = document.getElementById('cyber-chat-input');
      if (input && window.innerWidth > 640) focusInputSafely(input);
      scrollToBottom();
    }, 180);
  }

  function closeChat() {
    const win = document.getElementById('cyber-chatbot-window');
    const launcher = document.getElementById('cyber-chatbot-launcher');
    if (!win) return;
    win.classList.remove('open');
    if (launcher) {
      launcher.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
    }
    syncLauncherVideo(true);
    isOpen = false;
    hideClearConfirm();
    hideHistoryDrawer();
  }

  function toggleMaximize() {
    const win = document.getElementById('cyber-chatbot-window');
    const icon = document.getElementById('cyber-max-icon');
    if (!win) return;
    isMaximized = !isMaximized;
    win.classList.toggle('maximized', isMaximized);
    if (icon) {
      icon.innerHTML = isMaximized
        ? '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>'
        : '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
    }
  }

  function scrollToBottom() {
    const c = document.getElementById('cyber-chat-msg-container');
    if (c) c.scrollTop = c.scrollHeight;
  }

  function focusComposerWithPulse() {
    const input = document.getElementById('cyber-chat-input');
    const box = document.getElementById('cyber-composer-box');
    if (box) {
      box.classList.remove('pulse-focus');
      void box.offsetWidth;
      box.classList.add('pulse-focus');
    }
    if (input) {
      input.placeholder = getModelOption(activeModelId).placeholder;
      focusInputSafely(input);
    }
  }

  // ---------------------------------------------------------------------------
  // Welcome Screen & Message Rendering
  // ---------------------------------------------------------------------------
  function createWelcomeElement() {
    const card = document.createElement('div');
    card.className = 'cyber-welcome-hero';
    card.id = 'cyber-welcome-screen';

    const quickHTML = QUICK_ACTIONS.map(item => `
      <button type="button" class="cyber-quick-btn" data-quick-id="${escapeHTML(item.id)}" data-accent="${escapeHTML(item.accent)}">
        <span class="cyber-quick-icon">${item.icon}</span>
        <span>${escapeHTML(item.label)}</span>
      </button>
    `).join('');

    card.innerHTML = `
      <div class="cyber-welcome-badge-row">
        <div class="cyber-welcome-orb"><img src="/assets/logo-mark.png" alt="CyberPro AI"></div>
        <div class="cyber-welcome-heading-group">
          <h2 class="cyber-welcome-title">CyberPro AI, <span>neural session</span></h2>
          <p class="cyber-welcome-subtitle">Universal AI • 4 Modes • Zero-Trust Encrypted</p>
        </div>
      </div>

      <div class="cyber-welcome-intro" id="cyber-welcome-intro-el">
        ${welcomeTypedDone ? escapeHTML(WELCOME_INTRO_TEXT) : ''}
      </div>

      <div class="cyber-quick-section">
        <div class="cyber-quick-label">
          <span>&#9889;</span>
          <span>Quick Neural Actions</span>
        </div>
        <div class="cyber-quick-grid">${quickHTML}</div>
      </div>
    `;

    card.querySelectorAll('.cyber-quick-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const qid = this.getAttribute('data-quick-id');
        const action = QUICK_ACTIONS.find(a => a.id === qid);
        if (!action) return;
        if (action.mode) {
          applyModelUi(action.mode);
        }
        if (action.action === 'focus_input') {
          focusComposerWithPulse();
        } else if (action.query) {
          sendMessage(action.query);
        }
      });
    });

    return card;
  }

  function animateWelcomeIntroIfReady() {
    if (welcomeTypedDone || !isOpen) return;
    const el = document.getElementById('cyber-welcome-intro-el');
    if (!el) return;

    if (welcomeTimer) clearInterval(welcomeTimer);
    let idx = 0;
    const words = WELCOME_INTRO_TEXT.split(' ');
    el.innerHTML = '<span class="typing-caret"></span>';

    welcomeTimer = setInterval(() => {
      idx += 2;
      if (idx >= words.length) {
        clearInterval(welcomeTimer);
        welcomeTimer = null;
        welcomeTypedDone = true;
        el.textContent = WELCOME_INTRO_TEXT;
        return;
      }
      el.innerHTML = escapeHTML(words.slice(0, idx).join(' ')) + '<span class="typing-caret"></span>';
    }, 38);
  }

  function findPrecedingUserPrompt(msgIndex) {
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (chatHistory[i] && chatHistory[i].role === 'user') {
        return chatHistory[i].content;
      }
    }
    return '';
  }

  function renderAllMessages() {
    const container = document.getElementById('cyber-chat-msg-container');
    if (!container) return;

    container.innerHTML = '';
    codeSnippetStore = [];

    container.appendChild(createWelcomeElement());
    if (isOpen && !welcomeTypedDone) {
      animateWelcomeIntroIfReady();
    }

    chatHistory.forEach((msg, idx) => {
      container.appendChild(createMessageRow(msg, idx));
    });

    scrollToBottom();
  }

  function createMessageRow(msg, msgIndex) {
    const row = document.createElement('div');
    row.className = `cyber-message-row ${msg.role}${msg.error ? ' error-msg' : ''}`;
    row.setAttribute('data-msg-idx', String(msgIndex));

    const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (msg.role === 'user') {
      row.innerHTML = `
        <div class="cyber-message-bubble">
          <div class="cyber-msg-body">${escapeHTML(msg.content).replace(/\n/g, '<br>')}</div>
          <div class="cyber-msg-meta">
            <span>You</span>
            <span>${escapeHTML(timeStr)}</span>
          </div>
        </div>
        <div class="cyber-msg-avatar user-avatar" title="You">${USER_AVATAR_SVG}</div>
      `;
      return row;
    }

    const bodyHTML = formatMarkdown(msg.content);
    const retryPrompt = findPrecedingUserPrompt(msgIndex);
    const errorRetryBtn = msg.error && retryPrompt
      ? `<button type="button" class="cyber-error-retry-btn" data-retry-idx="${msgIndex}">
           <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
           <span>Retry Response</span>
         </button>`
      : '';

    const stoppedBadge = msg.stopped ? `<span class="cyber-msg-tag-stopped">STOPPED</span>` : '';
    const regenBtnHTML = retryPrompt
      ? `<button type="button" class="cyber-tool-btn cyber-regen-btn" title="Regenerate response" data-regen-idx="${msgIndex}">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
           <span>Regenerate</span>
         </button>`
      : '';

    row.innerHTML = `
      <div class="cyber-msg-avatar" title="CyberPro AI">${NEURAL_CORE_SVG}</div>
      <div class="cyber-message-bubble">
        <div class="cyber-msg-body">${bodyHTML}</div>
        ${errorRetryBtn}
        <div class="cyber-msg-meta">
          <span style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span>CYBERPRO AI</span>
            ${msg.modeLabel ? `<span style="color:#00ff41;font-weight:700;">• ${escapeHTML(msg.modeLabel)}</span>` : ''}
            <span>${escapeHTML(timeStr)}</span>
            ${stoppedBadge}
          </span>
          <span class="cyber-msg-tools">
            ${regenBtnHTML}
            <button type="button" class="cyber-tool-btn cyber-copy-btn" title="Copy response">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span class="copy-label">Copy</span>
            </button>
          </span>
        </div>
      </div>
    `;

    wireCodeCopyButtons(row);

    const copyBtn = row.querySelector('.cyber-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyText(msg.content).then(() => {
          const label = copyBtn.querySelector('.copy-label');
          if (label) {
            label.textContent = 'Copied ✓';
            copyBtn.style.color = '#39ff14';
            copyBtn.style.borderColor = 'rgba(57,255,20,0.6)';
            setTimeout(() => {
              label.textContent = 'Copy';
              copyBtn.style.color = '';
              copyBtn.style.borderColor = '';
            }, 1700);
          }
        });
      });
    }

    const regenBtn = row.querySelector('.cyber-regen-btn');
    if (regenBtn) {
      regenBtn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-regen-idx'), 10);
        regenerateAt(idx);
      });
    }

    const errRetry = row.querySelector('.cyber-error-retry-btn');
    if (errRetry) {
      errRetry.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-retry-idx'), 10);
        regenerateAt(idx);
      });
    }

    return row;
  }

  // ---------------------------------------------------------------------------
  // Typing Indicator & Generation State Control
  // ---------------------------------------------------------------------------
  function setGeneratingState(active) {
    isGenerating = active;
    const composer = document.getElementById('cyber-composer-box');
    const sendBtn = document.getElementById('cyber-chat-send');
    if (composer) composer.classList.toggle('is-generating', active);
    if (sendBtn) sendBtn.disabled = active;
  }

  function showTypingIndicator() {
    const container = document.getElementById('cyber-chat-msg-container');
    if (!container) return;

    let el = document.getElementById('cyber-typing-indicator');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cyber-typing-indicator';
      el.className = 'cyber-message-row assistant';
      el.innerHTML = `
        <div class="cyber-msg-avatar">${NEURAL_CORE_SVG}</div>
        <div class="cyber-typing-indicator">
          <div class="cyber-eq-bars" aria-hidden="true">
            <span class="cyber-eq-bar"></span>
            <span class="cyber-eq-bar"></span>
            <span class="cyber-eq-bar"></span>
            <span class="cyber-eq-bar"></span>
          </div>
          <span class="cyber-typing-text">CyberPro AI is thinking...</span>
        </div>
      `;
      container.appendChild(el);
      scrollToBottom();
    }
  }

  function hideTypingIndicator() {
    const el = document.getElementById('cyber-typing-indicator');
    if (el) el.remove();
  }

  let currentStreamCancel = null;

  function stopActiveGeneration(opts = {}) {
    if (activeAbortController) {
      try { activeAbortController.abort(); } catch (e) {}
      activeAbortController = null;
    }
    if (typeof currentStreamCancel === 'function') {
      currentStreamCancel(Boolean(opts.silent));
      currentStreamCancel = null;
    }
    hideTypingIndicator();
    setGeneratingState(false);
  }

  function regenerateAt(assistantMsgIdx) {
    if (isGenerating) return;
    const promptText = findPrecedingUserPrompt(assistantMsgIdx);
    if (!promptText) return;
    sendMessage(promptText, { replaceIdx: assistantMsgIdx });
  }

  // ---------------------------------------------------------------------------
  // Smooth Word-Stream Animation Helper (Interruptible via Stop Button)
  // ---------------------------------------------------------------------------
  function streamAssistantReply(fullText, targetIdx, timestamp) {
    return new Promise((resolve) => {
      const container = document.getElementById('cyber-chat-msg-container');
      if (!container) {
        chatHistory[targetIdx].content = fullText;
        saveActiveSession();
        resolve();
        return;
      }

      const row = createMessageRow({
        role: 'assistant',
        content: '',
        timestamp: timestamp
      }, targetIdx);

      // Replace existing row if regenerating, else append
      const existing = container.querySelector(`.cyber-message-row[data-msg-idx="${targetIdx}"]`);
      if (existing) {
        existing.replaceWith(row);
      } else {
        container.appendChild(row);
      }

      const bodyEl = row.querySelector('.cyber-msg-body');
      const toolsEl = row.querySelector('.cyber-msg-tools');
      if (toolsEl) toolsEl.style.visibility = 'hidden';

      const tokens = fullText.split(/(\s+)/);
      let cursor = 0;
      const step = Math.max(2, Math.ceil(tokens.length / 45));

      function finalize(shownText, wasStopped) {
        if (activeStreamTimer) {
          clearInterval(activeStreamTimer);
          activeStreamTimer = null;
        }
        currentStreamCancel = null;
        chatHistory[targetIdx].content = shownText;
        chatHistory[targetIdx].stopped = wasStopped;
        saveActiveSession();

        const finalRow = createMessageRow(chatHistory[targetIdx], targetIdx);
        row.replaceWith(finalRow);
        setGeneratingState(false);
        scrollToBottom();
        resolve();
      }

      currentStreamCancel = function (silent) {
        const partial = tokens.slice(0, cursor).join('').trim() || fullText;
        finalize(partial, !silent);
      };

      activeStreamTimer = setInterval(() => {
        cursor = Math.min(tokens.length, cursor + step);
        const partial = tokens.slice(0, cursor).join('');
        if (bodyEl) {
          bodyEl.innerHTML = formatMarkdown(partial) + '<span class="cyber-stream-caret"></span>';
          wireCodeCopyButtons(bodyEl);
        }
        scrollToBottom();

        if (cursor >= tokens.length) {
          finalize(fullText, false);
        }
      }, 22);
    });
  }

  // ---------------------------------------------------------------------------
  // Real Backend API Request (/api/chat)
  // ---------------------------------------------------------------------------
  async function sendMessage(text, options = {}) {
    const cleanText = String(text || '').trim();
    if (!cleanText || isGenerating) return;

    hideClearConfirm();
    hideHistoryDrawer();

    const isRegen = typeof options.replaceIdx === 'number';
    const userTimestamp = Date.now();

    if (!isRegen) {
      chatHistory.push({
        role: 'user',
        content: cleanText,
        timestamp: userTimestamp
      });
      saveActiveSession();
      const container = document.getElementById('cyber-chat-msg-container');
      if (container) {
        container.appendChild(createMessageRow(chatHistory[chatHistory.length - 1], chatHistory.length - 1));
      }
      scrollToBottom();
    }

    setGeneratingState(true);
    showTypingIndicator();

    const controller = new AbortController();
    activeAbortController = controller;

    // Context window up to 10 prior turns before this assistant reply
    const contextEndIdx = isRegen ? options.replaceIdx : chatHistory.length;
    const historyPayload = chatHistory
      .slice(Math.max(0, contextEndIdx - 10), contextEndIdx)
      .filter(m => !m.error)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          session_id: sessionId,
          mode: activeModelId,
          history: historyPayload
        }),
        signal: controller.signal
      });

      let data = null;
      try { data = await res.json(); } catch (e) {}

      if (activeAbortController !== controller) {
        return;
      }
      activeAbortController = null;
      hideTypingIndicator();

      if (res.ok && data && data.ok && data.reply) {
        const replyTs = data.timestamp ? data.timestamp * 1000 : Date.now();
        const modeLbl = data.mode_label || getModelOption(activeModelId).title;
        let targetIdx;
        if (isRegen) {
          targetIdx = options.replaceIdx;
          chatHistory[targetIdx] = {
            role: 'assistant',
            content: data.reply,
            timestamp: replyTs,
            modeLabel: modeLbl,
            stopped: false,
            error: false
          };
        } else {
          chatHistory.push({
            role: 'assistant',
            content: data.reply,
            timestamp: replyTs,
            modeLabel: modeLbl,
            stopped: false,
            error: false
          });
          targetIdx = chatHistory.length - 1;
        }
        saveActiveSession();
        await streamAssistantReply(data.reply, targetIdx, replyTs);
      } else {
        const errorText = (data && data.error)
          ? data.error
          : 'CyberPro AI is temporarily unavailable right now. Please try again in a moment or contact Admissions on WhatsApp.';
        appendOrReplaceAssistantMsg({
          role: 'assistant',
          content: errorText,
          timestamp: Date.now(),
          error: true
        }, isRegen ? options.replaceIdx : null);
        setGeneratingState(false);
      }
    } catch (err) {
      hideTypingIndicator();
      activeAbortController = null;

      if (err && err.name === 'AbortError') {
        appendOrReplaceAssistantMsg({
          role: 'assistant',
          content: 'Response generation was stopped.',
          timestamp: Date.now(),
          stopped: true
        }, isRegen ? options.replaceIdx : null);
        setGeneratingState(false);
        return;
      }

      console.error('CYBERPRO Chatbot Error:', err);
      const fallbackMsg =
        'Unable to reach CyberPro AI server. Please check your connection, retry below, or reach Admissions directly on WhatsApp at [**+91 76668762325**](https://wa.me/9176668762325).';
      appendOrReplaceAssistantMsg({
        role: 'assistant',
        content: fallbackMsg,
        timestamp: Date.now(),
        error: true
      }, isRegen ? options.replaceIdx : null);
      setGeneratingState(false);
    }
  }

  function appendOrReplaceAssistantMsg(msgObj, replaceIdx) {
    let idx = replaceIdx;
    if (typeof idx === 'number' && chatHistory[idx]) {
      chatHistory[idx] = msgObj;
    } else {
      chatHistory.push(msgObj);
      idx = chatHistory.length - 1;
    }
    saveActiveSession();
    const container = document.getElementById('cyber-chat-msg-container');
    if (container) {
      const existing = typeof replaceIdx === 'number'
        ? container.querySelector(`.cyber-message-row[data-msg-idx="${idx}"]`)
        : null;
      const newRow = createMessageRow(msgObj, idx);
      if (existing) {
        existing.replaceWith(newRow);
      } else {
        container.appendChild(newRow);
      }
    }
    scrollToBottom();
  }

  // ---------------------------------------------------------------------------
  // Auto-Init & Public Global Controller
  // ---------------------------------------------------------------------------
  function init() {
    loadState();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildWidget);
    } else {
      buildWidget();
    }
  }

  init();

  window.CyberProChat = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    clear: startNewConversation,
    setMode: function (modeId) {
      applyModelUi(modeId, { focus: false });
    },
    getMode: function () {
      return activeModelId;
    },
    send: function (msg) {
      openChat();
      sendMessage(msg);
    }
  };
})();
