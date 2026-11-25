# Poker Lab — Texas Hold'em Training Environment

## Estructura

El proyecto se ha dividido desde el archivo único original en HTML, estilos y lógica:

```
index.html                 Punto de entrada (solo HTML + carga de estilos/scripts)
css/styles.css             Estilos personalizados (naipes, tapete, scrollbar, feedback)
assets/Chips/              Sprites originales de fichas + copias con transparencia
js/
  tailwind-config.js       Configuración de Tailwind (CDN)
  state.js                 Estado global y persistencia en localStorage
  sound.js                 Motor de sonidos sintetizados (Web Audio API)
  poker-engine.js          Baraja, evaluador de manos, outs y Monte Carlo
  ui.js                    Render de cartas, toasts, badges y navegación
  academia.js              Lecciones y desafíos
  lab.js                   Laboratorio (equity, outs, EV)
  game.js                  Mesa, bots, reloj, calificación EV y feedback
  gto.js                   Matriz de rangos GTO
  arena.js                 Pantalla completa (Fullscreen API + fallback CSS)
  grade-popup.js           Pop-up de calificación monocromático (3.5 s)
  eyeball-hud.js           HUD flotante «ojito» street-aware
  stats.js                 Estadísticas e historial
  config.js                Configuración
  main.js                  Inicialización y activación de audio
```

## Cómo abrirlo

Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000
# http://localhost:8000/index.html
```

Tailwind se carga desde CDN, por lo que hace falta conexión a internet.

## Cambios respecto al original

- Misma funcionalidad y aspecto, con el código separado por responsabilidades.
- Orden de botones de acción: **Apostar/Subir → Pasar/Pagar → Retirarse (Fold)**.
- Motor de sonido ampliado: UI, cartas, fichas, all-in, showdown, victoria/derrota,
  calificación de jugadas (`!! ! ✓ ?! ? ??`) y reloj (avisos a 10 s y 5 s, ticks,
  tiempo agotado y cuenta atrás de la siguiente mano). El audio se activa solo tras
  la primera interacción, como exigen los navegadores.
- Feedback visual breve en el botón pulsado: verde (jugada buena), ámbar (normal),
  rojo (mala).
- Se implementó `startHeroTimer()`, que era llamado pero no existía: ahora el reloj
  de 60 s funciona y un tiempo agotado se penaliza en la calificación.

## Mejoras de interfaz y análisis

- **Fullscreen Arena:** botón **⛶ Pantalla Completa** en la barra superior de
  partidas. Expanden el tapete, el HUD, los pop-ups y la botonera; la barra
  superior de la arena muestra ciegas, audio y **✕ Salir Pantalla Completa**.
  Usa la Fullscreen API nativa con fallback CSS (`is-arena`); `Esc` también sale.
- **HUD «ojito» 👁️ / 🙈:** botón flotante abajo a la derecha de la mesa que
  despliega una única columna vertical de tarjetitas hacia arriba
  (`grid-cols-1`, glassmorphism), sin expansión horizontal.
  - Preflop: mano, posición (UTG/MP/CO/BTN/SB/BB) y contexto (RFI o facing
    raise), con frecuencias GTO de RAISE/CALL/FOLD. Sólo se muestran las
    acciones con porcentaje `> 0%`.
  - Postflop: sin GTO preflop; muestra EQUITY, POT ODDS, OUTS (sólo Flop/Turn)
    y EV MAX en BB, calculados en el turno del Héroe.
  - Sólo cuadritos de datos: sin textos explicativos; el detalle sigue en el
    Coach cuando se scrollea hasta la calificación de la jugada.
- **Fichas visibles:** montoncitos de fichas para la apuesta de cada jugador y
  para el bote, tanto en vista normal como en Fullscreen Arena. Usan los assets
  de `assets/Chips/` (hoja `ChipsA_Outline`, 5×2 stacks de 64×72 px); se
  generaron copias con el fondo teal transparente
  (`chips-outline-transparent.png`, `chips-flat-transparent.png`) sin modificar
  los originales. Cada color tiene un valor fijo — gris 1, rojo 5, verde 25,
  azul 100, negro 500, amarillo 1000 — y el importe se descompone de forma
  greedy, así que 2 fichas azules significan siempre 200. El tooltip de cada
  montón muestra el desglose. Todas las fichas miden lo mismo (32×36 px),
  incluidas las del bote: los montones crecen apilando más fichas.
  Cada montón tiene como máximo 5 fichas; si sobran, se forma otro montón al
  lado (hasta 3 en cada jugador y 5 en el bote). Si aún no caben, se muestra una
  tarjeta con el importe en fichas. El all-in se representa con una tarjeta
  triangular con el importe.
- **Ciclo de mano:** al decidirse el ganador se resalta su asiento y se reparte
  una nueva mano automáticamente tras 10 s. El botón **🃏 Nueva Mano** debajo
  del ganador permite saltarse la espera (también dentro de la arena).
- **Pop-up de calificación:** etiqueta corta monocromática y unificada en la
  parte superior central (`!! BRILLANTE`, `! EXCELENTE`, `✓ ÓPTIMA`,
  `?! IMPRECISA`, `? ERROR`, `?? PÉSIMA`) con el porcentaje de acierto.
  Desaparece a los 3.5 s. La explicación EV detallada y la comparativa por
  acción siguen únicamente en el panel del Coach.
