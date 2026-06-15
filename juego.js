// ══════════════════════════════════════════════
//  PASAPALABRA BÍBLICO — Frontend JS
// ══════════════════════════════════════════════

const COLORES_JUGADOR = ['#2060C0','#C02050','#20A060','#C08020','#8020C0','#20A0C0','#C06020','#6080C0'];
const TIEMPO_TURNO = 25;

let estadoActual = null;
let timerInterval = null;
let tiempoRestante = TIEMPO_TURNO;

// ── Pantallas ──────────────────────────────────
function mostrarPantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p => {
    p.classList.remove('activa');
    p.style.display = 'none';
  });
  const p = document.getElementById(id);
  p.style.display = 'flex';
  setTimeout(() => p.classList.add('activa'), 10);
}

// ══════════════════════════════════════════════
//  PANTALLA 1 — REGISTRO
// ══════════════════════════════════════════════
let numJugadores = 4;

function renderInputs() {
  const cont = document.getElementById('inputs-jugadores');
  cont.innerHTML = '';
  for (let i = 0; i < numJugadores; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'input-jugador-wrap';
    const badge = document.createElement('div');
    badge.className = 'jugador-num';
    badge.style.background = COLORES_JUGADOR[i];
    badge.textContent = i + 1;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = `Jugador ${i + 1}`;
    inp.maxLength = 20;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-iniciar').click(); });
    wrap.appendChild(badge);
    wrap.appendChild(inp);
    cont.appendChild(wrap);
  }
}

document.getElementById('btn-menos').addEventListener('click', () => {
  if (numJugadores > 2) { numJugadores--; document.getElementById('num-jugadores').textContent = numJugadores; renderInputs(); }
});
document.getElementById('btn-mas').addEventListener('click', () => {
  if (numJugadores < 8) { numJugadores++; document.getElementById('num-jugadores').textContent = numJugadores; renderInputs(); }
});

document.getElementById('btn-iniciar').addEventListener('click', async () => {
  const inputs = document.querySelectorAll('.input-jugador-wrap input');
  const nombres = [];
  inputs.forEach((inp, i) => {
    const val = inp.value.trim();
    nombres.push(val || `Jugador ${i + 1}`);
  });

  const fd = new FormData();
  fd.append('accion', 'iniciar');
  fd.append('nombres', JSON.stringify(nombres));

  const res = await fetch('', { method: 'POST', body: fd });
  const data = await res.json();
  if (data.error) { alert(data.error); return; }

  estadoActual = data.estado;
  iniciarJuego();
});

renderInputs();

// ══════════════════════════════════════════════
//  ROSCO — Canvas
// ══════════════════════════════════════════════
const canvas = document.getElementById('rosco-canvas');
const ctx = canvas.getContext('2d');

const LETRAS_ROSCO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUM_LETRAS = LETRAS_ROSCO.length;

