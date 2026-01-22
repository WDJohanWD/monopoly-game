import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DiceRoller from '../Dice/DiceRoller';
import { usePlayerMovement, useDiceRoll, useGameSounds } from '../../hooks/useGameAnimations';
import { getGame, rollDice, buyProperty, endTurn } from '../../services/api';
import type { GameDto } from '../../types/game.types';
import MonopolyBoard from '../Board/MonopolyBoard';

interface GameContainerProps {
  gameId?: string;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameId: propGameId }) => {
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const gameId = propGameId || paramGameId;

  const [gameState, setGameState] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'rolling' | 'moving' | 'action'>('waiting');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const { playerPositions, initializePlayer, movePlayer, setPlayerPosition } = usePlayerMovement({
    boardSize: 40,
    animationDuration: 200,
  });

  const { isRolling, diceValues, rollDice: simulateDiceRoll } = useDiceRoll();
  const { playSound } = useGameSounds();

  // Cargar estado del juego
  useEffect(() => {
    if (!gameId) {
      setError('No game ID provided');
      setLoading(false);
      return;
    }

    const fetchGameState = async () => {
      try {
        setLoading(true);
        const response = await getGame(gameId);

        if (!response.success || !response.data) {
          setError(response.message || 'Error loading game');
          setLoading(false);
          return;
        }

        const gameData = response.data;
        setGameState(gameData);

        // Inicializar posiciones de jugadores
        gameData.players.forEach(player => {
          initializePlayer(player.id, player.position);
        });

        // Encontrar índice del jugador actual
        if (gameData.currentTurnPlayerId) {
          const currentIndex = gameData.players.findIndex(
            p => p.id === gameData.currentTurnPlayerId
          );
          if (currentIndex >= 0) {
            setCurrentPlayerIndex(currentIndex);
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchGameState();
  }, [gameId, initializePlayer]);

  // Note: playerPositions from the hook is passed directly to MonopolyBoard as a prop
  // DO NOT sync playerPositions back to gameState - this creates a circular dependency

  // Manejar lanzamiento de dados
  const handleRollDice = useCallback(async () => {
    if (!gameState || gameStatus !== 'waiting') return;

    const currentPlayer = gameState.players[currentPlayerIndex];
    if (!currentPlayer) return;

    setGameStatus('rolling');
    playSound('dice');

    try {
      // Simular lanzamiento localmente para animación de dados
      await simulateDiceRoll();

      // Llamar API del backend para obtener resultado REAL
      const response = await rollDice(gameId!, currentPlayer.id);

      if (!response.success || !response.data) {
        setError(response.message || 'Error rolling dice');
        setGameStatus('waiting');
        return;
      }

      const rollData = response.data;
      const { diceRoll, newPosition, mustPayRent, landedOnProperty, specialAction, isInJail } = rollData;

      // Obtener la posición actual del hook (no del gameState, que podría estar desincronizado)
      const playerPosData = playerPositions.find(p => p.playerId === currentPlayer.id);
      const currentAnimatedPosition = playerPosData?.currentPosition ?? currentPlayer.position;

      // Calcular cuántas casillas debe moverse (considerando el tablero circular)
      let steps = newPosition - currentAnimatedPosition;
      if (steps < 0) steps += 40; // Si pasó por GO

      console.log(`🎲 Dice: ${diceRoll.die1} + ${diceRoll.die2} = ${diceRoll.total}`);
      console.log(`📍 Current position (hook): ${currentAnimatedPosition}`);
      console.log(`📍 Current position (gameState): ${currentPlayer.position}`);
      console.log(`🎯 New position (backend): ${newPosition}`);
      console.log(`🚶 Steps to move: ${steps}`);

      // Esperar un poco antes de mover
      await new Promise(resolve => setTimeout(resolve, 500));

      setGameStatus('moving');
      movePlayer(currentPlayer.id, steps);
      playSound('move');

      // Esperar animación de movimiento (200ms por casilla + 500ms buffer)
      await new Promise(resolve => setTimeout(resolve, steps * 200 + 500));

      // Mostrar información de la casilla
      if (specialAction) {
        if (specialAction === 'GoToJail') {
          setError('¡Vas a la cárcel!');
        } else if (specialAction.startsWith('IncomeTax')) {
          const tax = specialAction.split(':')[1];
          setError(`Pagaste $${tax} de impuestos sobre la renta`);
        } else if (specialAction.startsWith('LuxuryTax')) {
          const tax = specialAction.split(':')[1];
          setError(`Pagaste $${tax} de impuesto de lujo`);
        } else if (specialAction === 'FreeParking') {
          setError('¡Estacionamiento gratuito!');
        }
      }

      if (mustPayRent && landedOnProperty) {
        setError(`Pagaste $${landedOnProperty.rent} de renta a ${landedOnProperty.ownerName}`);
      }

      // Recargar el estado completo del juego para sincronizar dinero y propiedades
      const gameRefresh = await getGame(gameId!);
      if (gameRefresh.success && gameRefresh.data) {
        const refreshedGame = gameRefresh.data;
        setGameState(refreshedGame);

        // Sincronizar las posiciones animadas con el estado real del backend
        refreshedGame.players.forEach(player => {
          setPlayerPosition(player.id, player.position);
        });

        // Actualizar índice del jugador actual
        const currentIndex = refreshedGame.players.findIndex(
          p => p.id === refreshedGame.currentTurnPlayerId
        );
        if (currentIndex >= 0) {
          setCurrentPlayerIndex(currentIndex);
        }
      }

      setGameStatus('action');
      playSound('action');

      // Si sacó dobles y no está en la cárcel, puede tirar de nuevo
      if (diceRoll.isDouble && !isInJail) {
        setTimeout(() => {
          setGameStatus('waiting');
        }, 2000);
      } else {
        // Si no sacó dobles o está en la cárcel, mostrar opciones
        setTimeout(() => {
          // El backend ya cambió el turno si es necesario
          // Solo mantenemos el estado en 'action' para que el usuario pueda actuar
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error in game');
      setGameStatus('waiting');
    }
  }, [gameId, gameState, currentPlayerIndex, gameStatus, simulateDiceRoll, movePlayer, playSound, setPlayerPosition, playerPositions]);

  // Manejar compra de propiedad
  const handleBuyProperty = useCallback(async () => {
    if (!gameState || gameStatus !== 'action') return;

    const currentPlayer = gameState.players[currentPlayerIndex];
    if (!currentPlayer) return;

    // Obtener la casilla donde está el jugador
    const currentTile = gameState.board?.tiles.find(t => t.position === currentPlayer.position);
    if (!currentTile?.property) {
      setError('No hay propiedad para comprar en esta casilla');
      return;
    }

    try {
      const response = await buyProperty(gameId!, currentPlayer.id, {
        propertyId: currentTile.property.id
      });

      if (!response.success) {
        setError(response.message || 'Error buying property');
        return;
      }

      // Actualizar estado del juego
      setGameState(response.data || gameState);
      playSound('buy');

      // El turno NO cambia automáticamente al comprar, el jugador debe terminar su turno manualmente
      setGameStatus('waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error in transaction');
    }
  }, [gameId, gameState, currentPlayerIndex, gameStatus, playSound]);

  // Manejar fin de turno
  const handleEndTurn = useCallback(async () => {
    if (!gameState) return;

    const currentPlayer = gameState.players[currentPlayerIndex];
    if (!currentPlayer) return;

    try {
      const response = await endTurn(gameId!, currentPlayer.id);

      if (!response.success) {
        setError(response.message || 'Error ending turn');
        return;
      }

      // Actualizar estado
      setGameState(response.data || gameState);
      const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
      setCurrentPlayerIndex(nextPlayerIndex);
      setGameStatus('waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ending turn');
    }
  }, [gameId, gameState, currentPlayerIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 gap-4">
        <div className="text-red-600 font-bold text-lg">{error || 'No game data'}</div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const currentPlayer = gameState.players[currentPlayerIndex];
  const [dice1, dice2] = diceValues;

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
      {/* Board section */}
      <div className="flex-1">
        <MonopolyBoard
          tiles={gameState.board?.tiles || []}
          players={gameState.players}
          playerPositions={playerPositions}
          currentPlayerId={currentPlayer?.id}
          onTileClick={(tileId) => {
            // Manejar clics en casillas si es necesario
            console.log('Clicked tile:', tileId);
          }}
        />
      </div>

      {/* Control panel */}
      <div className="md:w-80 flex flex-col gap-4">
        {/* Current player info */}
        {currentPlayer && (
          <motion.div
            className="bg-white rounded-lg shadow-lg p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold mb-4">Turno Actual</h2>
            <div
              className="p-4 rounded-lg text-white mb-4"
              style={{ backgroundColor: currentPlayer.color }}
            >
              <div className="font-bold text-lg">{currentPlayer.name}</div>
              <div className="text-sm">
                Dinero: ${currentPlayer.money}
              </div>
              <div className="text-sm">
                Posición: Casilla {currentPlayer.position}
              </div>
            </div>

            {/* Game status */}
            <div className="text-sm text-gray-600 mb-4">
              Estado: <span className="font-bold capitalize">{gameStatus}</span>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Dice roller */}
        <DiceRoller
          dice1={dice1}
          dice2={dice2}
          isRolling={isRolling}
          onRoll={handleRollDice}
          disabled={gameStatus !== 'waiting'}
        />

        {/* Game actions */}
        <div className="bg-white rounded-lg shadow-lg p-4 space-y-2">
          <h3 className="font-bold mb-3">Acciones</h3>

          {gameStatus === 'action' && (
            <>
              <button
                onClick={handleBuyProperty}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Comprar Propiedad
              </button>
            </>
          )}

          <button
            onClick={handleEndTurn}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Terminar Turno
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>

        {/* Players list */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-bold mb-3">Otros Jugadores</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {gameState.players
              .filter((_, idx) => idx !== currentPlayerIndex)
              .map(player => (
                <div key={player.id} className="text-sm border-b pb-2">
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-gray-600">
                    Dinero: ${player.money} | Pos: {player.position}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
