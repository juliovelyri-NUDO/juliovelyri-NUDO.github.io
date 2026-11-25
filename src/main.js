import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { icons } from "./icons.js";
import { initLabs } from "./labs.js";
import { initChart } from "./chart.js";
import { initTerminal } from "./term.js";
import { initVom } from "./vom.js";

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
if (reduce) document.documentElement.classList.add("reduced");

/* ---------- iconos ---------- */
$$("[data-icon]").forEach((el) => {
  const svg = icons[el.dataset.icon];
  if (svg) el.insertAdjacentHTML("afterbegin", svg);
});

/* ---------- tema ---------- */
const themeBtn = $("#themeBtn");
function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set) return set;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function paintThemeIcon() {
  themeBtn.innerHTML = icons[currentTheme() === "dark" ? "sun" : "moon"];
  document.querySelector('meta[name="theme-color"]').setAttribute("content", currentTheme() === "dark" ? "#0c0c0b" : "#ececE8");
}
themeBtn.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("jv-theme", next); } catch (e) {}
  paintThemeIcon();
  window.dispatchEvent(new CustomEvent("themechange"));
});
paintThemeIcon();

/* ---------- días para la maratón ---------- */
const RACE = new Date("2026-12-13T08:30:00+01:00");
function daysLeft() {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((Date.UTC(2026, 11, 13) - today) / 86400000));
}
const dl = daysLeft();
$("#daysLeft").textContent = dl;
$("#daysBig").textContent = dl;
if (dl === 0) {
  $("#daysLeft").parentElement.innerHTML = "<b>Maratón hecha.</b> Resultado pronto";
  $("#daysBig").nextElementSibling.textContent = "días. Ya está hecha";
}

/* ---------- scroll suave ---------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id === "#top" ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    nav.classList.remove("is-open");
    $("#menuBtn").setAttribute("aria-expanded", "false");
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else if (target === 0) window.scrollTo(0, 0);
    else target.scrollIntoView();
  });
});

/* ---------- navegación ---------- */
const nav = $("#nav");
ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (self) => {
    nav.classList.toggle("is-scrolled", self.scroll() > 40);
    if (!nav.classList.contains("is-open")) nav.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 600);
  },
});
$("#menuBtn").addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  $("#menuBtn").setAttribute("aria-expanded", String(open));
  $("#menuBtn").innerHTML = icons[open ? "x" : "list"];
});
$$(".nav__links a").forEach((a) => {
  const sec = $(a.getAttribute("href"));
  if (!sec) return;
  ScrollTrigger.create({
    trigger: sec, start: "top 50%", end: "bottom 50%",
    onToggle: (s) => a.classList.toggle("is-active", s.isActive),
  });
});

/* ---------- arranque ---------- */
function boot() {
  const el = $("#boot");
  let seen = false;
  try { seen = sessionStorage.getItem("jv-boot") === "1"; } catch (e) {}
  if (reduce || seen) { el.remove(); return Promise.resolve(); }
  try { sessionStorage.setItem("jv-boot", "1"); } catch (e) {}
  const lines = [
    ["> despertando al sujeto", "julio"],
    ["> café", "ok"],
    ["> rodilla", "8/10, se puede correr"],
    ["> agentes nocturnos", "han dejado informes"],
    ["> km esta semana", "en el registro"],
    ["> estado", "en pruebas"],
  ];
  const log = $("#bootLog");
  return new Promise((resolve) => {
    let done = false;
    const tl = gsap.timeline({ onComplete: finish });
    lines.forEach(([k, v], i) => {
      tl.call(() => { log.insertAdjacentHTML("beforeend", `${k.padEnd(24, " ")}<span class="ok">${v}</span>\n`); }, null, i * 0.2);
    });
    tl.to("#bootBar", { scaleX: 1, duration: lines.length * 0.2 + 0.2, ease: "power2.inOut" }, 0);
    function finish() {
      if (done) return; done = true;
      el.classList.add("is-done");
      gsap.to(el, { yPercent: -100, duration: 0.9, ease: "expo.inOut", onComplete: () => el.remove() });
      setTimeout(resolve, 350);
    }
    $(".boot__skip").addEventListener("click", () => { tl.kill(); finish(); });
    el.addEventListener("click", () => { tl.kill(); finish(); });
  });
}

