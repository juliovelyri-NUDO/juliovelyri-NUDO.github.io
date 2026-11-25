import gsap from "gsap";

// km por semana: suma de las sesiones de carrera registradas (a 25-nov-2026).
// plan = referencia de cada momento (Excel de julio, Runna, guía de octubre).
const WEEKS = [
  { l: "20 jul", km: 11.6, plan: 53.5, long: 7, note: "El Excel pedía 52-55 km" },
  { l: "27 jul", km: 3.0, plan: 56.5, long: 3, note: "El Excel pedía 55-58 km" },
  { l: "3 ago", km: 6.0, long: 6, note: "Rodilla. Se para todo el día 7", ann: "rodilla" },
  { l: "10 ago", km: 15.2, long: 5.1, note: "Tres pruebas de 5 km" },
  { l: "S1", km: 23.0, long: 15.1, note: "Arranca el plan" },
  { l: "S2", km: 23.7, long: 7.7 },
  { l: "S3", km: 30.8, long: 14.1 },
  { l: "S4", km: 26.7, long: 11.5 },
  { l: "S5", km: 41.3, long: 32.1, note: "Reto 50K: paro en el km 32", ann: "50K, paro en el 32" },
  { l: "S6", km: 40.6, plan: 32.5, long: 15.5, note: "La descarga que no lo fue" },
  { l: "S7", km: 26.7, plan: 28, long: 10.2, note: "10K en modo acompañante", ann: "10K" },
  { l: "S8", km: 43.0, plan: 42.5, long: 19.6, note: "La carrera cambia de fecha", ann: "nueva fecha" },
  { l: "S9", km: 36.8, plan: 46, long: 17.7, note: "La rodilla avisa otra vez" },
  { l: "S10", km: 41.9, plan: 36, long: 22.5, note: "Meta nueva: 3:45" },
  { l: "S11", km: 56.6, plan: 50, long: 30.2, note: "30,2 km cuando tocaban 26" },
  { l: "S12", km: 49.1, plan: 50.5, long: 35.0, note: "Ensayo de 35 km", ann: "35 km" },
  { l: "S13", km: 28.0, plan: 31, long: 11.7, note: "Descarga de verdad" },
  { l: "S14", km: 60.5, plan: 52.5, long: 34, note: "Pico del bloque", ann: "pico 60,5" },
  { l: "S15", km: 38.3, plan: 40, future: true, note: "Bajada (en curso)" },
  { l: "S16", km: 32, plan: 32, future: true, note: "Taper" },
  { l: "S17", km: 55.7, plan: 55.7, future: true, note: "Semana de carrera: 42,2 el domingo", ann: "maratón" },
];

const fmt = (n) => n.toLocaleString("es-ES", { maximumFractionDigits: 1 });

export function initChart({ reduce }) {
  const host = document.getElementById("chart");
  const tip = document.getElementById("chartTip");
  const W = 1200, H = 440, padL = 34, padB = 34, padT = 70, max = 65;
  const n = WEEKS.length, slot = (W - padL) / n, bw = slot * 0.62;
  const y = (km) => H - padB - (km / max) * (H - padB - padT);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kilómetros por semana desde julio hasta la maratón">`;
  s += `<g class="axis">`;
  [0, 20, 40, 60].forEach((v) => { s += `<line x1="${padL}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" opacity=".08"/><text x="0" y="${y(v) + 4}">${v}</text>`; });
  s += `</g><g class="bars">`;
  WEEKS.forEach((w, i) => {
    const x = padL + i * slot + (slot - bw) / 2;
    s += `<rect class="bar ${w.future ? "plan" : "real"}" data-i="${i}" x="${x}" y="${y(w.km)}" width="${bw}" height="${y(0) - y(w.km)}" rx="4"/>`;
    s += `<text class="axis" x="${x + bw / 2}" y="${H - 10}" text-anchor="middle" fill="currentColor" style="font-family:var(--f-mono);font-size:10.5px;fill:var(--mute)">${w.l}</text>`;
  });
  s += `</g><g class="ghost" opacity="0">`;
  // el plan de julio y el posterior no están unidos: dos tramos
  const july = WEEKS.slice(0, 2).map((w, i) => `${i ? "L" : "M"}${padL + i * slot + slot / 2},${y(w.plan)}`).join(" ");
  const later = WEEKS.map((w, i) => ({ w, i })).filter((o) => o.i > 1 && o.w.plan != null).map((o, k) => `${k ? "L" : "M"}${padL + o.i * slot + slot / 2},${y(o.w.plan)}`).join(" ");
  s += `<path d="${july}" fill="none" stroke="var(--acc-ink)" stroke-width="2.5" stroke-dasharray="6 6"/>`;
  s += `<path d="${later}" fill="none" stroke="var(--acc-ink)" stroke-width="2.5" stroke-dasharray="6 6"/>`;
  WEEKS.forEach((w, i) => { if (w.plan == null) return; s += `<circle cx="${padL + i * slot + slot / 2}" cy="${y(w.plan)}" r="4" fill="var(--acc-ink)"/>`; });
  s += `<text x="${padL + slot * 2.2}" y="${y(56.5) - 4}" style="font-family:var(--f-mono);font-size:12px;fill:var(--acc-ink)">el plan de julio</text>`;
  s += `</g><g class="ann">`;
  WEEKS.forEach((w, i) => {
    if (!w.ann) return;
    const cx = padL + i * slot + slot / 2, top = y(w.km) - 10;
    const ly = Math.min(top, padT - 8 + (i % 2) * 22);
    s += `<line x1="${cx}" x2="${cx}" y1="${ly + 6}" y2="${top}"/><text x="${cx}" y="${ly}" text-anchor="middle">${w.ann}</text>`;
  });
  s += `</g></svg>`;
  host.insertAdjacentHTML("afterbegin", s);

  const bars = [...host.querySelectorAll(".bar")];
  const anns = host.querySelectorAll(".ann line, .ann text");
  if (!reduce) {
    gsap.set(bars, { scaleY: 0, transformOrigin: "50% 100%", transformBox: "fill-box" });
    gsap.set(anns, { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: host, start: "top 80%", end: "bottom 60%", scrub: 0.6 } })
      .to(bars, { scaleY: 1, ease: "power2.out", stagger: 0.06, duration: 0.5 })
      .to(anns, { opacity: 1, stagger: 0.03, duration: 0.2 }, 0.4);
  }

  bars.forEach((b) => {
    b.addEventListener("pointerenter", () => {
      const w = WEEKS[+b.dataset.i];
      tip.innerHTML = `${w.l} · ${w.future ? "previstos " : ""}${fmt(w.km)} km${w.long ? ` · larga ${fmt(w.long)}` : ""}${w.note ? `<br>${w.note}` : ""}`;
      const hr = host.getBoundingClientRect(), br = b.getBoundingClientRect();
      tip.style.left = `${br.left - hr.left + br.width / 2}px`;
      tip.style.top = `${br.top - hr.top}px`;
      tip.style.opacity = 1;
    });
    b.addEventListener("pointerleave", () => { tip.style.opacity = 0; });
  });

  const btn = document.getElementById("ghostBtn");
  const ghost = host.querySelector(".ghost");
  btn.addEventListener("click", () => {
    const on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? "Ocultar el plan" : "Comparar con el plan";
    gsap.to(ghost, { opacity: on ? 1 : 0, duration: reduce ? 0 : 0.5 });
  });
}
