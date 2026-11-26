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
  academia.js              ruta de 12 clases en 5 niveles; clase a pantalla completa
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
- Orden de botones de acción: **Retirarse (Fold) → Pasar/Pagar (Call) → Apostar/Subir (Raise)**, en una sola fila horizontal.
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
- **HUD unificado sin scroll:** `#game-controls-panel` sigue siendo una sola
  pieza. Arriba quedan `Fold → Call → Raise`; debajo, en su flujo natural,
  `All-In + slider + 1/4, 1/3, 1/2, 3/4, Pot` y el ojito 👁️ en su propio hueco
  al final de la fila. Al abrirlo el HUD crece un poco y muestra la fila extra
  sin barras de desplazamiento internas.
- **HUD «ojito» 👁️ / 🙈:** al abrirlo, la información se despliega **hacia arriba**
  dentro del mismo panel: viñetas sobre cada botón de acción y métricas en
  horizontal debajo de la zona de apuestas.
  - Preflop: frecuencias RAISE/CALL/FOLD de `GTOEngine`, con posición,
    secuencia (RFI / vs apertura / vs 3-Bet / defensa BB), tamaño de apertura,
    stack y MDF reales de la mano. Sólo se muestran acciones con `% > 0`.
  - Postflop: sin GTO preflop; los porcentajes son **estimados** a partir del EV
    de cada opción disponible, incluida `Subir` cuando existe.
  - **Viñetas sobre los botones:** cada acción lleva encima sólo su nombre y su
    porcentaje (por ejemplo `Subir 42%`). No hay cajas de texto ni etiquetas
    largas.
  - **Sizing al subir:** si `Subir` es la mejor línea, se preselecciona el slider
    en el monto sugerido y se resalta el atajo de bote más cercano (o All-In).
    El detalle EV completo sigue en el Coach.
  - Las viñetas y métricas se ocultan con el ojito, fuera del turno del Héroe o
    si no hay mano en curso.
- **Jugada resaltada en mesa:** las cartas del Héroe que forman su mejor jugada
  actual llevan un contorno ámbar; al avanzar la mano el contorno se recalcula
  (carta alta, par, dobles parejas, escalera...). Las cartas del rival nunca se
  contornean.
- **Cierre de mano legible:** quien foldea queda grisáceo, tachado y con
  etiqueta `FOLD`. Al terminar la mano se muestran las cartas de los rivales
  durante unos segundos, sin realces, para entender quién ganó y con qué.
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
  `?! IMPRECISA`, `? ERROR`, `?? PÉSIMA`), sin porcentajes: sólo el símbolo y
  la palabra. Desaparece a los 3.5 s. Los números, la explicación EV detallada
  y la comparativa por acción siguen únicamente en el panel del Coach.

## Academia (ruta de 12 clases en 5 niveles)

El mapa agrupa las clases por nivel. Al elegir una clase, **el mapa se
sustituye por la vista de esa clase**: cabecera con `← Ruta`, progreso
`1..10` en `Las Manos` y `1..5` en el resto, contenido a pantalla completa y
navegación fija abajo. El avance sigue siendo paso a paso, pero el contenido
permite **scroll corto** para que `Siguiente` nunca quede tapado por la barra
del navegador o el móvil. `Esc` o `← Ruta` vuelven al mapa, también después de
girar el teléfono.

- **Pantalla Completa de Academia:** botón `⛶ Pantalla Completa` en el mapa y
  `⛶` en la cabecera de cada clase (mismo patrón que Arena: Fullscreen API
  nativa con fallback CSS `is-acad-full`, `Esc` para salir). Funciona igual en
  el mapa, en una clase y en móvil.
- **«Siguiente» siempre accesible:** el pie `.acad-shell-foot` y el botón
  `.acad-next` tienen `z-index` propio y `pointer-events:auto`, por encima de
  cualquier marca de agua decorativa, tanto en vista normal como en pantalla
  completa.

Las clases usan cuatro formatos internos (no se muestran como etiquetas):

- **Las Manos** (clase 1): 10 pantallas, una por jugada oficial de menor a
  mayor fuerza: Carta Alta (High Card), Par (One Pair), Doble par (Two Pair),
  Trío (Three of a Kind / Set), Escalera (Straight), Color (Flush),
  Full House, Póker (Four of a Kind), Escalera de color (Straight Flush) y
  Escalera real (Royal Flush). Cada pantalla muestra siempre 5 espacios:
  resalta sólo las cartas que forman la jugada, deja siluetas en los demás e
  indica a qué jugada supera. Todavía no hay cartas comunitarias.
- **Revelación guiada** (clase 2): 5 pantallas sin preguntas. Se explican las
  Hole Cards, el Board (Flop → Turn → River), la mejor jugada de 5 entre 7
  cartas, el Dealer button, las ciegas (Small Blind / Big Blind) y las rondas
  Preflop / Flop / Turn / River con `Entendido →`.
- **Showdown** (clase 3): 5 enfrentamientos fijos de Hero contra Villain con
  2 Hole Cards cada uno y un mismo Board de 5 cartas. Se elige ganador y se
  revelan las mejores 5 cartas de cada mano con el nombre del evaluador.
- **Casos fijos** (clases 4 a 12): 5 situaciones preconfiguradas por clase,
  nunca aleatorias, con bote, apuesta, outs marcados, posición y acción del
  rival. Se decide con los botones oficiales (`Fold`, `Check`, `Call`, `Bet`,
  `Raise`, `All-in`) y el feedback explica el porqué. Sólo avanza la respuesta
  correcta; la incorrecta permite reintentar sin castigo.

Niveles y orden (de cero a avanzado):

- **Fundamentos**: `01 Las Manos` (10 jugadas), `02 Cómo se juega una mano`.
- **Mesa**: `03 Showdown: lectura de mesa y comparación`,
  `04 Acciones y posiciones` (UTG, MP, CO, BTN, SB, BB).
- **Números**: `05 Pot odds y precio de decisión`, `06 Outs y equity estimada`.
- **Táctica**: `07 Ventaja posicional`, `08 Apuesta de continuación`,
  `09 SPR y compromiso de pila`.
- **Estrategia**: `10 Semi-bluff con bloqueadores`,
  `11 Equilibrio GTO y explotación`, `12 Value Bet, Bluff y equilibrio GTO`.

Se conservan los IDs internos de las clases 1 a 11, así que el progreso
guardado sigue vigente aunque el orden visible sea nuevo; la clase 12 usa el ID
`cierre` con el cierre avanzado.

**Estado del rediseño:** las 12 clases están completas y son jugables: 65
pasos fijos en total (10 en `Las Manos` y 5 en cada una de las otras 11), con
cartas y situaciones deterministas para poder repetir cualquier paso. No queda
ninguna clase en `EN PREPARACIÓN`.

El avance nuevo se guarda por paso en `appState.academia.v2.stepProgress`, con
la clase y el paso activos en `appState.academia.v2`; al volver a entrar en
Academia se restaura la clase y el paso exactos. El progreso anterior
(`caseProgress`) se conserva por separado para no pisar partidas ya resueltas.