/* ---------- hero: letras que se estiran con el cursor ---------- */
function initHeroName() {
  const letters = $$("#heroName .l");
  if (reduce) return;
  gsap.from(letters, { yPercent: 110, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.06 });
  if (!finePointer) {
    // en móvil, una respiración lenta
    letters.forEach((l, i) => {
      const o = { w: 100, wg: 800 };
      gsap.to(o, { w: 125, wg: 900, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.25,
        onUpdate: () => { l.style.fontVariationSettings = `"wdth" ${o.w}, "wght" ${o.wg}`; } });
    });
    return;
  }
  const state = letters.map(() => ({ w: 100, wg: 800 }));
  const setters = letters.map((l, i) => () => { l.style.fontVariationSettings = `"wdth" ${state[i].w}, "wght" ${state[i].wg}`; });
  let mx = -9999, my = -9999;
  window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  gsap.ticker.add(() => {
    letters.forEach((l, i) => {
      const r = l.getBoundingClientRect();
      if (r.bottom < 0) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.hypot(mx - cx, my - cy);
      const k = Math.max(0, 1 - d / 420);
      const tw = 70 + k * 45; // 70..115
      const tg = 300 + k * 600;
      state[i].w += ((k > 0 ? tw : 100) - state[i].w) * 0.12;
      state[i].wg += ((k > 0 ? tg : 800) - state[i].wg) * 0.12;
      setters[i]();
    });
  });
}

/* ---------- hero: roles que rotan ---------- */
function initRoles() {
  const roles = ["founder de NUDO", "IA en consultoría", "atleta híbrido", "conejillo de indias profesional", "director de agentes nocturnos"];
  const el = $("#role");
  let i = 0;
  if (reduce) return;
  setInterval(() => {
    i = (i + 1) % roles.length;
    gsap.to(el, { yPercent: -100, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: () => {
      el.textContent = roles[i];
      gsap.fromTo(el, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
    } });
  }, 2600);
}

/* ---------- hero: campo de puntos ---------- */
function initField() {
  const c = $("#field");
  const ctx = c.getContext("2d");
  let w, h, dpr, pts = [], mx = -999, my = -999, visible = true, color = "#ecebe5", acc = "#d2f04a";
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    color = cs.getPropertyValue("--ink").trim();
    acc = cs.getPropertyValue("--acc-ink").trim();
  };
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = [];
    const gap = w < 700 ? 26 : 30;
    for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) pts.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
  }
  readColors(); resize();
  window.addEventListener("resize", resize);
  window.addEventListener("themechange", readColors);
  c.parentElement.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true });
  c.parentElement.addEventListener("pointerleave", () => { mx = my = -999; });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(c);
  let t = 0;
  function frame() {
    if (visible) {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, R = 150;
        if (!reduce && d2 < R * R) { const d = Math.sqrt(d2) || 1; const f = (1 - d / R) * 2.6; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx += (p.ox - p.x) * 0.06; p.vy += (p.oy - p.y) * 0.06; p.vx *= 0.8; p.vy *= 0.8;
        p.x += p.vx; p.y += p.vy;
        const disp = Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 18);
        const wave = reduce ? 0 : (Math.sin(p.ox * 0.012 + t * 3) + Math.cos(p.oy * 0.015 - t * 2)) * 0.5;
        ctx.globalAlpha = 0.1 + disp * 0.7 + Math.max(0, wave) * 0.06;
        ctx.fillStyle = disp > 0.25 ? acc : color;
        const s = 1.1 + disp * 1.8;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ---------- apariciones ---------- */
function initReveals() {
  if (reduce) return;
  ScrollTrigger.batch(".rv", {
    start: "top 88%",
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08, overwrite: true }),
  });
}

