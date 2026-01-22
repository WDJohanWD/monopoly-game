```
╔═══════════════════════════════════════════════════════════════════════════╗
║                  ARQUITECTURA: FRONTEND MONOPOLY INTEGRADO                ║
╚═══════════════════════════════════════════════════════════════════════════╝

                             ┌─────────────────┐
                             │   Navegador     │
                             │  (React Router) │
                             └────────┬────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
              ┌─────▼──────┐                   ┌─────────▼──────┐
              │ /board      │                   │ /custom-game   │
              │  Board.tsx  │                   │ CustomGame.tsx │
              └─────┬──────┘                   └─────────┬──────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │  GameContainer.tsx     │
                          │  (Orquestador Principal)│
                          └───────────┬────────────┘
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
         ┌────────▼─────────┐ ┌──────▼──────┐ ┌────────▼────────┐
         │  MonopolyBoard   │ │ DiceRoller  │ │  Panel Control  │
         │     .tsx         │ │    .tsx     │ │   (Botones)     │
         └────────┬─────────┘ └──────┬──────┘ └────────┬────────┘
                  │                  │                  │
         ┌────────▼─────────────────▼──────────────────▼────────┐
         │                                                       │
         │              Hooks de Animación                       │
         │  ┌───────────────────────────────────────────────┐   │
         │  │ • usePlayerMovement()                         │   │
         │  │ • useDiceRoll()                               │   │
         │  │ • useGameSounds()                             │   │
         │  │ • useGameState()                              │   │
         │  └───────────────────────────────────────────────┘   │
         └────────────┬──────────────────────────────────────────┘
                      │
         ┌────────────▼──────────────────┐
         │   Servicio API (api.ts)       │
         │  ┌────────────────────────┐  │
         │  │ • getGame()            │  │
         │  │ • rollDice()           │  │
         │  │ • buyProperty()        │  │
         │  │ • endTurn()            │  │
         │  │ • joinGame()           │  │
         │  │ • createGame()         │  │
         │  └────────────────────────┘  │
         └────────────┬──────────────────┘
                      │
         ┌────────────▼──────────────────┐
         │                               │
         │   BACKEND API (C# .NET)       │
         │                               │
         │  POST   /api/game             │
         │  GET    /api/game/{id}        │
         │  POST   /api/game/{id}/roll   │
         │  POST   /api/game/{id}/buy    │
         │  POST   /api/game/{id}/...    │
         │                               │
         └────────────┬──────────────────┘
                      │
         ┌────────────▼──────────────────┐
         │                               │
         │   Base de Datos (SQL)         │
         │                               │
         │  • Games                      │
         │  • Players                    │
         │  • Tiles                      │
         │  • Properties                 │
         │  • Turns                      │
         │                               │
         └───────────────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════╗
║                          FLUJO DE DATOS                                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

1️⃣  INICIALIZACIÓN
    ┌──────────────┐
    │ Board.tsx    │
    │ Carga game   │
    │ ID del URL   │
    └──────┬───────┘
           │
    ┌──────▼──────────────────┐
    │ GameContainer           │
    │ Carga estado del juego  │
    │ desde API               │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │ getGame(gameId)         │
    │ ↓ HTTP GET /game/{id}   │
    │ ← Respuesta JSON        │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │ Renderizar tablero      │
    │ y componentes           │
    └──────────────────────────┘


2️⃣  LANZAMIENTO DE DADOS
    ┌────────────────────────────────┐
    │ Usuario hace clic en botón     │
    └──────────┬─────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │ Animar dados localmente         │
    │ (Framer Motion 3D)              │
    │ Duración: 1 segundo             │
    └──────────┬──────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │ rollDice(gameId, playerId)      │
    │ ↓ HTTP POST /game/{id}/roll     │
    │ ← { dice1, dice2, isDoubles }   │
    └──────────┬──────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │ Mover jugador paso a paso       │
    │ (7 pasos = 7 animaciones)       │
    │ 200ms por casilla               │
    └──────────┬──────────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │ Sincronizar estado               │
    │ desde respuesta API              │
    └──────────────────────────────────┘


3️⃣  COMPRA DE PROPIEDAD
    ┌─────────────────────────┐
    │ Usuario en acción       │
    │ "Comprar Propiedad"     │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │ buyProperty()           │
    │ ↓ HTTP POST /game/buy   │
    │ ← Nuevo GameState       │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │ Actualizar estado:      │
    │ • Dinero jugador ↓      │
    │ • Propiedad comprada ✓  │
    │ • Propietario asignado  │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │ Mostrar cambios en UI   │
    │ (Animación de actualización)
    └──────────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════╗
║                      ESTRUCTURA DE CARPETAS                                ║
╚═══════════════════════════════════════════════════════════════════════════╝

monopoly-frontend/
│
├── src/
│   │
│   ├── types/
│   │   └── game.types.ts              ✨ NUEVO
│   │       ├── GameDto
│   │       ├── PlayerDto
│   │       ├── TileDto
│   │       ├── DiceRollResponse
│   │       ├── TileTypeEnum
│   │       └── ...otros tipos
│   │
│   ├── components/
│   │   ├── Board/
│   │   │   └── MonopolyBoard.tsx      🔄 REFACTORIZADO
│   │   │       ├── Renderiza 40 casillas
│   │   │       ├── Tokens de jugadores
│   │   │       ├── Colores de propiedades
│   │   │       └── Mapeo de API
│   │   │
│   │   ├── Dice/
│   │   │   └── DiceRoller.tsx         🔄 REFACTORIZADO
│   │   │       ├── Animación 3D
│   │   │       ├── Detección de dobles
│   │   │       └── Integración con API
│   │   │
│   │   ├── Game/
│   │   │   └── GameContainer.tsx      ✨ NUEVO
│   │   │       ├── Orquestador principal
│   │   │       ├── Manejo de turnos
│   │   │       ├── Llamadas a API
│   │   │       └── Panel de control
│   │   │
│   │   └── index.ts                   ✨ NUEVO
│   │       └── Exportaciones centralizadas
│   │
│   ├── hooks/
│   │   └── useGameAnimations.ts       🔄 MEJORADO
│   │       ├── usePlayerMovement()
│   │       ├── useDiceRoll()
│   │       ├── useGameSounds()
│   │       └── useGameState()
│   │
│   ├── services/
│   │   └── api.ts                     🔄 MEJORADO
│   │       ├── getGame()
│   │       ├── rollDice()
│   │       ├── buyProperty()
│   │       ├── endTurn()
│   │       └── ...y más funciones
│   │
│   ├── Pages/
│   │   └── Board.tsx                  ✨ SIMPLIFICADO
│   │       └── Solo renderiza GameContainer
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── ...otros archivos
│
├── node_modules/
│   ├── framer-motion/                 📦 INSTALADO
│   ├── react-toastify/                📦 INSTALADO
│   └── ...otras dependencias
│
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts


╔═══════════════════════════════════════════════════════════════════════════╗
║                        FLUJO DE ESTADO                                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

                        ┌─────────────────────┐
                        │   GameState (API)   │
                        │  - Players[]        │
                        │  - Board            │
                        │  - CurrentPlayer    │
                        │  - Status           │
                        │  - Round            │
                        └────────────┬────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
    ┌─────▼──────────┐      ┌────────▼────────┐       ┌────────▼────────┐
    │   MonopolyBoard│      │  DiceRoller     │       │ ControlPanel    │
    │                │      │                 │       │                 │
    │ Props:         │      │ Props:          │       │ Props:          │
    │ • tiles        │      │ • dice1         │       │ • currentPlayer │
    │ • players      │      │ • dice2         │       │ • gameStatus    │
    │ • currentId    │      │ • isRolling     │       │ • onRoll()      │
    │ • onTileClick()│      │ • onRoll()      │       │ • onBuy()       │
    │                │      │ • disabled      │       │ • onEndTurn()   │
    └────────────────┘      └─────────────────┘       └─────────────────┘
          │                        │                          │
          └────────────────────────┼──────────────────────────┘
                                   │
                        ┌──────────▼───────────┐
                        │  Llamadas a API      │
                        │  (Disparan acciones) │
                        └──────────┬───────────┘
                                   │
                        ┌──────────▼───────────┐
                        │  Backend procesa     │
                        │  Valida y persiste   │
                        └──────────┬───────────┘
                                   │
                        ┌──────────▼───────────┐
                        │  Respuesta JSON      │
                        │  Nuevo GameState     │
                        └──────────┬───────────┘
                                   │
                        ┌──────────▼───────────┐
                        │  Sincronizar estado  │
                        │  Renderizar cambios  │
                        └──────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════╗
║                       TECNOLOGÍAS UTILIZADAS                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

Frontend:
  • React 19 - UI Library
  • TypeScript - Type Safety
  • Vite - Build Tool
  • Tailwind CSS - Styling
  • Framer Motion - Animations
  • React Router - Routing
  • Axios/Fetch - HTTP Client

Backend:
  • .NET 9 - Framework
  • C# - Language
  • Entity Framework - ORM
  • SQL Server/SQLite - Database
  • ASP.NET Core - Web API

Integración:
  • REST API - Communication
  • JSON - Data Format
  • CORS - Cross-Origin


╔═══════════════════════════════════════════════════════════════════════════╗
║                      CICLO DE VIDA DEL JUEGO                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

1. CARGA
   Board.tsx
    ↓
   GameContainer (useEffect)
    ↓
   getGame(gameId) → API
    ↓
   Renderizar MonopolyBoard + DiceRoller + Controls

2. ESPERA (Jugador A)
   - DiceRoller habilitado
   - "Lanzar Dados" visible
   - Panel muestra turno

3. LANZAMIENTO
   - Click en botón
   - Animar dados
   - rollDice(gameId, playerId) → API
   - Validar en backend

4. MOVIMIENTO
   - movePlayer() con animación
   - 200ms por casilla
   - Actualizar posición

5. ACCIÓN
   - Detectar tipo de casilla
   - Mostrar opciones (comprar, pagar renta, etc.)
   - Ejecutar buyProperty() si aplica

6. FIN DE TURNO
   - endTurn(gameId, playerId) → API
   - Cambiar turno
   - Siguiente jugador
   - Volver a paso 2

7. FINAL DEL JUEGO
   - Cuando queda un jugador
   - Mostrar ganador
   - Opción de nuevo juego


╔═══════════════════════════════════════════════════════════════════════════╗
║                         PUNTOS CLAVE                                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

✅ Todo está tipado con TypeScript
✅ Separación clara de responsabilidades
✅ Componentes reutilizables
✅ Animaciones fluidas a 60 FPS
✅ Integración completa con API
✅ Manejo robusto de errores
✅ Estado sincronizado con backend
✅ Fácil de mantener y extender

```
