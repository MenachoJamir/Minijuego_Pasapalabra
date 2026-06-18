# 🎯 Pasapalabra Bíblico

Un mini-juego web del clásico **"Pasapalabra"** (el rosco de letras), pero con preguntas de cultura bíblica en lugar de las tradicionales. Cada letra del abecedario (A-Z) tiene una pregunta cuya respuesta empieza con esa letra, y los jugadores deben responder antes de que se acabe el tiempo.

## 📖 ¿De qué trata?

El juego recrea la mecánica del famoso concurso de televisión: un rosco con las 26 letras del abecedario rodea al jugador en turno. Por cada letra hay una pregunta relacionada con personajes, libros o lugares de la Biblia (por ejemplo: *"Primer hombre creado por Dios según el Génesis" → ADÁN*).

**Mecánicas principales:**
- 🔁 Soporta entre **2 y 8 jugadores** en la misma partida (local, por turnos).
- ⏱️ Cada jugador tiene **25 segundos por letra** para responder.
- ✅ Acierto = +3 puntos | ❌ Error = se marca el rosco | ⏭️ "Pasapalabra" = se salta la letra y se retoma después.
- 🏆 Al terminar todos los turnos se muestra un **podio final** con el ranking de jugadores.
- 🎨 Interfaz visual con un rosco animado en `<canvas>`, paneles de pregunta y feedback en tiempo real.

## 🎯 ¿A quién está dirigido?

Este proyecto está pensado para:

- **Grupos de estudio bíblico, iglesias o jóvenes cristianos** que buscan una forma entretenida de repasar personajes y pasajes de la Biblia.
- **Familias o amigos** que quieran jugar una versión temática de Pasapalabra en reuniones o noches de juegos.
- **Desarrolladores en formación** interesados en un ejemplo simple y comentado de juego multijugador por turnos con PHP + JS, sin frameworks ni librerías externas.

## 🛠️ Tecnologías usadas

- **PHP** — lógica del juego, turnos, validación de respuestas y manejo de sesión (`$_SESSION`).
- **JavaScript** — interactividad, temporizador, dibujo del rosco en `<canvas>` y comunicación con el backend vía `fetch`/AJAX.
- **HTML5 + CSS3** — estructura y diseño visual (tipografías Exo 2 y Crimson Pro vía Google Fonts).

## 🚀 Cómo ejecutarlo localmente

1. Necesitas un servidor con PHP (puedes usar [Laragon](https://laragon.org/), XAMPP, o el servidor embebido de PHP).
2. Clona este repositorio:
   ```bash
   git clone https://github.com/MenachoJamir/Minijuego_Pasapalabra.git
   ```
3. Si usas el servidor embebido de PHP, entra a la carpeta del proyecto y ejecuta:
   ```bash
   php -S localhost:8000
   ```
4. Abre tu navegador en `http://localhost:8000`.

## 🎮 Cómo se juega

1. En la pantalla inicial, ingresa los nombres de los jugadores (mínimo 2, máximo 8).
2. El primer jugador comienza su turno: aparece una letra del rosco con su pregunta.
3. Escribe tu respuesta y presiona **"Responder"**, o presiona **"Pasapalabra →"** para saltar esa letra y volver a ella más tarde.
4. El turno termina cuando se acaba el tiempo o se responden/pasan todas las letras pendientes.
5. Al finalizar todos los turnos, se muestra el **podio final** con los puntajes.

## ✍️ Autor

Proyecto desarrollado por **Jamir Menacho** como parte de su portafolio de proyectos en desarrollo de software (PHP, MySQL/JS).
