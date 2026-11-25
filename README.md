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
- **HUD «ojito» 👁️ / 🙈:** la barra inferior tiene dos zonas: a la izquierda
  `Apostar/Subir → Pasar/Pagar → Retirarse`; a la derecha el ojito. Al abrirlo,
  las tarjetitas siguen en una sola fila horizontal de altura fija, sin
  engordar el hub ni invadir el tapete.
  - Preflop: frecuencias RAISE/CALL/FOLD de `GTOEngine`, con posición,
    secuencia (RFI / vs apertura / vs 3-Bet / defensa BB), tamaño de apertura,
    stack y MDF reales de la mano. Sólo se muestran acciones con `% > 0`.
  - Postflop: sin GTO preflop; muestra EQUITY, POT ODDS, OUTS (sólo Flop/Turn)
    y EV MAX en BB, calculados en el turno del Héroe.
  - **Sugerencia bajo los botones:** cuando el ojito está activo, muestra la
    mejor acción y sus porcentajes. En preflop usa las frecuencias GTO; en
    flop/turn/river usa un porcentaje **estimado** derivado del EV de cada
    opción disponible, incluida `Subir` cuando existe y es la mejor línea.
  - La sugerencia se oculta con el ojito, fuera del turno del Héroe o si no hay
    mano en curso. El detalle EV completo sigue en el Coach.
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

## Academia (ruta de 12 clases en 5 niveles)

El mapa agrupa las clases por nivel. Al elegir una clase, **el mapa se
sustituye por la vista de esa clase**: cabecera con `← Ruta`, progreso `1..5`,
una mesa a pantalla completa y navegación fija abajo. El avance sigue siendo
paso a paso, pero el contenido permite **scroll corto** para que `Siguiente`
nunca quede tapado por la barra del navegador o el móvil. `Esc` o `← Ruta`
vuelven al mapa, también después de girar el teléfono.

Las clases usan tres formatos internos (no se muestran como etiquetas):

- **Revelación guiada** (clases 1, 3 y 12): 5 pantallas sin preguntas. El board
  aparece flop → turn → river con `Entendido →`.
- **Comparación de manos** (clase 2): 5 enfrentamientos fijos de 5 cartas
  contra 5. Se elige ganador y se revelan las mejores 5 cartas de cada mano con
  el nombre del evaluador.
- **Casos fijos** (clases 4 a 11): 5 situaciones preconfiguradas por clase,
  nunca aleatorias, con bote, apuesta, outs marcados y acción del rival. Se
  decide con los botones habituales (`Apostar/Subir`, `Pasar/Pagar`,
  `Retirarse`) y el feedback explica el porqué. Sólo avanza la respuesta
  correcta; la incorrecta permite reintentar sin castigo.

Niveles y orden:

- **Fundamentos**: `01 Jerarquía de manos`, `02 Comparación de manos`.
- **Mesa**: `03 Estructura de la mesa`, `04 Acciones en una mano`.
- **Números**: `05 Pot odds y precio de decisión`, `06 Outs y equity estimada`.
- **Táctica**: `07 Ventaja posicional`, `08 Apuesta de continuación`,
  `09 SPR y compromiso de pila`.
- **Estrategia**: `10 Semi-farol con bloqueadores`,
  `11 Equilibrio GTO y explotación`, `12 Cómo se juega una mano`
  (cierre con la regla 2 privadas + 5 comunitarias).

Los IDs internos de las clases no cambiaron, así que el progreso guardado se
conserva aunque el orden visible sea nuevo.

**Estado del rediseño:** las 12 clases están completas y son jugables: 60
pasos fijos en total (5 por clase), con cartas y situaciones deterministas para
poder repetir cualquier paso. No queda ninguna clase en `EN PREPARACIÓN`.

El avance nuevo se guarda por paso en `appState.academia.v2.stepProgress`, con
la clase y el paso activos en `appState.academia.v2`; al volver a entrar en
Academia se restaura la clase y el paso exactos. El progreso anterior
(`caseProgress`) se conserva por separado para no pisar partidas ya resueltas.
