# Snake Arcade - Juego Moderno

Juego Snake completo con Node.js + Express, Canvas API y diseño moderno estilo arcade.

## Características

- 🎮 **Modos de juego**: 1 jugador y 2 jugadores
- 📊 **Puntuación y niveles**: Dificultad progresiva
- 🎨 **Diseño moderno**: Estilo arcade naranja/negro
- 📱 **Responsive**: Funciona en móviles y desktop
- 📈 **Leaderboard**: Guarda puntuaciones en JSON
- 🎵 **Sistema de audio**: Efectos de sonido
- ✨ **Partículas y efectos**: Animaciones suaves
- 🧱 **Muros dinámicos**: Obstáculos por nivel

## Controles

### Jugador 1 (Naranja)
- **Teclas de flecha**: Mover

### Jugador 2 (Verde) - Solo modo 2 jugadores
- **W**: Arriba
- **A**: Izquierda
- **S**: Abajo
- **D**: Derecha

### General
- **Esc / P**: Pausar
- **Botón táctil**: Móvil

## Instalación y ejecución

1. **Instalar dependencias**:
```bash
cd snake-arcade
npm install
```

2. **Iniciar el servidor**:
```bash
npm start
```

3. **Jugar**:
- Abre el navegador en `http://localhost:3000`
- ¡Listo para jugar!

## Estructura del proyecto

```
snake-arcade/
├── server.js          # Backend Express
├── package.json       # Dependencies
├── data.json          # Leaderboard (auto-generado)
├── public/
│   ├── index.html     # HTML principal
│   ├── css/
│   │   └── style.css  # Estilos arcade
│   ├── js/
│   │   ├── Config.js  # Configuración
│   │   ├── Audio.js   # Sistema de audio
│   │   ├── Collisions.js  # Logica colisiones
│   │   ├── Render.js  # Renderizado Canvas
│   │   ├── Game.js    # Logica principal
│   │   └── UI.js      # Interfaz de usuario
│   └── assets/
│       ├── sprites/   # Imágenes (cabeza, cuerpo, etc.)
│       └── audio/     # Sonidos
└── README.md
```

## API Endpoints

### `GET /jugadores`
Obtiene la lista de puntuaciones ordenada.

### `POST /guardar`
Guarda una nueva puntuación.
**Body**: `{ nombre: string, puntaje: number, nivel: number }`

## Personalización

Puedes modificar `Config.js` para cambiar:
- Tamaño del grid
- Velocidad inicial
- Puntos necesarios para nivel
- Cantidad de muros por nivel
- Colores

## Características técnicas

- **requestAnimationFrame**: Loop suave
- **deltaTime**: Tiempo entre frames
- **Módulos separados**: Lógica, render, audio, UI, colisiones
- **CORS**: Para desarrollo local
- **localStorage**: Persistencia (via JSON file)

¡Diviértete jugando! 🐍
