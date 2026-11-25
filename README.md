# Web personal de Julio Velasco

Portfolio personal: NUDO, la preparación de la maratón y los experimentos con IA.

- En vivo: https://juliovelyri-nudo.github.io/
- Hecho con Vite, GSAP, Lenis y tipografías Archivo, Geist y Gloock (todo autoalojado).
- Se publica solo en GitHub Pages con cada push a `main` (ver `.github/workflows/deploy.yml`).

## Trabajar en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Dónde se cambia cada cosa

- Textos y estructura: `index.html`
- Estilos y colores (tokens en `:root`): `src/style.css`
- Animaciones generales, hero y pila de experimentos: `src/main.js`
- Juego «¿Verdad o mentira?»: `src/vom.js`
- Gráfica de km de la maratón (datos semana a semana): `src/chart.js`
- Los mini-juegos de cada experimento: `src/labs.js`
- Terminal oculta (tecla º o ~): `src/term.js`
- Vídeos y capturas: `public/media/` y `public/nudo/`

## Privacidad

Nada de correos, nombres de terceros, claves ni datos médicos más allá de «rodilla». Los correos del juego de correo son inventados.
