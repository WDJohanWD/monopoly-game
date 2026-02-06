/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import type { PlayerPosition } from '../types/game.types';

interface UsePlayerMovementProps {
  boardSize?: number;
  animationDuration?: number;
}

export const usePlayerMovement = ({ 
  boardSize = 40, 
  animationDuration = 200 
}: UsePlayerMovementProps = {}) => {
  const [playerPositions, setPlayerPositions] = useState<Map<string, PlayerPosition>>(new Map());

  const initializePlayer = useCallback((playerId: string, initialPosition: number = 0) => {
    setPlayerPositions(prev => {
      const newMap = new Map(prev);
      newMap.set(playerId, {
        playerId,
        currentPosition: initialPosition,
        targetPosition: initialPosition,
        isMoving: false,
      });
      return newMap;
    });
  }, []);

  const movePlayer = useCallback((playerId: string, steps: number) => {
    setPlayerPositions(prev => {
      const newMap = new Map(prev);
      const player = newMap.get(playerId);
      
      if (!player) {
        console.warn(`Player ${playerId} not found`);
        return prev;
      }

      const newPosition = (player.currentPosition + steps) % boardSize;
      
      newMap.set(playerId, {
        ...player,
        targetPosition: newPosition,
        isMoving: true,
      });

      return newMap;
    });
  }, [boardSize]);

  const setPlayerPosition = useCallback((playerId: string, position: number) => {
    setPlayerPositions(prev => {
      const newMap = new Map(prev);
      const player = newMap.get(playerId);
      
      if (!player) {
        console.warn(`Player ${playerId} not found`);
        return prev;
      }

      newMap.set(playerId, {
        ...player,
        currentPosition: position,
        targetPosition: position,
        isMoving: false,
      });

      return newMap;
    });
  }, []);

  // Animar el movimiento paso a paso
  useEffect(() => {
    const intervals: ReturnType<typeof setInterval>[] = [];

    playerPositions.forEach((player) => {
      if (player.isMoving && player.currentPosition !== player.targetPosition) {
        const interval = setInterval(() => {
          setPlayerPositions(prev => {
            const newMap = new Map(prev);
            const currentPlayer = newMap.get(player.playerId);
            
            if (!currentPlayer) return prev;

            if (currentPlayer.currentPosition === currentPlayer.targetPosition) {
              clearInterval(interval);
              newMap.set(player.playerId, {
                ...currentPlayer,
                isMoving: false,
              });
              return newMap;
            }

            const nextPosition = (currentPlayer.currentPosition + 1) % boardSize;
            
            newMap.set(player.playerId, {
              ...currentPlayer,
              currentPosition: nextPosition,
            });

            return newMap;
          });
        }, animationDuration);

        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [playerPositions, boardSize, animationDuration]);

  return {
    playerPositions: Array.from(playerPositions.values()),
    initializePlayer,
    movePlayer,
    setPlayerPosition,
  };
};

interface UseDiceRollProps {
  duration?: number;
}

export const useDiceRoll = ({ duration = 1000 }: UseDiceRollProps = {}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);

  // Animar los dados sin establecer valores finales (los valores finales vendrán del backend)
  const rollDice = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setIsRolling(true);

      // Animar los dados girando con valores aleatorios durante la animación
      let iterations = 0;
      const interval = setInterval(() => {
        setDice1(Math.floor(Math.random() * 6) + 1);
        setDice2(Math.floor(Math.random() * 6) + 1);
        iterations++;

        if (iterations > duration / 50) {
          clearInterval(interval);
          setIsRolling(false);
          resolve();
        }
      }, 50);
    });
  }, [duration]);

  // Función para establecer los valores finales desde el backend
  const setFinalDiceValues = useCallback((d1: number, d2: number) => {
    setDice1(d1);
    setDice2(d2);
  }, []);

  return {
    isRolling,
    diceValues: [dice1, dice2] as [number, number],
    rollDice,
    setFinalDiceValues,
  };
};

export const useGameSounds = () => {
  const playSound = useCallback((soundName: string) => {
    // Por ahora solo hacemos un console.log, puede extenderse para sonidos reales
    console.log(`Playing sound: ${soundName}`);
  }, []);

  return {
    playSound,
  };
};

// Hook personalizado para manejar el estado del juego
interface UseGameStateProps {
  gameId: string;
  onGameUpdate?: (gameState: any) => void;
}

export const useGameState = ({ gameId, onGameUpdate }: UseGameStateProps) => {
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        setLoading(true);
        // Aquí iría la llamada a la API
        // const response = await getGame(gameId);
        // setGameState(response.data);
        // onGameUpdate?.(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGameState();
    }
  }, [gameId, onGameUpdate]);

  return {
    gameState,
    loading,
    error,
    setGameState,
  };
};
