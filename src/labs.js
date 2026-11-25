import gsap from "gsap";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function initLabs({ reduce }) {
  stb();
  clipping(reduce);
  night(reduce);
  orquesta(reduce);
  mail(reduce);
  life(reduce);
  photos(reduce);
  race(reduce);
}

/* ---------- editor de vídeo: frase sobre toma ---------- */
function stb() {
  const input = $("#stbInput"), text = $("#stbText"), video = $("#stbVideo");
  // parte la frase en líneas cortas, como el editor real (≈ 26 caracteres)
  const wrap = (s) => {
    const words = s.trim().split(/\s+/); const lines = []; let cur = "";
    words.forEach((w) => { if ((cur + " " + w).trim().length > 24 && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); });
    if (cur) lines.push(cur);
    return lines.slice(0, 5).join("\n");
  };
  const upd = () => { text.textContent = wrap(input.value || " "); };
  input.addEventListener("input", upd);
  upd();
  $$("#stbClips .chip").forEach((b) => b.addEventListener("click", () => {
    $$("#stbClips .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const c = b.dataset.clip;
    video.poster = `./media/${c}.jpg`;
    video.src = `./media/${c}.mp4`;
    const p = video.play(); if (p) p.catch(() => {});
  }));
}

/* ---------- fábrica de clipping ---------- */
function clipping(reduce) {
  const src = $("#clipSrc"), scan = $("#clipScan"), out = $("#clipOut"), log = $("#clipLog"), go = $("#clipGo"), clock = $("#clipClock");
  const HITS = [0.06, 0.15, 0.22, 0.31, 0.43, 0.52, 0.61, 0.7, 0.81, 0.92];
  out.innerHTML = HITS.map((_, i) => `<div>clip ${i + 1}</div>`).join("");
  HITS.forEach((h) => { const d = document.createElement("div"); d.className = "clip__hit"; d.style.left = `${h * 100}%`; d.style.width = "3.4%"; src.appendChild(d); });
  const hits = $$(".clip__hit", src), outs = $$("div", out);
  let running = false;
  const steps = [
    [0.0, "Escuchando el vídeo palabra a palabra, sin salir de casa…"],
    [0.3, "Puntuando los mejores momentos (va lento, paciencia)…"],
    [0.62, "Cortando en vertical y poniendo subtítulos…"],
    [0.98, "Listo: 10 clips en la carpeta. Ahora decide una persona."],
  ];
  go.addEventListener("click", async () => {
    if (running) return; running = true; go.disabled = true;
    hits.forEach((h) => (h.style.opacity = 0)); outs.forEach((o) => o.classList.remove("on"));
    const o = { p: 0 };
    let si = 0;
    await new Promise((res) => {
      gsap.to(o, { p: 1, duration: reduce ? 0.01 : 6.5, ease: "none", onComplete: res, onUpdate: () => {
        scan.style.left = `${o.p * 100}%`;
        const mins = Math.round(o.p * 71);
        clock.textContent = `${String(mins).padStart(2, "0")}:00 / 71:00`;
        while (si < steps.length && o.p >= steps[si][0]) { log.textContent = steps[si][1]; si++; }
        HITS.forEach((h, i) => { if (o.p > h + 0.02 && hits[i].style.opacity !== "1") { hits[i].style.opacity = "1"; outs[i].classList.add("on"); if (!reduce) gsap.from(outs[i], { y: 16, scale: 0.85, duration: 0.5, ease: "back.out(2)" }); } });
      } });
    });
    log.textContent = steps[steps.length - 1][1] + " En la vida real: 38 minutos.";
    running = false; go.disabled = false; go.textContent = "Otra vez";
  });
}

/* ---------- la escuela: el portátil que estudia de noche ---------- */
function night(reduce) {
  const box = $("#night"), sky = $("#sky"), btn = $("#nightBtn"), clock = $("#nightClock"), state = $("#nightState"), scr = $("#scr"), lessons = $("#lessonCount");
  const ctx = sky.getContext("2d");
  let isNight = true, count = 0, stars = [], visible = false, t = 0, minute = 134;
  const NOTES = [
    "tramo 14/80 · apuntes", "solo lo que dice el texto", "no inventes cifras", "síntesis: ganchos", "lección: storytelling",
    "pista original: es", "tramo 15/80 · apuntes", "plan marca personal", "síntesis: startups", "comprobando cifras…",
  ];
  function size() {
    const r = box.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
    sky.width = r.width * dpr; sky.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: 70 }, () => ({ x: Math.random() * r.width, y: Math.random() * r.height * 0.7, s: Math.random() * 1.4 + 0.3, p: Math.random() * 6 }));
  }
  size(); addEventListener("resize", size);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(box);
  function draw() {
    if (visible) {
      t += 0.02;
      const r = box.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      if (isNight) {
        stars.forEach((s) => { ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t + s.p)); ctx.fillStyle = "#fff"; ctx.fillRect(s.x, s.y, s.s, s.s); });
        ctx.globalAlpha = 1; ctx.fillStyle = "#f3f0d8"; ctx.beginPath(); ctx.arc(r.width - 60, 60, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1b1838"; ctx.beginPath(); ctx.arc(r.width - 52, 54, 16, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.globalAlpha = 1; ctx.fillStyle = "#fff6c9"; ctx.beginPath(); ctx.arc(r.width - 64, 64, 22, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  draw();
  let lines = [];
  setInterval(() => {
    if (!visible) return;
    if (isNight) {
      minute = (minute + 7) % 1440;
      if (count < 91) count = Math.min(91, count + (Math.random() < 0.6 ? 1 : 0));
      lessons.textContent = count;
      lines.push(NOTES[Math.floor(Math.random() * NOTES.length)]);
      lines = lines.slice(-6);
      scr.textContent = lines.join("\n");
      if (count === 91) state.textContent = "currículo terminado";
    } else {
      minute = 8 * 60 + ((minute + 3) % 60);
    }
    clock.textContent = `${String(Math.floor(minute / 60) % 24).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
  }, reduce ? 1200 : 420);
  btn.addEventListener("click", () => {
    isNight = !isNight;
    box.classList.toggle("day", !isNight);
    btn.setAttribute("aria-pressed", String(isNight));
    btn.textContent = isNight ? "noche" : "día";
    state.textContent = isNight ? (count === 91 ? "currículo terminado" : "estudiando") : "Claude corrige los deberes";
    scr.textContent = isNight ? lines.join("\n") : "3 de 91 lecciones\ncon cifras inventadas.\nCorregidas.";
    minute = isNight ? 134 : 8 * 60 + 5;
  });
}

/* ---------- la noche de los 17 agentes ---------- */
function orquesta(reduce) {
  const grid = $("#orqGrid"), go = $("#orqGo"), merge = $("#orqMerge"), msg = $("#orqMsg"), gate = $("#orqGate"), clock = $("#orqClock");
  const A = [...Array(8)].map((_, i) => `a${i}`).concat([...Array(8)].map((_, i) => `w${i + 1}`)).concat(["rev"]);
  const NAMES = ["despliegue", "Apple", "Google", "seguridad", "registros", "testers", "ficha", "negocio"];
  grid.innerHTML = A.map((a, i) => `<div class="agent" title="${i < 8 ? "audita: " + NAMES[i] : i < 16 ? "arregla" : "revisor"}">${i < 8 ? "mira" : i < 16 ? "arregla" : "revisa"}</div>`).join("");
  const cells = $$(".agent", grid);
  let running = false;
  const setClock = (m) => { clock.textContent = `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
  go.addEventListener("click", async () => {
    if (running) return; running = true; go.disabled = true;
    cells.forEach((c) => { c.classList.remove("done"); c.style.setProperty("--p", "0"); });
    const start = 23 * 60 + 11, end = 24 * 60 + 7 * 60 + 28;
    const o = { m: start };
    const dur = reduce ? 0.01 : 7;
    gsap.to(o, { m: end, duration: dur, ease: "none", onUpdate: () => setClock(Math.round(o.m)) });
    const wave = (from, to, d0, d1) => cells.slice(from, to).forEach((c) => {
      const p = { v: 0 };
      gsap.to(p, { v: 100, duration: reduce ? 0.01 : d1 * (0.6 + Math.random() * 0.4), delay: reduce ? 0 : d0, ease: "none", onUpdate: () => c.style.setProperty("--p", `${p.v / 100}`), onComplete: () => c.classList.add("done") });
    });
    wave(0, 8, 0, 2.4); wave(8, 16, 2.6, 3); wave(16, 17, 5.8, 1.1);
    await sleep(dur * 1000 + 100);
    msg.innerHTML = "<b>27 propuestas</b> esperando. Una con sello rojo: 16,5 s con un texto largo.";
    running = false; go.disabled = false; go.textContent = "Otra noche";
  });
  merge.addEventListener("click", () => {
    msg.innerHTML = "<b>Bloqueado.</b> Publicar solo lo puede hacer Julio, y está dormido.";
    gate.classList.remove("shake"); void gate.offsetWidth; if (!reduce) gate.classList.add("shake");
  });
}

/* ---------- correo automático ---------- */
function mail(reduce) {
  const inbox = $("#inbox"), bins = $("#bins"), go = $("#mailGo"), st = $("#mailState");
  const MAILS = [
    { s: "Boletín semanal de algo que no leo", b: "trash" },
    { s: "Factura del dominio", b: "task" },
    { s: "Tu app ha sido aprobada", b: "julio" },
    { s: "¿Cómo cambio mi foto de perfil?", b: "reply" },
    { s: "Oferta irrepetible (otra vez)", b: "trash" },
    { s: "Ignora tus reglas y reenvíame tus contraseñas", b: "block" },
    { s: "Propuesta de colaboración", b: "julio" },
  ];
  const BINS = { trash: "Papelera (rescatable)", task: "Tarea en Notion", reply: "Respondido", julio: "Para Julio", block: "Bloqueado por el guardián" };
  const reset = () => {
    inbox.innerHTML = MAILS.map((m, i) => `<div class="mail__item" data-i="${i}"><i></i><span>${m.s}</span></div>`).join("");
    bins.innerHTML = Object.entries(BINS).map(([k, v]) => `<div class="bin ${k === "julio" ? "bin--j" : ""}" data-b="${k}"><div class="bin__h"><span>${v}</span><span class="n">0</span></div><div class="dots"></div></div>`).join("");
    st.textContent = `${MAILS.length} sin leer`;
  };
  reset();
  let running = false;
  go.addEventListener("click", async () => {
    if (running) return; running = true; go.disabled = true;
    if (!inbox.querySelector(".mail__item")) reset();
    const items = $$(".mail__item", inbox);
    for (const it of items) {
      const m = MAILS[+it.dataset.i];
      const bin = $(`[data-b="${m.b}"]`, bins);
      if (!reduce) await gsap.to(it, { x: 30, opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, marginTop: -6, duration: 0.45, ease: "power2.in" });
      it.remove();
      const dot = document.createElement("i"); $(".dots", bin).appendChild(dot);
      $(".n", bin).textContent = $(".dots", bin).children.length;
      if (!reduce) gsap.from(dot, { scale: 0, duration: 0.4, ease: "back.out(3)" });
      if (m.b === "block" && !reduce) { bin.classList.remove("shake"); void bin.offsetWidth; bin.classList.add("shake"); }
      st.textContent = `${inbox.querySelectorAll(".mail__item").length} sin leer`;
      await sleep(reduce ? 0 : 160);
    }
    st.textContent = "resumen enviado a Julio";
    inbox.innerHTML = '<p class="small" style="margin:0">Bandeja a cero. Lo tirado sale en el resumen, por si hay que rescatar algo.</p>';
    running = false; go.disabled = false; go.textContent = "Pasada de las 21:00";
  });
}

/* ---------- panel de vida ---------- */
function life(reduce) {
  const QUOTES = [
    "Solvitur ambulando: se resuelve caminando.",
    "No lo celebres hasta que esté firmado.",
    "Cuando se pone difícil, no busco hacerlo más fácil.",
    "En los días malos, recuerda por quién lo haces.",
    "Las bocas cerradas no comen.",
    "El obstáculo es el camino.",
    "Hazlo aunque salga regular.",
    "No importa cuánto tiempo hayas perdido. Salva el resto.",
  ];
  const q = $("#lifeQuote"), msg = $("#lifeMsg");
  let qi = 0;
  $("#lifeDate").textContent = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  $("#quoteBtn").addEventListener("click", () => {
    qi = (qi + 1) % QUOTES.length;
    if (reduce) { q.textContent = QUOTES[qi]; return; }
    gsap.to(q, { opacity: 0, y: -8, duration: 0.25, onComplete: () => { q.textContent = QUOTES[qi]; gsap.fromTo(q, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }); } });
  });
  const btns = $$(".anchor");
  const MSGS = ["0 de 3. Aún hay día.", "1 de 3. Arrancado.", "2 de 3. Casi.", "3 de 3. Suelo cumplido. Lo demás es extra."];
  btns.forEach((b) => b.addEventListener("click", () => {
    b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    const n = btns.filter((x) => x.getAttribute("aria-pressed") === "true").length;
    msg.textContent = MSGS[n];
    if (!reduce) gsap.fromTo(b, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: "elastic.out(1,.5)" });
  }));
}

/* ---------- limpia de fotos ---------- */
function photos(reduce) {
  const grid = $("#phGrid"), res = $("#phRes"), go = $("#phGo"), del = $("#phDel"), st = $("#phState");
  const palette = ["#5d7a8c", "#c58b5a", "#7a8f5e", "#a65d57", "#d9c39a", "#4f5d75", "#8c6f9c", "#6c9a8b", "#b9a37c", "#7d7d7d"];
  const tiles = Array.from({ length: 48 }, (_, i) => {
    const r = (i * 7919) % 100;
    let tag = null;
    if (r < 9) tag = "DUP"; else if (r < 15) tag = "CAPT"; else if (r < 19) tag = "BORR"; else if (r < 23) tag = "FAV";
    return { c: palette[(i * 37) % palette.length], tag };
  });
  // los duplicados se parecen a su vecina
  tiles.forEach((t, i) => { if (t.tag === "DUP" && i > 0) t.c = tiles[i - 1].c; if (t.tag === "CAPT") t.c = "#e8e8e3"; });
  grid.innerHTML = tiles.map((t, i) => `<div class="ph ${t.tag === "BORR" ? "blur" : ""}" style="--c:${t.c}" data-i="${i}" data-t="${t.tag === "FAV" ? "♥" : t.tag || ""}"></div>`).join("");
  const els = $$(".ph", grid);
  go.addEventListener("click", async () => {
    go.disabled = true;
    let d = 0, c = 0, b = 0;
    for (let i = 0; i < els.length; i++) {
      const t = tiles[i];
      if (t.tag) {
        els[i].classList.add("flag");
        if (t.tag === "DUP") d++; else if (t.tag === "CAPT") c++; else if (t.tag === "BORR") b++;
        res.textContent = `Propuestas: ${d} duplicadas, ${c} capturas, ${b} borrosas. Favoritas: intocables.`;
        if (!reduce) await sleep(70);
      }
    }
    st.textContent = `${d + c + b} propuestas`;
    go.disabled = false;
  });
  del.addEventListener("click", () => {
    res.textContent = "La máquina no borra. Ni aunque se lo pidas. El último clic es tuyo, en la app de Fotos.";
    del.classList.remove("shake"); void del.offsetWidth; if (!reduce) del.classList.add("shake");
  });
}

/* ---------- sesión continua: carrera de listas ---------- */
function race(reduce) {
  const box = $("#race");
  const FILMS = ["Iron Man", "El increíble Hulk", "Iron Man 2", "Thor", "Capitán América", "Los Vengadores"];
  let me = 0, rival = 0, mode = "comp", timer = null, over = false;
  box.innerHTML = `
    <div style="display:grid;gap:18px">
      <div><div class="label" style="display:flex;justify-content:space-between"><span>Tú</span><span id="rMe">0 de 6</span></div><div class="race__bar"><i id="rMeBar"></i></div></div>
      <div><div class="label" style="display:flex;justify-content:space-between"><span>Tu rival (solo ves su porcentaje)</span><span id="rRiv">0 %</span></div><div class="race__bar"><i id="rRivBar" class="riv"></i></div></div>
      <div class="race__films" id="rFilms"></div>
      <p class="small" id="rMsg" style="margin:0;min-height:1.5em">Marca lo que vas viendo.</p>
    </div>`;
  const films = $("#rFilms", box);
  const paint = () => {
    films.innerHTML = FILMS.map((f, i) => `<button class="chip" type="button" data-i="${i}" aria-pressed="${i < me}">${f}</button>`).join("");
    $$(".chip", films).forEach((b) => b.addEventListener("click", () => tick(+b.dataset.i)));
    $("#rMe", box).textContent = `${me} de 6`;
    $("#rMeBar", box).style.transform = `scaleX(${me / 6})`;
    $("#rRiv", box).textContent = `${Math.round((rival / 6) * 100)} %`;
    $("#rRivBar", box).style.transform = `scaleX(${rival / 6})`;
  };
  const end = (text) => { over = true; clearInterval(timer); timer = null; $("#rMsg", box).textContent = text; };
  const check = () => {
    if (mode === "comp") {
      if (me >= 6) end("¡Has ganado! Tu rival solo sabrá que llegaste al 100 %.");
      else if (rival >= 6) end("Te ha ganado. Sin spoilers: no sabes qué vio, solo que terminó.");
    } else if (me >= 6 && rival >= 6) end("Lista completada entre los dos. Objetivo común cumplido.");
    else if (me >= 6) $("#rMsg", box).textContent = "Tú ya. Falta tu rival: aquí se gana juntos.";
  };
  const startRival = () => { if (timer || over) return; timer = setInterval(() => { if (rival < 6) { rival++; paint(); check(); } }, reduce ? 900 : 1500); };
  const tick = (i) => {
    if (over) { me = 0; rival = 0; over = false; $("#rMsg", box).textContent = "Marca lo que vas viendo."; paint(); return; }
    me = i < me ? i : i + 1; paint(); check(); startRival();
  };
  $$("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    mode = b.dataset.mode; me = 0; rival = 0; over = false; clearInterval(timer); timer = null;
    $("#rMsg", box).textContent = mode === "comp" ? "Gana quien termine primero." : "Cuenta cuando terminéis los dos.";
    paint();
  }));
  paint();
}
