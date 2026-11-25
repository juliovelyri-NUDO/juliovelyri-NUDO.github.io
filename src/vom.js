import gsap from "gsap";

const CARDS = [
  { q: "Un portátil de 2015 estudia por mí por las noches.", t: true, a: "91 fuentes y 91 lecciones con una IA que vive en el propio portátil, sin coste por uso. Por la mañana, Claude le corrige los deberes." },
  { q: "NUDO la diseñó una agencia.", t: false, a: "La diseñamos Claude y yo. Una agencia no cabría en un techo de 40 $ al mes." },
  { q: "NUDO no tiene ni un desarrollador en nómina.", t: true, a: "Yo llevo el producto y Claude escribe el código. 75 días desde la primera línea hasta enviarla a las tiendas." },
  { q: "Tengo un robot que va al gimnasio por mí.", t: false, a: "Eso todavía lo hago yo. 56 sesiones de fuerza y HYROX desde agosto. Ojalá." },
  { q: "Mi correo se revisa solo dos veces al día.", t: true, a: "A las 9:00 y a las 21:00. Tira la basura, crea tareas y contesta lo rutinario. Si un correo intenta engañar a la IA, un guardián lo bloquea." },
  { q: "Corrí 30 km un día que el plan decía 26.", t: true, a: "Lo llamé desobediencia. Claude lo convirtió en regla: los tres primeros kilómetros, nunca más rápido de 5:25." },
  { q: "Mis agentes publican en mis redes sin preguntarme.", t: false, a: "Pueden dejarlo todo preparado y programado. El sí final siempre es mío." },
  { q: "50 vídeos se montaron en una noche sin que yo abriera un editor.", t: true, a: "Claude manejó la app de edición de Instagram por mí. Yo los revisé por la mañana y descarté dos." },
];

export function initVom({ reduce }) {
  const deck = document.getElementById("deck");
  const score = document.getElementById("vomScore");
  const bT = document.getElementById("btnTrue"), bL = document.getElementById("btnLie");
  let i = 0, ok = 0, flipped = false;

  function render() {
    deck.innerHTML = "";
    // tres cartas visibles, la de arriba la última
    for (let k = Math.min(CARDS.length - 1, i + 2); k >= i; k--) {
      const c = CARDS[k];
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `<div class="card__n"><span>${String(k + 1).padStart(2, "0")} de ${CARDS.length}</span><span class="card__verdict ${c.t ? "t" : ""}">${c.t ? "VERDAD" : "MENTIRA"}</span></div><p class="card__q">${c.q}</p><p class="card__a">${c.a}</p>`;
      const depth = k - i;
      gsap.set(el, { y: depth * 14, scale: 1 - depth * 0.04, opacity: depth > 1 ? 0.5 : 1, zIndex: 10 - depth });
      deck.appendChild(el);
    }
  }

  function answer(guess) {
    if (i >= CARDS.length) { i = 0; ok = 0; score.textContent = ""; bT.textContent = "Verdad"; bL.style.display = ""; render(); return; }
    const top = deck.lastElementChild;
    if (!flipped) {
      const right = guess === CARDS[i].t;
      if (right) ok++;
      flipped = true;
      top.classList.add("is-flipped");
      score.textContent = `${right ? "Acertaste." : "Fallaste."} Llevas ${ok} de ${i + 1}.`;
      if (!reduce) gsap.fromTo(top, { rotateX: 12 }, { rotateX: 0, duration: 0.6, ease: "expo.out" });
      bT.textContent = "Siguiente"; bL.style.display = "none";
      return;
    }
    flipped = false;
    const out = top;
    const go = () => {
      i++;
      if (i >= CARDS.length) {
        deck.innerHTML = `<div class="card"><div class="card__n"><span>resultado</span></div><p class="card__q">${ok} de ${CARDS.length}. ${ok >= 7 ? "Me conoces mejor que mi calendario." : ok >= 5 ? "Nada mal para no conocerme." : "Normal. A mí también me cuesta creérmelo."}</p><p class="card__a" style="display:block">${CARDS.filter((c) => c.t).length} eran verdad. Ni robot, ni agencia, ni agentes con permiso para publicar.</p></div>`;
        bT.textContent = "Otra vez"; bL.style.display = "none";
        return;
      }
      render();
      bT.textContent = "Verdad"; bL.style.display = "";
    };
    if (reduce) go();
    else gsap.to(out, { x: 520, rotate: 14, opacity: 0, duration: 0.5, ease: "power2.in", onComplete: go });
  }

  bT.addEventListener("click", () => answer(true));
  bL.addEventListener("click", () => answer(false));
  render();
}
