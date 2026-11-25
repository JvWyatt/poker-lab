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
  academia.js              12 micro-clases interactivas sobre mini-mesa determinista
  lab.js                   Laboratorio (equity, outs, EV)
  game.js                  Mesa, bots, reloj, calificación EV y feedback
  gto.js                   Frecuencias mixtas GTO estilo Preflop Vision + matriz 13x13
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
  superior de la arena muestra ciegas, audio y un único botón **✕** para salir.
  Usa la Fullscreen API nativa con fallback CSS (`is-arena`); `Esc` también sale.
- **HUD «ojito» 👁️ / 🙈:** integrado en la **barra inferior de acciones**, a la
  misma altura que `Apostar/Subir`, `Pasar/Pagar` y `Retirarse`. El botón no
  flota sobre el tapete: abre tarjetitas horizontales (`h-9`, `min-w-[58px]`)
  dentro de `#game-controls-panel`, con glassmorphism y alineación exacta.
  - Preflop: frecuencias RAISE/CALL/FOLD de `GTOEngine`, con posición,
    secuencia (RFI / vs apertura / vs 3-Bet / defensa BB), tamaño de apertura,
    stack y MDF reales de la mano. Sólo se muestran acciones con `% > 0`.
  - Postflop: sin GTO preflop; muestra EQUITY, POT ODDS, OUTS (sólo Flop/Turn)
    y EV MAX en BB, calculados en el turno del Héroe.
  - Sólo cuadritos de datos: sin textos explicativos; el detalle sigue en el
    Coach cuando se scrollea hasta la calificación de la jugada.
- **GTO de frecuencias mixtas (estilo Preflop Vision):** `GTOEngine` es la
  única fuente de verdad de la matriz 13×13, el ojito y `gradeHeroMove`.
  Solo `AA-TT`, `AK`, `AQs` y la basura absoluta son puros (100 %); el resto
  de manos (AJo, ATo, KQo, KJs, QJs, JTs, 98s, 22-66, A5s-A2s...) devuelve
  mezclas graduales por posición. La vista GTO añade filtros de secuencia
  (RFI / vs open / vs 3-Bet / defensa BB), tamaño (2 / 2.5 / 3 BB) y stack
  (25 / 50 / 100 / 150 BB), con defensa ajustada por MDF.
  Es una aproximación determinista inspirada en la filosofía de las tablas
  de ZerosPoker; **no** son las tablas propietarias de su solver ni requieren
  suscripción. El EV preflop se matiza con la misma frecuencia para que el HUD
  y la calificación nunca se contradigan.
- **Fold equity de bots en Turn/River:** decisión con presión por tamaño
  (`betToPotRatio`), compromiso de stack, textura del board (color/escalera
  completadas) y tier de mano hecha. Nit/Weak-Tight foldean fácil; GTO/TAG
  defienden según MDF; Calling Station y Maníaco tienen topes (0.35 / 0.45).
  `game.lastBotDecision` expone el cálculo para depuración.
- **Fichas visibles:** montoncitos de fichas para la apuesta de cada jugador y
  para el bote, tanto en vista normal como en Fullscreen Arena. Usan los assets
  de `assets/Chips/` (hoja `ChipsA_Outline`, 5×2 stacks de 64×72 px); se
  generaron copias con el fondo teal transparente
  (`chips-outline-transparent.png`, `chips-flat-transparent.png`) sin modificar
  los originales. Cada color tiene un valor fijo — gris 1, rojo 5, verde 25,
  azul 100, negro 500, amarillo 1000 — y el importe se descompone de forma
  greedy, así que 2 fichas azules significan siempre 200. El tooltip de cada
  montón muestra el desglose. Todas las fichas miden lo mismo (24×27 px en
  escritorio, 18×20 px en móvil, un 25 % más pequeñas que antes) y los montones
  crecen apilando más fichas.
  Cada montón tiene como máximo 5 fichas; si sobran, se forma otro montón al
  lado (hasta **3 montones por jugador y 3 en el bote**). Si aún no caben, se
  muestra una tarjeta con el importe. El all-in se marca con una tarjeta
  triangular: esa tarjeta y la del bote grande son del mismo tamaño
  (38×29 px en escritorio, 31×25 px en móvil, compensando el `scale(0.88)`
  de los paneles móviles para que se vean idénticas).
  Las fichas de apuesta están **dentro del panel de cada jugador**, pegadas a
  su nombre, para que siempre se sepa de quién son y no tapen texto; el botón
  **D** de dealer sigue hacia el centro del tapete. En pantallas estrechas se
  ocultan las etiquetas de perfil y última acción, los paneles se compactan y
  se recolocan para no salirse del tapete ni solaparse.
- **Ciclo de mano:** al decidirse el ganador se resalta su asiento y se reparte
  una nueva mano automáticamente tras 10 s. El botón **🃏 Nueva Mano** debajo
  del ganador permite saltarse la espera (también dentro de la arena).
  El nombre de la mano ganadora se ajusta en varias líneas en el banner y en
  el panel del héroe (sin `truncate`), la insignia 🏆 GANADOR flota fuera del
  flujo del texto, y las métricas obsoletas del HUD se limpian al terminar la
  mano para que nunca tapen el resultado.
- **Pop-up de calificación:** etiqueta corta monocromática y unificada en la
  parte superior central (`!! BRILLANTE`, `! EXCELENTE`, `✓ ÓPTIMA`,
  `?! IMPRECISA`, `? ERROR`, `?? PÉSIMA`) con el porcentaje de acierto.
  Desaparece a los 3.5 s. La explicación EV detallada y la comparativa por
  acción siguen únicamente en el panel del Coach.

## Academia (12 micro-clases en mesa, de 0 a pro)

Cada clase carga una **mini-mesa determinista**: cartas fijas, board, bote,
fichas y la acción previa del rival. No hay aleatoriedad: el escenario es
idéntico siempre para que se pueda replicar y mantener.

- **Iniciación:** jerarquía de manos comparando A♠A♦ vs K♠K♦; posiciones y
  ciegas (BTN/SB/BB/UTG); acciones básicas (Check/Call/Bet/Raise/Fold).
- **Básico:** manos iniciales por posición (K9o en UTG vs BTN); Pot Odds con
  bote 100 y apuesta 50 sobre proyecto de color; outs y regla del 4 y del 2
  con cartas marcadas en el tapete.
- **Intermedio:** ventaja de posición desde BTN; SPR y compromiso con Top Pair;
  semi-faroles con color + escalera.
- **Avanzado:** C-Bet según textura (`K72r` vs `876ss`); farol en River con
  bloqueador; ajustes contra Calling Station y Nit.

Flujo de cada clase: guía de 2–3 líneas → decisión con botones reales de póker
(`Fold`, `Check/Call`, `Bet/Raise` o elegir la mano ganadora) → feedback
inmediato sobre el tapete con el cálculo exacto → desbloqueo de la siguiente.
El progreso se guarda en `appState.academia.completedIds` y la lista muestra
el paso (`Clase 1/12` ... `Clase 12/12`). Filtros: **Todos / Iniciación /
Básico / Intermedio / Avanzado**. Al completar la última se muestra
`🏆 ¡Ruta completa! De 0 a pro.`