function dibujarRosco(estado) {
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = W * 0.44;
  const r_seg = W * 0.065;

  ctx.clearRect(0, 0, W, H);

  LETRAS_ROSCO.forEach((letra, i) => {
    const ang = (i / NUM_LETRAS) * Math.PI * 2 - Math.PI / 2;
    const x = cx + R * Math.cos(ang);
    const y = cy + R * Math.sin(ang);

    const esActual = (estado && letra === estado.letra_actual);
    const est = estado ? (estado.rosco[letra] || 'pendiente') : 'pendiente';

    // Sombra para la letra actual
    if (esActual) {
      ctx.save();
      ctx.shadowColor = '#FFE566';
      ctx.shadowBlur = 18;
    }

    // Círculo de fondo
    ctx.beginPath();
    ctx.arc(x, y, r_seg, 0, Math.PI * 2);

    if (esActual) {
      ctx.fillStyle = '#E8A820';
    } else if (est === 'acierto') {
      ctx.fillStyle = '#1A5C30';
    } else if (est === 'error') {
      ctx.fillStyle = '#5C1A20';
    } else if (est === 'pasada') {
      ctx.fillStyle = '#3A3A10';
    } else {
      ctx.fillStyle = '#0F2040';
    }
    ctx.fill();

    // Borde
    ctx.strokeStyle = esActual ? '#FFE566' :
                      est === 'acierto' ? '#30C060' :
                      est === 'error'   ? '#E03040' :
                      est === 'pasada'  ? '#C0A010' : 'rgba(64,144,255,0.35)';
    ctx.lineWidth = esActual ? 2.5 : 1.5;
    ctx.stroke();

    if (esActual) ctx.restore();

    // Letra
    ctx.font = `bold ${r_seg * 0.85}px 'Exo 2', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = esActual ? '#050810' :
                    est === 'acierto' ? '#70F090' :
                    est === 'error'   ? '#F07080' :
                    est === 'pasada'  ? '#F0D050' : '#8090B0';
    ctx.fillText(letra, x, y);

    // Tick/X pequeño
    if (est === 'acierto') {
      ctx.font = `bold ${r_seg * 0.55}px sans-serif`;
      ctx.fillStyle = '#30C060';
      ctx.fillText('✓', x + r_seg * 0.5, y - r_seg * 0.5);
    } else if (est === 'error') {
      ctx.font = `bold ${r_seg * 0.55}px sans-serif`;
      ctx.fillStyle = '#E03040';
      ctx.fillText('✗', x + r_seg * 0.5, y - r_seg * 0.5);
    }
  });
}

// ══════════════════════════════════════════════
//  HUD
// ══════════════════════════════════════════════
function renderHUD(estado) {
  const cont = document.getElementById('jugadores-hud');
  cont.innerHTML = '';
  estado.jugadores.forEach((j, i) => {
    const div = document.createElement('div');
    div.className = 'hud-jugador' + (i === estado.turno ? ' activo' : '');
    const color = COLORES_JUGADOR[i];
    div.innerHTML = `
      <div class="hud-avatar" style="background:${color}">${j.nombre.charAt(0).toUpperCase()}</div>
      <div class="hud-info">
        <span class="hud-nombre">${j.nombre}</span>
        <span class="hud-puntos">${j.puntos} pts</span>
      </div>`;
    cont.appendChild(div);
  });
}

// ══════════════════════════════════════════════
//  TIMER
// ══════════════════════════════════════════════
function iniciarTimer() {
  detenerTimer();
  tiempoRestante = TIEMPO_TURNO;
  const bar = document.getElementById('timer-bar');
  const seg = document.getElementById('timer-seg');

  bar.style.setProperty('--prog', '1');
  bar.style.cssText = `flex:1;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;position:relative;`;
  const fill = document.createElement('div');
  fill.style.cssText = 'position:absolute;inset:0;background:linear-gradient(90deg,#4090FF,#E8A820);transform-origin:left;transition:transform 1s linear;';
  fill.style.transform = 'scaleX(1)';
  bar.innerHTML = '';
  bar.appendChild(fill);

  seg.textContent = TIEMPO_TURNO;
  seg.classList.remove('urgente');

  timerInterval = setInterval(() => {
    tiempoRestante--;
    const pct = tiempoRestante / TIEMPO_TURNO;
    fill.style.transform = `scaleX(${pct})`;
    seg.textContent = tiempoRestante;
    if (tiempoRestante <= 5) seg.classList.add('urgente');
    if (tiempoRestante <= 0) {
      detenerTimer();
      // Tiempo agotado = pasar automáticamente
      document.getElementById('btn-pasar').click();
    }
  }, 1000);
}

function detenerTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

// ══════════════════════════════════════════════
//  ACTUALIZAR UI DEL JUEGO
// ══════════════════════════════════════════════
function actualizarJuego(estado) {
  estadoActual = estado;
  const j = estado.jugadores[estado.turno];

  document.getElementById('letra-grande').textContent = estado.letra_actual;
  document.getElementById('jugador-actual-nombre').textContent = j.nombre;
  document.getElementById('pregunta-letra').textContent = estado.letra_actual;
  document.getElementById('pregunta-texto').textContent = estado.pregunta;
  document.getElementById('input-respuesta').value = '';
  document.getElementById('input-respuesta').focus();
  ocultarFeedback();
  renderHUD(estado);
  dibujarRosco(estado);
  iniciarTimer();
}

function mostrarFeedback(tipo, texto) {
  const el = document.getElementById('feedback');
  el.className = `feedback ${tipo} visible`;
  el.textContent = texto;
}
function ocultarFeedback() {
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('feedback').textContent = '';
}

// ══════════════════════════════════════════════
//  INICIAR JUEGO
// ══════════════════════════════════════════════
function iniciarJuego() {
  mostrarPantalla('pantalla-juego');
  actualizarJuego(estadoActual);
}

// ══════════════════════════════════════════════
//  RESPONDER / PASAR
// ══════════════════════════════════════════════
async function enviarRespuesta(accion) {
  detenerTimer();
  const fd = new FormData();
  fd.append('accion', accion);
  if (accion === 'responder') {
    const val = document.getElementById('input-respuesta').value.trim();
    if (!val) { iniciarTimer(); return; }
    fd.append('respuesta', val);
  }

  const res = await fetch('', { method: 'POST', body: fd });
  const data = await res.json();
  const estado = data.estado;

  if (accion === 'responder') {
    if (data.resultado === 'acierto') {
      mostrarFeedback('acierto', `✓ ¡Correcto! La respuesta es ${data.correcta}`);
    } else {
      mostrarFeedback('error', `✗ Incorrecto. Era: ${data.correcta}`);
    }
  } else {
    mostrarFeedback('pasada', `→ Pasapalabra — volveremos a esta`);
  }

  setTimeout(() => {
    if (estado.turno_terminado || estado.juego_terminado) {
      mostrarFinTurno(estado);
    } else {
      actualizarJuego(estado);
    }
  }, 1200);
}

document.getElementById('btn-responder').addEventListener('click', () => enviarRespuesta('responder'));
document.getElementById('input-respuesta').addEventListener('keydown', e => {
  if (e.key === 'Enter') enviarRespuesta('responder');
});
document.getElementById('btn-pasar').addEventListener('click', () => enviarRespuesta('pasar'));

// ══════════════════════════════════════════════
//  FIN DE TURNO
// ══════════════════════════════════════════════
function mostrarFinTurno(estado) {
  detenerTimer();
  mostrarPantalla('pantalla-turno-fin');

  const j = estado.jugadores[estado.turno];
  document.getElementById('tf-titulo').textContent = `¡Turno de ${j.nombre} completado!`;

  const stats = document.getElementById('tf-stats');
  stats.innerHTML = `
    <div class="stat-card stat-aciertos">
      <div class="stat-num">${j.aciertos}</div>
      <div class="stat-label">Aciertos</div>
    </div>
    <div class="stat-card stat-errores">
      <div class="stat-num">${j.errores}</div>
      <div class="stat-label">Errores</div>
    </div>
    <div class="stat-card stat-puntos">
      <div class="stat-num">${j.puntos}</div>
      <div class="stat-label">Puntos totales</div>
    </div>`;

  const btnSig = document.getElementById('btn-siguiente-turno');

  if (estado.juego_terminado) {
    btnSig.textContent = '🏆 Ver resultados finales';
    btnSig.onclick = () => mostrarPodio(estado);
  } else {
    const siguiente = estado.jugadores[estado.turno + 1];
    btnSig.textContent = `Turno de ${siguiente.nombre} →`;
    btnSig.onclick = async () => {
      // Avanzar turno en servidor
      const fd = new FormData();
      fd.append('accion', 'estado');
      // Hacemos una petición especial para avanzar turno
      await avanzarTurno();
    };
  }
}

async function avanzarTurno() {
  const fd = new FormData();
  fd.append('accion', 'siguiente_turno');
  // Llamamos a un endpoint especial - lo manejamos aquí también
  const res = await fetch('?avanzar=1', { method: 'GET' });
  const data = await res.json();
  estadoActual = data.estado;
  iniciarJuego();
}

// ══════════════════════════════════════════════
//  PODIO FINAL
// ══════════════════════════════════════════════
function mostrarPodio(estado) {
  mostrarPantalla('pantalla-podio');

  // Ordenar jugadores por puntos
  const jugadores = [...estado.jugadores].map((j, i) => ({ ...j, idx: i }));
  jugadores.sort((a, b) => b.puntos - a.puntos);

  // Podio visual (top 3)
  const podioEl = document.getElementById('podio');
  podioEl.innerHTML = '';
  const orden = [1, 0, 2]; // centro primero, luego izquierda, derecha
  const iconos = ['🥇', '🥈', '🥉'];

  orden.forEach(pos => {
    const j = jugadores[pos];
    if (!j) return;
    const div = document.createElement('div');
    div.className = 'podio-lugar';
    div.style.order = pos === 0 ? 1 : pos === 1 ? 0 : 2;
    div.innerHTML = `
      <div class="podio-nombre">${j.nombre}</div>
      <div class="podio-pts">${j.puntos} pts</div>
      <div class="podio-barra">${iconos[pos] || ''}</div>`;
    podioEl.appendChild(div);
  });

  // Tabla completa
  const tabla = document.getElementById('tabla-final');
  const badgeClass = i => i === 0 ? 'pos-1' : i === 1 ? 'pos-2' : i === 2 ? 'pos-3' : 'pos-n';
  tabla.innerHTML = `
    <div class="tabla-fila header">
      <div>#</div><div>Jugador</div>
      <div style="text-align:right">Pts</div>
      <div style="text-align:right">✓</div>
      <div style="text-align:right">✗</div>
    </div>
    ${jugadores.map((j, i) => `
      <div class="tabla-fila ${i === 0 ? 'primero' : ''}">
        <div><span class="pos-badge ${badgeClass(i)}">${i + 1}</span></div>
        <div style="font-weight:600;color:var(--blanco)">${j.nombre}</div>
        <div class="cel-pts">${j.puntos}</div>
        <div class="cel-ok">${j.aciertos}</div>
        <div class="cel-err">${j.errores}</div>
      </div>`).join('')}`;

  lanzarConfeti();
}

// ══════════════════════════════════════════════
//  CONFETI
// ══════════════════════════════════════════════
function lanzarConfeti() {
  const colores = ['#E8A820','#FFE566','#4090FF','#30C060','#E03040','#C060FF'];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confeti-pieza';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-20px';
      el.style.background = colores[Math.floor(Math.random() * colores.length)];
      el.style.width = (6 + Math.random() * 8) + 'px';
      el.style.height = (6 + Math.random() * 8) + 'px';
      el.style.animationDuration = (2 + Math.random() * 2) + 's';
      el.style.animationDelay = '0s';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 40);
  }
}

// ══════════════════════════════════════════════
//  MANEJO DE AVANZAR TURNO (GET param)
// ══════════════════════════════════════════════
// El avanzarTurno hace GET ?avanzar=1, PHP lo maneja así:
// (Añadir al index.php en el bloque de procesamiento GET/POST)
// — Se incluye la lógica al final del PHP inline —