/* ---------- manifiesto palabra a palabra ---------- */
function initManifesto() {
  const p = $("#manifesto");
  const wrapWords = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.append(t);
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = t; frag.append(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrapWords(n);
    });
  };
  wrapWords(p);
  const words = $$(".w", p);
  if (reduce) { words.forEach((w) => w.classList.add("on")); return; }
  ScrollTrigger.create({
    trigger: p, start: "top 78%", end: "bottom 42%", scrub: true,
    onUpdate: (s) => {
      const n = Math.round(s.progress * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    },
  });
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => {
      if (to === 0) { gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6 }); return; }
      gsap.to(o, { v: to, duration: 1.6, ease: "expo.out", onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString("es-ES"); } });
    } });
  });
}

/* ---------- NUDO: pantallas según el paso ---------- */
function initNudo() {
  const imgs = $$("#phone img");
  const steps = $$(".step");
  steps.forEach((s) => {
    ScrollTrigger.create({
      trigger: s, start: "top 55%", end: "bottom 55%",
      onToggle: (self) => { if (self.isActive) imgs.forEach((im, i) => im.classList.toggle("on", i === +s.dataset.screen)); },
    });
    if (!reduce) gsap.from(s.children, { opacity: 0, y: 30, duration: 0.9, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: s, start: "top 75%" } });
  });
  if (!reduce) gsap.to(".nudo__logo", { rotate: 20, y: -40, ease: "none", scrollTrigger: { trigger: "#nudo", start: "top bottom", end: "bottom top", scrub: true } });
  initKnot();
}

function initKnot() {
  const box = $("#knot"), svg = $("svg", box), rope = $("#rope"), A = $("#pA"), B = $("#pB");
  const VW = 520, VH = 230;
  const pa = { x: 70, y: 115 }, pb = { x: 450, y: 115 };
  let drag = null, tied = false, t = 0;
  const fill = () => { const c = getComputedStyle(document.documentElement); A.setAttribute("fill", c.getPropertyValue("--acc").trim()); B.setAttribute("fill", c.getPropertyValue("--ink").trim()); rope.setAttribute("stroke", c.getPropertyValue("--ink-2").trim()); };
  fill(); window.addEventListener("themechange", fill);
  function draw() {
    A.setAttribute("cx", pa.x); A.setAttribute("cy", pa.y); B.setAttribute("cx", pb.x); B.setAttribute("cy", pb.y);
    const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
    const d = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    const sag = Math.max(0, 140 - d * 0.25);
    if (d < 70) {
      // el nudo: un lazo doble alrededor del punto medio
      const r = 26 + Math.sin(t) * 2;
      rope.setAttribute("d", `M ${pa.x} ${pa.y} C ${mx - 60} ${my - 60}, ${mx + r} ${my - r * 1.6}, ${mx + r} ${my} S ${mx - r * 1.4} ${my + r * 1.3}, ${mx - r} ${my} S ${mx + r * 1.6} ${my - r * 1.2}, ${mx} ${my + r * .4} C ${mx + 30} ${my + 60}, ${pb.x + 40} ${pb.y + 40}, ${pb.x} ${pb.y}`);
    } else {
      rope.setAttribute("d", `M ${pa.x} ${pa.y} Q ${mx} ${my + sag} ${pb.x} ${pb.y}`);
    }
    if (d < 70 && !tied) {
      tied = true; box.classList.add("is-tied");
      if (!reduce) gsap.fromTo([A, B], { scale: 1.6, transformOrigin: "center" }, { scale: 1, duration: 0.6, ease: "elastic.out(1, .4)" });
    }
    if (d >= 90 && tied) { tied = false; box.classList.remove("is-tied"); }
  }
  const toSvg = (e) => { const r = svg.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * VW, y: ((e.clientY - r.top) / r.height) * VH }; };
  box.addEventListener("pointerdown", (e) => {
    const p = toSvg(e);
    drag = Math.hypot(p.x - pa.x, p.y - pa.y) < Math.hypot(p.x - pb.x, p.y - pb.y) ? pa : pb;
    box.setPointerCapture(e.pointerId); move(e);
  });
  const move = (e) => { if (!drag) return; const p = toSvg(e); drag.x = Math.max(16, Math.min(VW - 16, p.x)); drag.y = Math.max(16, Math.min(VH - 16, p.y)); draw(); };
  box.addEventListener("pointermove", move);
  box.addEventListener("pointerup", () => { drag = null; });
  draw();
  if (!reduce) gsap.ticker.add(() => { if (tied) { t += 0.05; draw(); } });
}

