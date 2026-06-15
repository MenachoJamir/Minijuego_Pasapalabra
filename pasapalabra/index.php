<?php
session_start();

// ══════════════════════════════════════════════════════════
//  PASAPALABRA BÍBLICO — Base de preguntas
//  Cada letra tiene una pregunta cuya respuesta empieza con esa letra
// ══════════════════════════════════════════════════════════
$banco = [
  'A' => ['pregunta' => 'Primer hombre creado por Dios según el Génesis',                         'respuesta' => 'ADAN'],
  'B' => ['pregunta' => 'Ciudad donde nació Jesús',                                                'respuesta' => 'BELEN'],
  'C' => ['pregunta' => 'Primer hijo de Adán y Eva que cometió un fratricidio',                    'respuesta' => 'CAIN'],
  'D' => ['pregunta' => 'Rey de Israel que venció a Goliat siendo un joven pastor',                'respuesta' => 'DAVID'],
  'E' => ['pregunta' => 'Segundo libro de la Biblia, narra la salida de Israel de Egipto',         'respuesta' => 'EXODO'],
  'F' => ['pregunta' => 'Apóstol que era recaudador de impuestos antes de seguir a Jesús',        'respuesta' => 'FELIPE'],
  'G' => ['pregunta' => 'Primer libro de la Biblia',                                              'respuesta' => 'GENESIS'],
  'H' => ['pregunta' => 'Libro del Nuevo Testamento que narra los hechos de los apóstoles',       'respuesta' => 'HECHOS'],
  'I' => ['pregunta' => 'Profeta que escribió "El lobo habitará con el cordero"',                  'respuesta' => 'ISAIAS'],
  'J' => ['pregunta' => 'Hijo de María y José, Salvador del mundo',                               'respuesta' => 'JESUS'],
  'K' => ['pregunta' => 'Primer rey de Israel ungido por Samuel',                                  'respuesta' => 'KISH'],  // padre de Saúl, K difícil
  'L' => ['pregunta' => 'Evangelista médico que escribió también el libro de los Hechos',         'respuesta' => 'LUCAS'],
  'M' => ['pregunta' => 'Profeta que guió a Israel por el desierto durante 40 años',              'respuesta' => 'MOISES'],
  'N' => ['pregunta' => 'Patriarca que construyó un arca para salvarse del diluvio',               'respuesta' => 'NOE'],
  'O' => ['pregunta' => 'Libro del Antiguo Testamento cuyo nombre significa "siervo de Dios"',    'respuesta' => 'OSEAS'],
  'P' => ['pregunta' => 'Apóstol que escribió la mayoría de las epístolas del Nuevo Testamento',  'respuesta' => 'PABLO'],
  'Q' => ['pregunta' => 'Libro del Antiguo Testamento también llamado Eclesiastés en hebreo (Qohelet)', 'respuesta' => 'QOHELET'],
  'R' => ['pregunta' => 'Moabita que dijo a Noemí: "Tu pueblo será mi pueblo, tu Dios mi Dios"',  'respuesta' => 'RUTA'],
  'S' => ['pregunta' => 'Rey más sabio de Israel, hijo de David',                                  'respuesta' => 'SALOMON'],
  'T' => ['pregunta' => 'Apóstol que dudó de la resurrección de Jesús hasta tocarlo',             'respuesta' => 'TOMAS'],
  'U' => ['pregunta' => 'Soldado hitita esposo de Betsabé, enviado a morir por David',            'respuesta' => 'URIAS'],
  'V' => ['pregunta' => 'Término bíblico que describe la primera mujer del rey Asuero',           'respuesta' => 'VASTI'],
  'W' => ['pregunta' => 'No existe letra W en el alfabeto bíblico español — ¡Pasapalabra!',      'respuesta' => 'W'],
  'X' => ['pregunta' => 'Nombre griego de Cristo que aparece en siglas como "Xmas"',             'respuesta' => 'XRISTOS'],
  'Y' => ['pregunta' => 'Nombre hebreo de Dios, las 4 consonantes sagradas (Tetragrámaton)',      'respuesta' => 'YAHVE'],
  'Z' => ['pregunta' => 'Jefe de publicanos en Jericó que subió a un árbol para ver a Jesús',    'respuesta' => 'ZAQUEO'],
];

$letras = array_keys($banco);
$TIEMPO_TURNO = 25; // segundos por letra

// ── Avanzar turno (GET ?avanzar=1) ───────────────────────
if (isset($_GET['avanzar']) && isset($_SESSION['juego'])) {
  header('Content-Type: application/json');
  $_SESSION['juego']['turno']++;
  iniciarRoscoJugador();
  echo json_encode(['estado' => estadoJuego()]);
  exit;
}

