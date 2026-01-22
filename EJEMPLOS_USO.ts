/**
 * EJEMPLO DE USO: Cómo usar los componentes integrados
 * 
 * Este archivo muestra ejemplos prácticos de cómo implementar
 * el sistema completo de Monopoly con la integración backend-frontend
 */

// ============================================
// EJEMPLO 1: Usar GameContainer directamente
// ============================================

import { GameContainer } from '@/components';

export function MyGamePage() {
  return (
    <div>
      {/* El GameContainer maneja todo automáticamente */}
      <GameContainer gameId="game-123" />
    </div>
  );
}

// ============================================
// EJEMPLO 2: Usar componentes individuales
// ============================================

import { MonopolyBoard, DiceRoller } from '@/components';
import { useState } from 'react';
import { getGame, rollDice } from '@/services/api';
import type { GameDto } from '@/types/game.types';

export function CustomGamePage() {
  const [game, setGame] = useState<GameDto | null>(null);
  const [currentDice, setCurrentDice] = useState<[number, number]>([1, 1]);

  const handleRollDice = async () => {
    if (!game?.players[0]) return;
    
    const response = await rollDice(game.id, game.players[0].id);
    if (response.success && response.data) {
      setCurrentDice([response.data.dice1, response.data.dice2]);
    }
  };

  return (
    <div className="flex gap-4">
      {game && (
        <>
          <MonopolyBoard
            tiles={game.board?.tiles || []}
            players={game.players}
            currentPlayerId={game.currentTurnPlayerId}
            onTileClick={(tileId) => console.log('Clicked tile:', tileId)}
          />
          <DiceRoller
            dice1={currentDice[0]}
            dice2={currentDice[1]}
            isRolling={false}
            onRoll={handleRollDice}
          />
        </>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 3: Control total del flujo
// ============================================

import { usePlayerMovement, useDiceRoll } from '@/hooks/useGameAnimations';
import { buyProperty, endTurn } from '@/services/api';

export function AdvancedGamePage() {
  const [gameId] = useState('game-123');
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const { playerPositions, movePlayer } = usePlayerMovement({
    boardSize: 40,
    animationDuration: 200,
  });

  const { isRolling, diceValues, rollDice } = useDiceRoll();

  const handleRollAndMove = async () => {
    const currentPlayer = players[currentPlayerIndex];
    
    // Simular lanzamiento localmente
    const [dice1, dice2] = await rollDice();
    
    // Llamar API para registrar
    const response = await rollDice(gameId, currentPlayer.id);
    
    // Mover jugador
    movePlayer(currentPlayer.id, dice1 + dice2);

    // Después, manejar compra u otro turno
    // ...
  };

  const handleBuy = async (tileId: number) => {
    const currentPlayer = players[currentPlayerIndex];
    const response = await buyProperty(gameId, currentPlayer.id, { tileId });
    
    if (response.success) {
      // Actualizar estado del juego
      console.log('Propiedad comprada:', response.data);
    }
  };

  const handleEndTurn = async () => {
    const currentPlayer = players[currentPlayerIndex];
    const response = await endTurn(gameId, currentPlayer.id);
    
    if (response.success) {
      // Pasar al siguiente jugador
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    }
  };

  return (
    <div>
      {/* Tu UI personalizada aquí */}
      <button onClick={handleRollAndMove}>Lanzar Dados</button>
      <button onClick={() => handleBuy(1)}>Comprar Propiedad</button>
      <button onClick={handleEndTurn}>Terminar Turno</button>
    </div>
  );
}

// ============================================
// EJEMPLO 4: Integración en router
// ============================================

import { createBrowserRouter } from 'react-router-dom';
import { Board } from '@/Pages/Board';

export const router = createBrowserRouter([
  {
    path: '/board/:gameId',
    element: <Board />,
  },
  {
    path: '/custom-game/:gameId',
    element: <CustomGamePage />,
  },
  {
    path: '/advanced-game/:gameId',
    element: <AdvancedGamePage />,
  },
]);

// ============================================
// EJEMPLO 5: Manejo de errores
// ============================================

import { useState } from 'react';

export function GamePageWithErrorHandling() {
  const [error, setError] = useState<string | null>(null);

  const handleGameAction = async () => {
    try {
      setError(null);
      
      // Tu código aquí
      const response = await getGame('game-123');
      
      if (!response.success) {
        setError(response.message || 'Error desconocido');
        return;
      }
      
      // Usar datos...
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <button onClick={handleGameAction}>Realizar acción</button>
    </div>
  );
}

// ============================================
// EJEMPLO 6: Tipos TypeScript
// ============================================

import type {
  GameDto,
  PlayerDto,
  TileDto,
  DiceRollResponse,
} from '@/types/game.types';

interface GameState {
  game: GameDto | null;
  currentPlayerIndex: number;
  lastDiceRoll: DiceRollResponse | null;
  error: string | null;
}

// ============================================
// FLUJO TÍPICO DE JUEGO
// ============================================

/*
1. Usuario accede a /board/game-123

2. Board.tsx renderiza GameContainer

3. GameContainer:
   - Carga el estado del juego desde API
   - Inicializa posiciones de jugadores
   - Renderiza MonopolyBoard y DiceRoller

4. Usuario hace clic en "Lanzar Dados"

5. Sistema:
   - Anima los dados localmente
   - Llama API /game/{id}/roll
   - Mueve jugador (animación)
   - Espera acción del jugador
   - Ofrece botón "Comprar Propiedad" si aplica
   - O pasa al siguiente turno

6. Todos los cambios se sincronizan desde la API

*/

// ============================================
// NOTAS IMPORTANTES
// ============================================

/*
✓ Las animaciones se ejecutan LOCALMENTE para fluidez
✓ TODAS las acciones se validan en el BACKEND
✓ El estado se sincroniza desde las RESPUESTAS DE API
✓ Los errores se manejan y se muestran al usuario
✓ El sistema detecta automáticamente dobles
✓ Las transacciones se registran en la base de datos

*/
