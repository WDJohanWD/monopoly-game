# Integración del Frontend de Monopoly

## 📋 Resumen de los cambios realizados

Se ha integrado completamente el diseño del tablero de Monopoly con animaciones y componentes del frontend, conectándolos directamente con la API del backend.

## 📁 Estructura creada

```
monopoly-frontend/
├── src/
│   ├── types/
│   │   └── game.types.ts           ← Tipos TypeScript centralizados
│   ├── components/
│   │   ├── Board/
│   │   │   └── MonopolyBoard.tsx    ← Tablero principal (integrado con API)
│   │   ├── Dice/
│   │   │   └── DiceRoller.tsx       ← Componente de dados animados
│   │   ├── Game/
│   │   │   └── GameContainer.tsx    ← Contenedor principal (orquesta todo)
│   │   └── index.ts                 ← Exportaciones
│   ├── hooks/
│   │   └── useGameAnimations.ts     ← Hooks de animación y estado
│   ├── services/
│   │   └── api.ts                   ← Cliente API (actualizado)
│   └── Pages/
│       └── Board.tsx                ← Página del tablero (simplificada)
```

## 🔌 Conexión con el Backend

### Funciones API disponibles:

1. **createGame()** - Crear nuevo juego
2. **getGame(gameId)** - Obtener estado actual del juego
3. **joinGame(gameId, playerName)** - Unirse a un juego
4. **rollDice(gameId, playerId)** - Lanzar dados
5. **buyProperty(gameId, playerId, buyPropertyDto)** - Comprar propiedad
6. **endTurn(gameId, playerId)** - Terminar turno

### Variables de entorno:

```env
VITE_API_URL=http://localhost:5093/api
```

## 🎮 Componentes integrados

### GameContainer
- **Propósito**: Orquesta el flujo del juego, gestiona estado y llamadas a API
- **Características**:
  - Carga el estado del juego desde la API
  - Maneja lanzamiento de dados
  - Controla movimiento de jugadores
  - Maneja compra de propiedades
  - Gestiona turnos

### MonopolyBoard
- **Propósito**: Renderiza el tablero visual con 40 casillas
- **Características**:
  - Tablero responsive
  - Tokens animados de jugadores
  - Colores de grupos de propiedades
  - Información de propiedades en hover
  - Panel central con info de jugadores

### DiceRoller
- **Propósito**: Componente de dados animado
- **Características**:
  - Animación 3D de rotación
  - Detección de dobles
  - Botón integrado con estados

## 🎯 Flujo de juego

1. **Inicialización**:
   - Se carga el estado del juego desde la API
   - Se inicializan las posiciones de los jugadores

2. **Turno del jugador**:
   - Jugador actual lanza dados (se anima localmente)
   - Se llama a la API para registrar el lanzamiento
   - El jugador se mueve (animación paso a paso)
   - Sistema detecta acciones necesarias (compra, etc.)

3. **Acción**:
   - Jugador puede comprar propiedad
   - Sistema registra en API
   - Siguiente turno

## 🎨 Características visuales

- **Animaciones suaves**: Movimiento de jugadores, rotación de dados, transiciones
- **Feedback visual**: Highlight del jugador actual, animación pulsante en turno
- **Información clara**: Tokens con colores, dinero, posición
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## 🚀 Cómo usar

### En Board.tsx o donde necesites mostrar el juego:

```tsx
import GameContainer from '@/components/Game/GameContainer';

function MyPage() {
  return <GameContainer gameId={gameId} />;
}
```

### O usando el componente de Página:

```tsx
import { Board } from '@/Pages/Board';

// En tu router
<Route path="/board/:gameId" element={<Board />} />
```

## ⚙️ Dependencias necesarias

```json
{
  "framer-motion": "^11.0.0",
  "react-toastify": "^10.0.0"
}
```

**Instalación**:
```bash
npm install framer-motion react-toastify
```

## 🔄 Sincronización Estado Backend-Frontend

### El GameContainer mantiene sincronización con:

1. **Posiciones de jugadores**: Se actualizan en tiempo real desde la API
2. **Dinero**: Se refleja inmediatamente después de acciones
3. **Turnos**: Sistema detecta cambios de turno desde respuesta API
4. **Propiedades**: Se marcan como compradas con indicador visual

## 📝 Notas importantes

- **Animaciones locales**: Las animaciones de dados y movimiento se ejecutan localmente para fluidez
- **Validación en API**: Todas las acciones se validan en el backend antes de ser confirmadas
- **Manejo de errores**: Los errores de API se muestran en la UI
- **Estado sincronizado**: El estado se actualiza desde respuestas API para mantener consistencia

## 🎯 Próximas mejoras opcionales

1. WebSockets para actualizaciones en tiempo real
2. Sonidos de juego
3. Historial de jugadas
4. Tarjetas de Suerte y Caja Comunitaria
5. Sistema de hipotecas
6. Modo multijugador en línea completo

## 📞 Soporte

Para actualizar o modificar los componentes, revisa:
- `game.types.ts` para cambiar tipos
- `useGameAnimations.ts` para modificar animaciones
- `GameContainer.tsx` para cambiar lógica del juego
- `MonopolyBoard.tsx` para cambiar renderizado