// ── Acciones AJAX ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  header('Content-Type: application/json');
  $accion = $_POST['accion'] ?? '';

  // Iniciar partida
  if ($accion === 'iniciar') {
    $nombres = array_filter(array_map('trim', json_decode($_POST['nombres'], true)));
    $nombres = array_values($nombres);
    if (count($nombres) < 2) { echo json_encode(['error' => 'Mínimo 2 jugadores']); exit; }

    $jugadores = [];
    foreach ($nombres as $n) {
      $jugadores[] = ['nombre' => $n, 'puntos' => 0, 'aciertos' => 0, 'errores' => 0, 'pasadas' => 0];
    }

    $_SESSION['juego'] = [
      'jugadores'     => $jugadores,
      'turno'         => 0,         // índice del jugador actual
      'letra_idx'     => 0,         // índice de letra actual en el rosco
      'letras_estado' => array_fill_keys($letras, 'pendiente'), // pendiente|acierto|error
      'rosco_jugador' => [], // estado del rosco para el jugador actual
      'iniciado'      => true,
    ];
    // Preparar rosco del primer jugador
    iniciarRoscoJugador();
    echo json_encode(['ok' => true, 'estado' => estadoJuego()]);
    exit;
  }

  // Responder
  if ($accion === 'responder') {
    $respuesta = strtoupper(trim(preg_replace('/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/', '', $_POST['respuesta'] ?? '')));
    $juego = &$_SESSION['juego'];
    $letra_actual = $letras[$juego['letra_idx']];
    $correcta = $banco[$letra_actual]['respuesta'];

    if ($respuesta === $correcta || levenshtein($respuesta, $correcta) <= 1) {
      // Acierto
      $juego['rosco_jugador'][$letra_actual] = 'acierto';
      $juego['jugadores'][$juego['turno']]['puntos']   += 3;
      $juego['jugadores'][$juego['turno']]['aciertos'] += 1;
      avanzarLetra(true);
      echo json_encode(['resultado' => 'acierto', 'correcta' => $correcta, 'estado' => estadoJuego()]);
    } else {
      // Error
      $juego['rosco_jugador'][$letra_actual] = 'error';
      $juego['jugadores'][$juego['turno']]['errores'] += 1;
      avanzarLetra(false);
      echo json_encode(['resultado' => 'error', 'correcta' => $correcta, 'estado' => estadoJuego()]);
    }
    exit;
  }

  // Pasapalabra
  if ($accion === 'pasar') {
    $juego = &$_SESSION['juego'];
    $letra_actual = $letras[$juego['letra_idx']];
    $juego['rosco_jugador'][$letra_actual] = 'pasada';
    $juego['jugadores'][$juego['turno']]['pasadas'] += 1;
    avanzarLetra(false, true);
    echo json_encode(['resultado' => 'pasada', 'estado' => estadoJuego()]);
    exit;
  }

  // Estado actual
  if ($accion === 'estado') {
    echo json_encode(['estado' => estadoJuego()]);
    exit;
  }

  echo json_encode(['error' => 'Acción desconocida']);
  exit;
}

// ── Funciones de lógica ───────────────────────────────────
function iniciarRoscoJugador() {
  global $letras;
  $juego = &$_SESSION['juego'];
  $juego['letra_idx']     = 0;
  $juego['rosco_jugador'] = array_fill_keys($letras, 'pendiente');
  $juego['turno_fin']     = false;
}

function avanzarLetra($acierto, $pasada = false) {
  global $letras, $banco;
  $juego = &$_SESSION['juego'];
  $total = count($letras);

  // Buscar siguiente letra pendiente
  $inicio = $juego['letra_idx'];
  $siguiente = null;
  for ($i = 1; $i <= $total; $i++) {
    $idx = ($inicio + $i) % $total;
    if ($juego['rosco_jugador'][$letras[$idx]] === 'pendiente' ||
        $juego['rosco_jugador'][$letras[$idx]] === 'pasada') {
      if ($siguiente === null) $siguiente = $idx;
      // Preferir pendiente sobre pasada
      if ($juego['rosco_jugador'][$letras[$idx]] === 'pendiente') {
        $siguiente = $idx;
        break;
      }
    }
  }

  // ¿Quedan letras sin responder?
  $quedan = 0;
  foreach ($juego['rosco_jugador'] as $est) {
    if ($est === 'pendiente' || $est === 'pasada') $quedan++;
  }

  if ($quedan === 0 || $siguiente === null) {
    // Turno terminado
    $juego['turno_fin'] = true;
    return;
  }

  $juego['letra_idx'] = $siguiente;
}

