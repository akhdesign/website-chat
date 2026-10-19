/*!
 * ah design · Website-Chat Widget v1
 * Einbinden (Site Settings → Custom Code → Footer):
 *   <script src="https://cdn.jsdelivr.net/gh/akhdesign/website-chat@v1/ah-chat.js"
 *           data-api="https://ahdesign-website-chat.DEINNAME.workers.dev" defer></script>
 * Optional am Script-Tag: data-calendly, data-mail, data-privacy, data-accent (#hex), data-hide-on="/anfrage,/website-check"
 * Jeder Button mit dem Attribut data-ahchat-open öffnet den Chat (Value = Frage, die direkt gestellt wird – optional).
 * Ohne data-api läuft das Widget im Demo-Modus mit Beispielantworten.
 * Kein GSAP, keine Abhängigkeiten.
 */
(function () {
  'use strict';
  if (window.__ahChatLoaded) return;
  window.__ahChatLoaded = true;

  var script = document.currentScript || document.querySelector('script[src*="ah-chat"]');
  var ds = (script && script.dataset) || {};
  var cfg = Object.assign({
    api: ds.api || '',
    calendly: ds.calendly || 'https://calendly.com/office-ahdesign/30min',
    mail: ds.mail || 'office@ahdesign.at',
    privacy: ds.privacy || '/datenschutz',
    accent: ds.accent || '',
    right: ds.right || '',
    bottom: ds.bottom || '',
    hideOn: (ds.hideOn || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    title: 'ah design',
    subtitle: 'KI-Assistent · antwortet sofort',
  }, window.AHChatConfig || {});
  var DEMO = !cfg.api;
  var API = (cfg.api || '').replace(/\/+$/, '');

  if (cfg.hideOn.indexOf(location.pathname.replace(/\/+$/, '') || '/') !== -1) return;

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STORE_KEY = 'ahchat:v1';
  var MAX_TURNS = 20;

  var SUGGESTIONS = [
    'Was kostet eine Website?',
    'Wie lange dauert ein Projekt?',
    'Gibt es Förderungen?',
    'Kann ich die Website selbst pflegen?',
  ];
  var GREETING = 'Hallo! Ich bin der KI-Assistent von ah design. Fragen Sie mich zu Leistungen, Preisen oder zum Ablauf.\n\nFür alles Persönliche verbinde ich Sie direkt mit **Andreas**.';

  // ───────────── Zustand ─────────────
  var state = load() || { messages: [], open: false, nudged: false };
  var busy = false;

  function load() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY)); } catch (e) { return null; }
  }
  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* privat-modus */ }
  }

  // ───────────── Styles ─────────────
  var css = '\
.ahc,.ahc *{box-sizing:border-box}\
.ahc a,.ahc button,.ahc input,.ahc textarea,.ahc label,.ahc span,.ahc div{letter-spacing:normal;text-transform:none}\
.ahc button,.ahc input,.ahc textarea{margin:0;font-family:inherit}\
.ahc-x,.ahc-send,.ahc-launch{padding:0!important;line-height:1}\
.ahc{--ahc-accent:#c6f432;--ahc-accent-ink:#0b0b0b;--ahc-bg:#0d0d0d;--ahc-panel:#141414;--ahc-bot:#1f1f1f;--ahc-text:#f2f2f2;--ahc-muted:#8d8d8d;--ahc-line:rgba(255,255,255,.08);--ahc-read:#53bdeb;--ahc-radius:18px;--ahc-x:24px;--ahc-y:24px;\
font-family:inherit;font-size:15px;line-height:1.45;color:var(--ahc-text);-webkit-font-smoothing:antialiased}\
.ahc-launch{position:fixed;right:var(--ahc-x);bottom:var(--ahc-y);z-index:2147483000;width:62px;height:62px;padding:0;margin:0;border-radius:50%;border:1px solid rgba(255,255,255,.16);cursor:pointer;color:#fff;display:grid;place-items:center;isolation:isolate;\
background:radial-gradient(circle at 50% 30%,#2b2b2b 0%,#121212 55%,#060606 100%);\
box-shadow:0 12px 32px rgba(0,0,0,.5),0 0 22px rgba(198,244,50,.18),inset 0 1px 1px rgba(255,255,255,.25),inset 0 -10px 18px rgba(0,0,0,.6);\
transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s}\
.ahc-orb{position:absolute;inset:0;border-radius:50%;overflow:hidden;z-index:-1;pointer-events:none}\
.ahc-orb:before{content:"";position:absolute;inset:-35%;background:conic-gradient(from 0deg,var(--ahc-accent),#2fd4c8,#5b8cff,#9b6bff,var(--ahc-accent));filter:blur(12px);opacity:.85;animation:ahc-spin 7s linear infinite;\
-webkit-mask:radial-gradient(circle,transparent 30%,#000 52%,transparent 72%);mask:radial-gradient(circle,transparent 30%,#000 52%,transparent 72%)}\
.ahc-orb:after{content:"";position:absolute;inset:22%;border-radius:50%;background:radial-gradient(circle,rgba(198,244,50,.55),rgba(47,212,200,.25) 45%,transparent 70%);filter:blur(6px);animation:ahc-breathe 3.2s ease-in-out infinite}\
.ahc-shine{position:absolute;inset:0;border-radius:50%;pointer-events:none;background:radial-gradient(ellipse 60% 35% at 50% 12%,rgba(255,255,255,.28),transparent 70%)}\
.ahc-launch:hover{transform:scale(1.07);box-shadow:0 14px 36px rgba(0,0,0,.55),0 0 34px rgba(198,244,50,.32),inset 0 1px 1px rgba(255,255,255,.3),inset 0 -10px 18px rgba(0,0,0,.6)}\
.ahc-launch:focus-visible{outline:3px solid var(--ahc-accent);outline-offset:3px}\
.ahc-launch svg{width:26px;height:26px;position:absolute;filter:drop-shadow(0 0 6px rgba(255,255,255,.35));transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .2s}\
.ahc-launch .ahc-i-close{opacity:0;transform:rotate(-90deg) scale(.6)}\
.ahc.is-open .ahc-launch .ahc-i-chat{opacity:0;transform:rotate(90deg) scale(.6)}\
.ahc.is-open .ahc-launch .ahc-i-close{opacity:1;transform:none}\
.ahc-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#ff3b30;color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;transform:scale(0);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}\
.ahc.has-unread .ahc-badge{transform:scale(1)}\
.ahc-nudge{position:fixed;right:calc(var(--ahc-x) + 76px);bottom:calc(var(--ahc-y) + 10px);z-index:2147483000;max-width:240px;padding:10px 14px;border-radius:14px 14px 4px 14px;background:var(--ahc-panel);color:var(--ahc-text);border:1px solid var(--ahc-line);box-shadow:0 10px 30px rgba(0,0,0,.3);font-size:14px;cursor:pointer;opacity:0;transform:translateY(8px) scale(.96);transform-origin:bottom right;transition:opacity .3s,transform .4s cubic-bezier(.22,1,.36,1);pointer-events:none}\
.ahc-nudge.is-on{opacity:1;transform:none;pointer-events:auto}\
.ahc-panel{position:fixed;right:var(--ahc-x);bottom:calc(var(--ahc-y) + 76px);z-index:2147483001;width:380px;height:min(640px,calc(100vh - var(--ahc-y) - 100px));display:flex;flex-direction:column;background:var(--ahc-bg);border:1px solid var(--ahc-line);border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.45);\
opacity:0;transform:translateY(16px) scale(.97);transform-origin:bottom right;pointer-events:none;visibility:hidden;transition:opacity .25s,transform .4s cubic-bezier(.22,1,.36,1),visibility 0s .4s}\
.ahc.is-open .ahc-panel{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .25s,transform .4s cubic-bezier(.22,1,.36,1),visibility 0s}\
.ahc-head{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;background:var(--ahc-panel);border-bottom:1px solid var(--ahc-line)}\
.ahc-avatar{position:relative;flex:none;width:40px;height:40px;border-radius:50%;background:var(--ahc-accent);color:var(--ahc-accent-ink);display:grid;place-items:center;font-weight:800;font-size:15px;letter-spacing:-.02em}\
.ahc-avatar:after{content:"";position:absolute;right:0;bottom:0;width:11px;height:11px;border-radius:50%;background:#25d366;border:2px solid var(--ahc-panel)}\
.ahc-who{flex:1;min-width:0}\
.ahc-name{font-weight:700;font-size:16px;line-height:1.2}\
.ahc-status{font-size:12.5px;color:var(--ahc-muted);height:18px;overflow:hidden}\
.ahc-status span{display:block;transition:transform .3s cubic-bezier(.22,1,.36,1)}\
.ahc.is-typing .ahc-status span{transform:translateY(-18px)}\
.ahc-status .ahc-st-typing{color:var(--ahc-accent)}\
.ahc-x{flex:none;width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:var(--ahc-muted);cursor:pointer;display:grid;place-items:center}\
.ahc-x:hover{background:var(--ahc-line);color:var(--ahc-text)}\
.ahc-log{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:16px 14px 8px;display:flex;flex-direction:column;gap:4px;scroll-behavior:smooth;\
background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1px);background-size:18px 18px}\
.ahc-day{align-self:center;margin:0 0 10px;padding:4px 10px;border-radius:8px;background:var(--ahc-panel);color:var(--ahc-muted);font-size:12px}\
.ahc-row{display:flex;flex-direction:column;max-width:84%}\
.ahc-row.is-user{align-self:flex-end;align-items:flex-end}\
.ahc-row.is-bot{align-self:flex-start;align-items:flex-start}\
.ahc-row.is-bot+.ahc-row.is-user,.ahc-row.is-user+.ahc-row.is-bot,.ahc-chips+.ahc-row{margin-top:8px}\
.ahc-bubble{position:relative;padding:8px 12px 6px;border-radius:var(--ahc-radius);word-wrap:break-word;overflow-wrap:anywhere;animation:ahc-pop .32s cubic-bezier(.34,1.4,.64,1) both}\
.is-bot .ahc-bubble{background:var(--ahc-bot);border-top-left-radius:6px}\
.is-user .ahc-bubble{background:var(--ahc-accent);color:var(--ahc-accent-ink);border-top-right-radius:6px;transform-origin:bottom right}\
.is-bot .ahc-bubble{transform-origin:top left}\
.ahc-bubble,.ahc-bubble p,.ahc-bubble strong,.ahc-bubble a{font-family:inherit;font-size:15px;line-height:22px;letter-spacing:normal;text-transform:none}\
.ahc-bubble p{margin:0;padding:0;max-width:none}\
.ahc-bubble p+p{margin-top:0}\
.ahc-bubble strong{font-weight:700}\
.ahc-bubble a{color:var(--ahc-accent);text-decoration:underline;text-underline-offset:2px}\
.is-user .ahc-bubble a{color:inherit}\
.ahc-meta{display:inline-flex;align-items:center;gap:3px;float:right;margin:6px 0 -2px 10px;font-size:11px;line-height:1;opacity:.6;white-space:nowrap}\
.is-user .ahc-meta{opacity:.7}\
.ahc-ticks{width:16px;height:11px}\
.ahc-ticks path{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:stroke .25s}\
.ahc-ticks .t2{opacity:0;transition:opacity .2s}\
.is-delivered .ahc-ticks .t2,.is-read .ahc-ticks .t2{opacity:1}\
.is-read .ahc-ticks path{stroke:#0a7cbf}\
.is-read .ahc-meta{opacity:1}\
.ahc-typing{display:inline-flex;gap:4px;align-items:center;padding:13px 14px;background:var(--ahc-bot);border-radius:var(--ahc-radius);border-top-left-radius:6px;animation:ahc-pop .28s cubic-bezier(.34,1.4,.64,1) both}\
.ahc-typing i{width:7px;height:7px;border-radius:50%;background:var(--ahc-muted);animation:ahc-dot 1.2s infinite ease-in-out}\
.ahc-typing i:nth-child(2){animation-delay:.15s}\
.ahc-typing i:nth-child(3){animation-delay:.3s}\
.ahc-typing.is-out{animation:ahc-out .18s ease forwards}\
.ahc-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0 4px;animation:ahc-fade .4s .1s both}\
.ahc-chip{-webkit-appearance:none;appearance:none;box-sizing:border-box;height:38px;margin:0;padding:0 14px;border:1px solid var(--ahc-line);background:var(--ahc-panel);color:var(--ahc-text);border-radius:999px;font-family:inherit;font-size:14px;font-weight:500;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;vertical-align:middle;transition:border-color .2s,background .2s,transform .2s}\
.ahc-chip:hover{border-color:var(--ahc-accent);transform:translateY(-1px)}\
.ahc-chip.is-main{background:var(--ahc-accent);color:var(--ahc-accent-ink);border-color:var(--ahc-accent);font-weight:600}\
.ahc-chip svg{width:16px;height:16px;flex:none;display:block}\
.ahc-card{width:100%;max-width:300px;margin-top:4px;padding:12px;border-radius:var(--ahc-radius);border-top-left-radius:6px;background:var(--ahc-bot);display:flex;flex-direction:column;gap:8px;animation:ahc-pop .32s cubic-bezier(.34,1.4,.64,1) both}\
.ahc-card label,.ahc-card label a,.ahc-card span{font-size:12px;line-height:1.35}\
.ahc-card label{color:var(--ahc-muted);display:flex;flex-direction:column;gap:4px}\
.ahc-card input,.ahc-card textarea{font:inherit;font-size:14px;color:var(--ahc-text);background:var(--ahc-bg);border:1px solid var(--ahc-line);border-radius:10px;padding:8px 10px;width:100%}\
.ahc-card textarea{min-height:70px;resize:vertical}\
.ahc-card input:focus,.ahc-card textarea:focus{outline:none;border-color:var(--ahc-accent)}\
.ahc-card .ahc-consent{flex-direction:row;align-items:flex-start;gap:8px;line-height:1.35}\
.ahc-card .ahc-consent input{width:16px;height:16px;flex:none;margin-top:1px;accent-color:var(--ahc-accent)}\
.ahc-card .ahc-consent a{color:var(--ahc-text)}\
.ahc-card .ahc-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}\
.ahc-card button{font:inherit;font-size:14px;line-height:1.2;font-weight:600;border:0;border-radius:10px;padding:10px;background:var(--ahc-accent);color:var(--ahc-accent-ink);cursor:pointer}\
.ahc-card button[disabled]{opacity:.5;cursor:default}\
.ahc-err,.ahc-err a{font-size:12.5px;line-height:1.35}\
.ahc-err{color:#ff8a80;min-height:0}\
.ahc-foot{padding:10px 12px 8px;background:var(--ahc-panel);border-top:1px solid var(--ahc-line)}\
.ahc-form{display:flex;align-items:flex-end;gap:8px}\
.ahc-input{flex:1;font:inherit;font-size:15px;color:var(--ahc-text);background:var(--ahc-bg);border:1px solid var(--ahc-line);border-radius:22px;padding:10px 16px;resize:none;max-height:120px;line-height:1.35}\
.ahc-input:focus{outline:none;border-color:rgba(198,244,50,.5)}\
.ahc-input::placeholder{color:var(--ahc-muted)}\
.ahc-send{flex:none;width:42px;height:42px;border-radius:50%;border:0;background:var(--ahc-accent);color:var(--ahc-accent-ink);display:grid;place-items:center;cursor:pointer;transition:transform .2s,opacity .2s}\
.ahc-send:disabled{opacity:.35;cursor:default;transform:scale(.92)}\
.ahc-send svg{width:20px;height:20px}\
.ahc-legal,.ahc-legal a{font-size:11px;line-height:1.4;font-weight:400}\
.ahc-legal{margin-top:6px;color:var(--ahc-muted);text-align:center}\
.ahc-legal a{color:inherit}\
.ahc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\
@keyframes ahc-spin{to{transform:rotate(360deg)}}\
@keyframes ahc-breathe{0%,100%{opacity:.55;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}\
@keyframes ahc-pop{from{opacity:0;transform:scale(.6) translateY(6px)}to{opacity:1;transform:none}}\
@keyframes ahc-out{to{opacity:0;transform:scale(.7)}}\
@keyframes ahc-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\
@keyframes ahc-dot{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-5px);opacity:1}}\
@media (max-width:520px){\
.ahc-panel{right:0;bottom:0;width:100%;height:100%;height:100dvh;border-radius:0;border:0}\
.ahc.is-open .ahc-launch{opacity:0;pointer-events:none}\
.ahc{--ahc-x:16px;--ahc-y:16px}\
.ahc-input{font-size:16px}}\
@media (prefers-reduced-motion:reduce){.ahc *{animation:none!important;transition:none!important}}';

  // ───────────── Icons ─────────────
  var I = {
    chat: '<svg class="ahc-i-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z"/><path d="M19 15.5c.2 1.4.9 2.1 2.3 2.3-1.4.2-2.1.9-2.3 2.3-.2-1.4-.9-2.1-2.3-2.3 1.4-.2 2.1-.9 2.3-2.3z"/></svg>',
    close: '<svg class="ahc-i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4l17.4-7.5a1 1 0 0 0 0-1.8L3.4 3.6a1 1 0 0 0-1.4 1.1L4 11l9 1-9 1-2 6.3a1 1 0 0 0 1.4 1.1z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>',
    ticks: '<svg class="ahc-ticks" viewBox="0 0 16 11" aria-hidden="true"><path class="t1" d="M1 6l3 3 6-7"/><path class="t2" d="M8.5 9L15 2"/></svg>',
  };

  // ───────────── DOM ─────────────
  var root, launch, nudge, panel, log, input, sendBtn, statusLive;

  function build() {
    var style = document.createElement('style');
    style.id = 'ahc-style';
    style.textContent = css;
    document.head.appendChild(style);

    root = el('div', 'ahc');
    if (cfg.accent) root.style.setProperty('--ahc-accent', cfg.accent);
    if (cfg.right) root.style.setProperty('--ahc-x', px(cfg.right));
    if (cfg.bottom) root.style.setProperty('--ahc-y', px(cfg.bottom));

    launch = el('button', 'ahc-launch');
    launch.type = 'button';
    launch.setAttribute('aria-label', 'Chat öffnen');
    launch.setAttribute('aria-expanded', 'false');
    launch.setAttribute('aria-controls', 'ahc-panel');
    launch.innerHTML = '<span class="ahc-orb" aria-hidden="true"></span><span class="ahc-shine" aria-hidden="true"></span>' + I.chat + I.close + '<span class="ahc-badge" aria-hidden="true">1</span>';

    nudge = el('div', 'ahc-nudge');
    nudge.textContent = 'Fragen zu Website, Preis oder Ablauf? Ich antworte sofort.';

    panel = el('section', 'ahc-panel');
    panel.id = 'ahc-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat mit dem KI-Assistenten von ah design');
    panel.innerHTML =
      '<header class="ahc-head">' +
        '<div class="ahc-avatar" aria-hidden="true">ah</div>' +
        '<div class="ahc-who"><div class="ahc-name">' + esc(cfg.title) + '</div>' +
        '<div class="ahc-status"><span>' + esc(cfg.subtitle) + '</span><span class="ahc-st-typing">schreibt …</span></div></div>' +
        '<button type="button" class="ahc-x" aria-label="Chat schließen">' + I.x + '</button>' +
      '</header>' +
      '<div class="ahc-log" role="log" aria-live="polite" aria-relevant="additions"><div class="ahc-day">Heute</div></div>' +
      '<div class="ahc-foot">' +
        '<form class="ahc-form" autocomplete="off">' +
          '<label class="ahc-sr" for="ahc-input">Ihre Nachricht</label>' +
          '<textarea id="ahc-input" class="ahc-input" rows="1" maxlength="1000" placeholder="Nachricht schreiben …"></textarea>' +
          '<button type="submit" class="ahc-send" aria-label="Senden" disabled>' + I.send + '</button>' +
        '</form>' +
        '<div class="ahc-legal">KI-Assistent, kann sich irren. Bitte keine sensiblen Daten. <a href="' + esc(cfg.privacy) + '" target="_blank" rel="noopener">Datenschutz</a></div>' +
      '</div>';

    root.appendChild(nudge);
    root.appendChild(panel);
    root.appendChild(launch);
    document.body.appendChild(root);

    log = panel.querySelector('.ahc-log');
    input = panel.querySelector('.ahc-input');
    sendBtn = panel.querySelector('.ahc-send');
    statusLive = el('div', 'ahc-sr');
    statusLive.setAttribute('aria-live', 'polite');
    root.appendChild(statusLive);

    launch.addEventListener('click', function () { toggle(); });
    nudge.addEventListener('click', function () { toggle(true); });
    panel.querySelector('.ahc-x').addEventListener('click', function () { toggle(false); launch.focus(); });
    panel.querySelector('.ahc-form').addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    input.addEventListener('input', function () { autosize(); sendBtn.disabled = !input.value.trim() || busy; });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-open')) { toggle(false); launch.focus(); } });

    // Externe Trigger: <a data-ahchat-open="Was kostet ein Logo?">…</a>
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-ahchat-open]');
      if (!t) return;
      e.preventDefault();
      toggle(true);
      var q = t.getAttribute('data-ahchat-open');
      if (q) setTimeout(function () { ask(q); }, 450);
    });

    restore();
    if (state.open) toggle(true, true);
    else scheduleNudge();
  }

  function toggle(force, silent) {
    var open = typeof force === 'boolean' ? force : !root.classList.contains('is-open');
    root.classList.toggle('is-open', open);
    root.classList.remove('has-unread');
    launch.setAttribute('aria-expanded', String(open));
    launch.setAttribute('aria-label', open ? 'Chat schließen' : 'Chat öffnen');
    nudge.classList.remove('is-on');
    state.open = open;
    if (open) {
      state.nudged = true;
      if (!state.messages.length && !log.querySelector('.ahc-row')) greet();
      if (!silent && window.matchMedia('(min-width:521px)').matches) setTimeout(function () { input.focus(); }, 300);
      scrollDown(true);
    }
    save();
  }

  function scheduleNudge() {
    if (state.nudged) return;
    setTimeout(function () {
      if (root.classList.contains('is-open') || state.nudged) return;
      nudge.classList.add('is-on');
      root.classList.add('has-unread');
      state.nudged = true;
      save();
      setTimeout(function () { nudge.classList.remove('is-on'); }, 9000);
    }, 6000);
  }

  // ───────────── Verlauf ─────────────
  function restore() {
    if (state.messages.length) addBotParts(GREETING, state.greetT || '', true);
    state.messages.forEach(function (m) {
      if (m.role === 'user') addUser(m.content, m.t, true);
      else addBotParts(m.content, m.t, true);
    });
    if (state.messages.length) {
      var last = state.messages[state.messages.length - 1];
      if (last.role === 'assistant' && last.action) addActions(last.action, true);
    }
  }

  function greet() {
    busy = true;
    var dots = showTyping();
    wait(REDUCED ? 0 : 700).then(function () {
      hideTyping(dots);
      state.greetT = now();
      return revealParts(splitParts(GREETING), null);
    }).then(function () {
      var chips = el('div', 'ahc-chips');
      SUGGESTIONS.forEach(function (q) {
        var b = el('button', 'ahc-chip');
        b.type = 'button';
        b.textContent = q;
        b.addEventListener('click', function () { chips.remove(); ask(q); });
        chips.appendChild(b);
      });
      chips.setAttribute('data-suggest', '');
      log.appendChild(chips);
      busy = false;
      sendBtn.disabled = !input.value.trim();
      scrollDown();
    });
  }

  function submit() {
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = '';
    autosize();
    ask(text);
  }

  function ask(text) {
    if (busy) return;
    busy = true;
    sendBtn.disabled = true;
    removeTransient();

    var t = now();
    var row = addUser(text, t);
    state.messages.push({ role: 'user', content: text, t: t });
    save();

    // WhatsApp-Gefühl: ✓ gesendet → ✓✓ zugestellt → blau gelesen → „schreibt …"
    setTimeout(function () { row.classList.add('is-delivered'); }, 250);
    var start = Date.now();

    var userTurns = state.messages.filter(function (m) { return m.role === 'user'; }).length;
    var request = userTurns > MAX_TURNS
      ? Promise.resolve({ reply: 'Wir haben schon viel besprochen. Für alles Weitere ist ein kurzes Gespräch mit Andreas am schnellsten.', action: 'kontakt' })
      : (DEMO ? demoReply(text) : callApi('/chat', { messages: history(), page: location.pathname }));

    var dots;
    wait(REDUCED ? 0 : 550).then(function () {
      row.classList.add('is-read');
      dots = showTyping();
      return request;
    }).then(function (res) {
      if (!res || !res.reply) throw new Error('leer');
      return res;
    }).catch(function () {
      return { reply: 'Da hakt gerade etwas. Andreas beantwortet Ihre Frage aber gern persönlich.', action: 'kontakt' };
    }).then(function (res) {
      var parts = splitParts(res.reply);
      // Tipp-Dauer an Textlänge koppeln, damit es natürlich wirkt (aber nie künstlich lang)
      var minTyping = REDUCED ? 0 : Math.min(2200, 650 + parts[0].length * 14);
      var elapsed = Date.now() - start;
      return wait(Math.max(0, minTyping - elapsed)).then(function () {
        return revealParts(parts, dots);
      }).then(function () {
        var tb = now();
        state.messages.push({ role: 'assistant', content: res.reply, t: tb, action: res.action || 'keine' });
        save();
        addActions(res.action);
        if (!root.classList.contains('is-open')) root.classList.add('has-unread');
      });
    }).then(function () {
      busy = false;
      sendBtn.disabled = !input.value.trim();
    });
  }

  function revealParts(parts, dots) {
    var chain = Promise.resolve();
    parts.forEach(function (p, i) {
      chain = chain.then(function () {
        if (i === 0) { hideTyping(dots); addBot(p, now()); return; }
        var d = showTyping();
        return wait(REDUCED ? 0 : Math.min(1600, 500 + p.length * 10)).then(function () { hideTyping(d); addBot(p, now()); });
      });
    });
    return chain;
  }

  function history() {
    return state.messages.slice(-16).map(function (m) { return { role: m.role, content: m.content }; });
  }

  function splitParts(text) {
    var parts = String(text).split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length > 2) parts = [parts[0], parts.slice(1).join('\n\n')];
    return parts.length ? parts : [String(text)];
  }

  // ───────────── Bubbles ─────────────
  function addUser(text, t, instant) {
    var row = el('div', 'ahc-row is-user' + (instant ? ' is-read' : ''));
    var b = el('div', 'ahc-bubble');
    if (instant) b.style.animation = 'none';
    b.innerHTML = '<p>' + esc(text).replace(/\n/g, '<br>') + '</p><span class="ahc-meta">' + esc(t) + I.ticks + '</span>';
    row.appendChild(b);
    log.appendChild(row);
    scrollDown();
    return row;
  }

  function addBot(md, t, instant) {
    var row = el('div', 'ahc-row is-bot');
    var b = el('div', 'ahc-bubble');
    if (instant) b.style.animation = 'none';
    b.innerHTML = render(md) + '<span class="ahc-meta">' + esc(t) + '</span>';
    row.appendChild(b);
    log.appendChild(row);
    statusLive.textContent = 'Neue Antwort';
    scrollDown();
    return row;
  }

  function addBotParts(md, t, instant) {
    splitParts(md).forEach(function (p) { addBot(p, t, instant); });
  }

  function showTyping() {
    root.classList.add('is-typing');
    var row = el('div', 'ahc-row is-bot ahc-typing-row');
    row.innerHTML = '<div class="ahc-typing" aria-label="schreibt"><i></i><i></i><i></i></div>';
    log.appendChild(row);
    scrollDown();
    return row;
  }

  function hideTyping(row) {
    root.classList.remove('is-typing');
    if (row && row.parentNode) row.parentNode.removeChild(row);
  }

  function removeTransient() {
    log.querySelectorAll('[data-suggest],[data-actions]').forEach(function (n) { n.remove(); });
  }

  // ───────────── Übergabe: Call · Mail · Konfigurator ─────────────
  function addActions(action, instant) {
    if (action !== 'kontakt' && action !== 'konfigurator') return;
    var wrap = el('div', 'ahc-chips');
    wrap.setAttribute('data-actions', '');
    if (instant) wrap.style.animation = 'none';

    if (action === 'konfigurator') {
      wrap.appendChild(linkChip(I.calc + 'Preis im Konfigurator berechnen', '/anfrage', true, false));
      wrap.appendChild(linkChip(I.cal + 'Erstgespräch buchen', cfg.calendly, false, true));
    } else {
      wrap.appendChild(linkChip(I.cal + 'Erstgespräch buchen', cfg.calendly, true, true));
      var m = el('button', 'ahc-chip');
      m.type = 'button';
      m.innerHTML = I.mail + 'Nachricht an Andreas';
      m.addEventListener('click', function () { wrap.remove(); showLeadForm(); });
      wrap.appendChild(m);
    }
    log.appendChild(wrap);
    scrollDown();
  }

  function linkChip(html, href, main, external) {
    var a = el('a', 'ahc-chip' + (main ? ' is-main' : ''));
    a.href = href;
    a.innerHTML = html;
    if (external) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', function () { track('ahchat_' + (href.indexOf('calendly') > -1 ? 'call' : 'konfigurator')); });
    return a;
  }

  function showLeadForm() {
    busy = true;
    var dots = showTyping();
    wait(REDUCED ? 0 : 600).then(function () {
      hideTyping(dots);
      addBot('Gern. Hinterlassen Sie kurz Ihre Daten, Andreas meldet sich persönlich bei Ihnen. Den Chatverlauf schicke ich mit, Sie müssen also nichts wiederholen.', now());

      var lastQ = '';
      for (var i = state.messages.length - 1; i >= 0; i--) if (state.messages[i].role === 'user') { lastQ = state.messages[i].content; break; }

      var row = el('div', 'ahc-row is-bot');
      var f = el('form', 'ahc-card');
      f.setAttribute('novalidate', '');
      f.innerHTML =
        '<label>Name<input name="name" autocomplete="name" required></label>' +
        '<label>E-Mail<input name="email" type="email" autocomplete="email" required></label>' +
        '<label>Nachricht<textarea name="message" maxlength="3000"></textarea></label>' +
        '<label class="ahc-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>' +
        '<label class="ahc-consent"><input type="checkbox" name="consent"><span>Meine Angaben und der Chatverlauf dürfen zur Bearbeitung meiner Anfrage per E-Mail an ah design gesendet werden. <a href="' + esc(cfg.privacy) + '" target="_blank" rel="noopener">Datenschutz</a></span></label>' +
        '<div class="ahc-err" role="alert"></div>' +
        '<button type="submit">Anfrage senden</button>';
      f.elements.message.value = lastQ ? 'Bezug: ' + lastQ : '';
      row.appendChild(f);
      log.appendChild(row);
      scrollDown();
      busy = false;
      setTimeout(function () { f.elements.name.focus(); }, 200);

      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = f.querySelector('.ahc-err');
        var data = {
          name: f.elements.name.value.trim(),
          email: f.elements.email.value.trim(),
          message: f.elements.message.value.trim(),
          website: f.elements.website.value,
          consent: f.elements.consent.checked,
          page: location.href,
          transcript: state.messages.map(function (m) { return { role: m.role, content: m.content }; }),
        };
        if (!data.name) { err.textContent = 'Bitte geben Sie Ihren Namen an.'; return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { err.textContent = 'Bitte prüfen Sie Ihre E-Mail-Adresse.'; return; }
        if (!data.consent) { err.textContent = 'Bitte bestätigen Sie die Weitergabe.'; return; }
        err.textContent = '';
        var btn = f.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Wird gesendet …';

        (DEMO ? wait(900).then(function () { return { ok: true }; }) : callApi('/lead', data))
          .then(function (res) {
            if (!res || !res.ok) throw new Error((res && res.error) || 'Fehler');
            track('ahchat_lead');
            row.remove();
            var d = showTyping();
            return wait(REDUCED ? 0 : 700).then(function () {
              hideTyping(d);
              var msg = 'Danke, ' + data.name.split(' ')[0] + '! Ihre Anfrage ist bei Andreas. Er meldet sich in der Regel innerhalb eines Werktags unter ' + data.email + '.';
              addBot(msg, now());
              state.messages.push({ role: 'assistant', content: msg, t: now(), action: 'keine' });
              save();
            });
          })
          .catch(function (e2) {
            btn.disabled = false;
            btn.textContent = 'Anfrage senden';
            err.innerHTML = esc(e2.message && e2.message !== 'Fehler' ? e2.message : 'Senden hat nicht geklappt.') + ' Alternativ: <a href="mailto:' + esc(cfg.mail) + '">' + esc(cfg.mail) + '</a>';
          });
      });
    });
  }

  // ───────────── Backend ─────────────
  function callApi(path, body) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    return fetch(API + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined,
    }).then(function (r) {
      clearTimeout(timer);
      return r.json().catch(function () { return { ok: false }; }).then(function (j) {
        if (!r.ok && path === '/chat') throw new Error('http');
        return j;
      });
    });
  }

  // Demo-Modus (ohne data-api): zeigt Optik + Abläufe mit Beispielantworten
  function demoReply(q) {
    var s = q.toLowerCase();
    var r;
    if (/kost|preis|teuer|budget/.test(s)) r = { reply: 'Website-Pakete starten bei **5.000 €** (Start), das empfohlene Paket Wachstum liegt bei **8.000 €**, Enterprise bei 13.000 €. Alle Preise netto zzgl. USt.\n\nIhre genaue Schätzung sehen Sie in wenigen Klicks im [Konfigurator](/anfrage).', action: 'konfigurator' };
    else if (/lange|dauer|wann|zeit/.test(s)) r = { reply: 'Eine typische Website ist in etwa **vier bis acht Wochen** online. Das hängt vom Umfang ab und davon, wie schnell Inhalte und Feedback kommen.\n\nEinen konkreten Zeitplan legt Andreas gleich im Erstgespräch fest.', action: 'keine' };
    else if (/förder|zuschuss|kmu/.test(s)) r = { reply: 'Ja, zum Beispiel über **KMU.DIGITAL**. Andreas arbeitet mit einem zertifizierten Förderberater zusammen und vermittelt den Kontakt kostenlos. Mehr dazu unter [Digitale Förderung](/foerderung).', action: 'keine' };
    else if (/pfleg|selbst|cms|ändern/.test(s)) r = { reply: 'Ja. Texte, Bilder, Blogartikel oder Projekte ändern Sie direkt im Editor, ohne Programmierkenntnisse. Das Layout bleibt geschützt, und bei der Übergabe zeigt Andreas Ihnen alle Handgriffe.', action: 'keine' };
    else r = { reply: 'Das kann ich Ihnen nicht sicher beantworten. Am besten klären Sie das direkt mit Andreas, per Termin oder kurzer Nachricht.', action: 'kontakt' };
    return wait(500 + Math.random() * 600).then(function () { return r; });
  }

  // ───────────── Helfer ─────────────
  function render(md) {
    var html = esc(md);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, href) {
      var raw = href.replace(/&amp;/g, '&');
      if (!/^(\/[^/]|https:\/\/|mailto:)/.test(raw) && raw !== '/') return t;
      var ext = /^https:\/\//.test(raw) && raw.indexOf(location.host) === -1;
      return '<a href="' + esc(raw) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>';
    });
    return html.split(/\n\s*\n/).map(function (p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; }).join('');
  }

  function track(name) {
    try { (window.dataLayer = window.dataLayer || []).push({ event: name }); } catch (e) { /* egal */ }
  }

  function autosize() {
    input.style.height = 'auto';
    input.style.height = Math.min(120, input.scrollHeight) + 'px';
  }

  function scrollDown(instant) {
    requestAnimationFrame(function () {
      if (instant) { var b = log.style.scrollBehavior; log.style.scrollBehavior = 'auto'; log.scrollTop = log.scrollHeight; log.style.scrollBehavior = b; }
      else log.scrollTop = log.scrollHeight;
    });
  }

  function now() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function px(v) { return /^\d+(\.\d+)?$/.test(String(v)) ? v + 'px' : String(v); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // Öffentliche Mini-API: AHChat.open(), AHChat.ask('Frage'), AHChat.reset()
  window.AHChat = {
    open: function () { toggle(true); },
    close: function () { toggle(false); },
    ask: function (q) { toggle(true); setTimeout(function () { ask(q); }, 450); },
    reset: function () { state = { messages: [], open: false, nudged: true }; save(); log.querySelectorAll('.ahc-row,.ahc-chips').forEach(function (n) { n.remove(); }); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