/* ---------- experimentos: pila que se apila ---------- */
function initStack() {
  if (reduce || window.matchMedia("(max-width: 900px)").matches) return;
  const cards = $$(".exp");
  // marcadores estáticos: las tarjetas son sticky y medirlas a ellas da posiciones falsas
  const marks = cards.map((c) => { const m = document.createElement("div"); m.className = "exp-mark"; c.before(m); return m; });
  cards.forEach((card, i) => {
    if (i === cards.length - 1) return;
    gsap.fromTo(card.querySelector(".exp__card"), { scale: 1, opacity: 1, filter: "blur(0px)" }, {
      scale: 0.92, opacity: 0, filter: "blur(3px)", ease: "none", immediateRender: false,
      scrollTrigger: { trigger: marks[i + 1], start: "top bottom", end: "top 10%", scrub: true },
    });
  });
}

/* ---------- vídeos: solo se reproducen si se ven ---------- */
function initVideos() {
  const io = new IntersectionObserver((ens) => ens.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) { if (v.preload === "none") v.preload = "auto"; const p = v.play(); if (p) p.catch(() => {}); }
    else v.pause();
  }), { rootMargin: "120px" });
  $$("video").forEach((v) => { if (reduce) { v.removeAttribute("autoplay"); v.pause(); return; } io.observe(v); });
}

/* ---------- marquesina ---------- */
function initMarquee() {
  const m = $("#marquee");
  m.innerHTML += m.innerHTML;
  if (reduce) return;
  const tween = gsap.to(m, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    trigger: m, start: "top bottom", end: "bottom top",
    onUpdate: (s) => { const v = s.getVelocity() / 250; gsap.to(tween, { timeScale: (s.direction === -1 ? -1 : 1) * Math.min(5, 1 + Math.abs(v)), duration: 0.3, overwrite: true }); },
  });
}

/* ---------- aprendizajes ---------- */
function initLessons() {
  const box = $("#lessons");
  const step = () => box.querySelector(".lesson").getBoundingClientRect().width + 14;
  $("#lPrev").addEventListener("click", () => box.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }));
  $("#lNext").addEventListener("click", () => box.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }));
}

/* ---------- botones magnéticos ---------- */
function initMagnets() {
  if (reduce || !finePointer) return;
  $$(".magnet").forEach((b) => {
    const xTo = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3" });
    b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

/* ---------- contacto ---------- */
function initContact() {
  if (reduce) return;
  gsap.from("#contactBig span", { yPercent: 100, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: "#contactBig", start: "top 85%" } });
}

/* ---------- arranque general ---------- */
initField();
initManifesto();
initNudo();
initChart({ reduce });
initVom({ reduce });
initLabs({ reduce });
initStack();
initVideos();
initMarquee();
initLessons();
initMagnets();
initContact();
initTerminal({ lenis });
initRoles();

boot().then(() => {
  initHeroName();
  initReveals();
  if (!reduce) gsap.from(".hero__side > *", { opacity: 0, y: 30, duration: 1, ease: "expo.out", stagger: 0.1, delay: 0.3 });
  ScrollTrigger.refresh();
});

window.addEventListener("load", () => ScrollTrigger.refresh());