function estadoJuego() {
  global $banco, $letras;
  $juego = $_SESSION['juego'] ?? null;
  if (!$juego) return null;

  $turno = $juego['turno'];
  $letra_idx = $juego['letra_idx'];
  $letra_actual = $letras[$letra_idx];

  // Calcular si el turno terminó
  $quedan = 0;
  foreach ($juego['rosco_jugador'] as $est) {
    if ($est === 'pendiente' || $est === 'pasada') $quedan++;
  }
  $turno_terminado = $juego['turno_fin'] || $quedan === 0;

  // Calcular fin de juego (todos jugaron)
  $juego_terminado = false;
  if ($turno_terminado && $turno >= count($juego['jugadores']) - 1) {
    $juego_terminado = true;
  }

  return [
    'jugadores'      => $juego['jugadores'],
    'turno'          => $turno,
    'letra_actual'   => $letra_actual,
    'pregunta'       => $banco[$letra_actual]['pregunta'],
    'rosco'          => $juego['rosco_jugador'],
    'letras'         => $letras,
    'turno_terminado'=> $turno_terminado,
    'juego_terminado'=> $juego_terminado,
  ];
}

function siguienteTurno() {
  $juego = &$_SESSION['juego'];
  $juego['turno']++;
  iniciarRoscoJugador();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pasapalabra Bíblico</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;700;900&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>

<!-- PANTALLA 1: REGISTRO DE JUGADORES -->
<div id="pantalla-registro" class="pantalla activa">
  <div class="registro-wrap">
    <div class="logo-titulo">
      <div class="logo-rosco">✦</div>
      <h1>Pasapalabra</h1>
      <p class="logo-sub">Edición Bíblica</p>
    </div>

    <div class="registro-form">
      <h2>¿Quiénes juegan hoy?</h2>
      <p class="hint">Ingresa entre 2 y 8 jugadores</p>

      <div class="jugadores-cantidad">
        <button class="btn-menos" id="btn-menos">−</button>
        <span id="num-jugadores">4</span>
        <button class="btn-mas" id="btn-mas">+</button>
        <span class="cant-label">jugadores</span>
      </div>

      <div id="inputs-jugadores" class="inputs-jugadores"></div>

      <button class="btn-iniciar" id="btn-iniciar">
        <span>¡Comenzar!</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
  </div>
</div>

<!-- PANTALLA 2: JUEGO -->
<div id="pantalla-juego" class="pantalla">

  <!-- Cabecera con jugadores -->
  <header class="hud">
    <div id="jugadores-hud" class="jugadores-hud"></div>
  </header>

  <!-- Rosco central -->
  <main class="arena">
    <div class="rosco-contenedor">
      <canvas id="rosco-canvas" width="480" height="480"></canvas>
      <div class="rosco-centro">
        <div class="letra-grande" id="letra-grande">A</div>
        <div class="jugador-actual-nombre" id="jugador-actual-nombre">—</div>
      </div>
    </div>

    <!-- Panel de pregunta -->
    <div class="pregunta-panel">
      <div class="pregunta-header">
        <span class="pregunta-letra" id="pregunta-letra">A</span>
        <span class="pregunta-label">Contiene la letra</span>
      </div>
      <p class="pregunta-texto" id="pregunta-texto">Cargando…</p>

      <div class="respuesta-area">
        <input type="text" id="input-respuesta" placeholder="Escribe tu respuesta…" autocomplete="off" autocorrect="off" spellcheck="false">
        <button class="btn-responder" id="btn-responder">Responder</button>
        <button class="btn-pasar" id="btn-pasar">Pasapalabra →</button>
      </div>

      <div class="feedback" id="feedback"></div>

      <div class="timer-wrap">
        <div class="timer-bar" id="timer-bar"></div>
        <span class="timer-seg" id="timer-seg">25</span>
      </div>
    </div>
  </main>
</div>

<!-- PANTALLA 3: RESULTADO DE TURNO -->
<div id="pantalla-turno-fin" class="pantalla">
  <div class="turno-fin-wrap">
    <div class="turno-fin-titulo" id="tf-titulo">Turno completado</div>
    <div class="turno-fin-stats" id="tf-stats"></div>
    <button class="btn-siguiente-turno" id="btn-siguiente-turno">Siguiente jugador →</button>
  </div>
</div>

<!-- PANTALLA 4: PODIO FINAL -->
<div id="pantalla-podio" class="pantalla">
  <div class="podio-wrap">
    <h1 class="podio-titulo">¡Resultados finales!</h1>
    <div class="podio" id="podio"></div>
    <div class="tabla-final" id="tabla-final"></div>
    <button class="btn-nueva-partida" onclick="location.reload()">Nueva partida</button>
  </div>
</div>

<script src="juego.js"></script>
</body>
</html>
