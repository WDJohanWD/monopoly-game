import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DiceRoller from '../Dice/DiceRoller';
import { usePlayerMovement, useDiceRoll, useGameSounds } from '../../hooks/useGameAnimations';
import { getGame, rollDice, buyProperty, endTurn, payJailFine } from '../../services/api';
import type { GameDto, TileDto, DiceRollResponse } from '../../types/game.types';
import MonopolyBoard from '../Board/MonopolyBoard';
import { useSettings } from '../../contexts/SettingsContext';

interface GameContainerProps {
  gameId?: string;
}

// Tipos de notificaciones
interface GameNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameId: propGameId }) => {
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useSettings();
  const gameId = propGameId || paramGameId;

  const [gameState, setGameState] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'rolling' | 'moving' | 'action'>('waiting');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [lastRollData, setLastRollData] = useState<DiceRollResponse | null>(null);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);

  const { playerPositions, initializePlayer, movePlayer, setPlayerPosition } = usePlayerMovement({
    boardSize: 40,
    animationDuration: 200,
  });

  const { isRolling, diceValues, rollDice: simulateDiceRoll, setFinalDiceValues } = useDiceRoll();
  const { playSound } = useGameSounds();

  // Theme-aware styles
  const cardStyle = {
    backgroundColor: theme === 'dark' ? 'oklch(0.28 0.12 10)' : 'var(--menu-card)',
    borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
  };

  const textStyle = {
    color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)',
  };

  const accentStyle = {
    backgroundColor: theme === 'dark' ? 'oklch(0.6 0.18 30)' : 'var(--menu-accent)',
    borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
    color: theme === 'dark' ? 'oklch(0.95 0.02 90)' : 'var(--menu-button-text)',
  };

  const bgStyle = {
    backgroundColor: theme === 'dark' ? 'oklch(0.22 0.15 15)' : 'var(--menu-bg)',
  };

  // Función para añadir notificación
  const addNotification = useCallback((type: GameNotification['type'], message: string) => {
    const notification: GameNotification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 5));

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Cargar estado del juego
  useEffect(() => {
    if (!gameId) {
      addNotification('error', t('game.noGameId', 'No se proporcionó ID del juego'));
      setLoading(false);
      return;
    }

    const fetchGameState = async () => {
      try {
        setLoading(true);
        const response = await getGame(gameId);

        if (!response.success || !response.data) {
          addNotification('error', response.message || t('game.loadError', 'Error al cargar el juego'));
          setLoading(false);
          return;
        }

        const gameData = response.data;
        setGameState(gameData);

        gameData.players.forEach(player => {
          initializePlayer(player.id, player.position);
        });

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
        addNotification('error', err instanceof Error ? err.message : t('game.unknownError', 'Error desconocido'));
        setLoading(false);
      }
    };

    fetchGameState();
  }, [gameId, initializePlayer, addNotification, t]);

  const getCurrentTile = useCallback((): TileDto | null => {
    if (!gameState || !gameState.board) return null;
    const currentPlayer = gameState.players[currentPlayerIndex];
    if (!currentPlayer) return null;
    return gameState.board.tiles.find(t => t.position === currentPlayer.position) || null;
  }, [gameState, currentPlayerIndex]);

  const isCurrentPlayerInJail = useCallback((): boolean => {
    if (!gameState) return false;
    const currentPlayer = gameState.players[currentPlayerIndex];
    return currentPlayer?.status === 'InJail';
  }, [gameState, currentPlayerIndex]);

  const canBuyCurrentProperty = useCallback((): boolean => {
    if (!gameState) return false;
    const currentPlayer = gameState.players[currentPlayerIndex];
    const currentTile = getCurrentTile();

    if (!currentPlayer || !currentTile?.property) return false;
    if (currentTile.property.ownerId) return false;
    if (currentPlayer.money < currentTile.property.price) return false;

    if (lastRollData) {
      return lastRollData.canBuyProperty;
    }

    return hasRolledThisTurn;
  }, [gameState, currentPlayerIndex, getCurrentTile, lastRollData, hasRolledThisTurn]);

  const handleRollDice = useCallback(async () => {
    if (!gameState || gameStatus !== 'waiting') return;

    const currentPlayer = gameState.players[currentPlayerIndex];
    if (!currentPlayer) return;

    setGameStatus('rolling');
    playSound('dice');

    try {
      await simulateDiceRoll();
      const response = await rollDice(gameId!, currentPlayer.id);

      if (!response.success || !response.data) {
        addNotification('error', response.message || t('game.rollError', 'Error al lanzar dados'));
        setGameStatus('waiting');
        return;
      }

      const rollData = response.data;
      setLastRollData(rollData);
      setHasRolledThisTurn(true);

      const { diceRoll, newPosition, mustPayRent, landedOnProperty, specialAction, isInJail } = rollData;

      setFinalDiceValues(diceRoll.die1, diceRoll.die2);

      addNotification('info', `${t('game.diceResult', 'Dados')}: ${diceRoll.die1} + ${diceRoll.die2} = ${diceRoll.total}${diceRoll.isDouble ? ` (${t('game.doubles', '¡Dobles!')})` : ''}`);

      const playerPosData = playerPositions.find(p => p.playerId === currentPlayer.id);
      const currentAnimatedPosition = playerPosData?.currentPosition ?? currentPlayer.position;

      let steps = newPosition - currentAnimatedPosition;
      if (steps < 0) steps += 40;

      await new Promise(resolve => setTimeout(resolve, 500));

      setGameStatus('moving');
      movePlayer(currentPlayer.id, steps);
      playSound('move');

      await new Promise(resolve => setTimeout(resolve, steps * 200 + 500));

      if (specialAction) {
        if (specialAction === 'GoToJail') {
          addNotification('warning', t('game.goToJail', '¡Vas a la cárcel!'));
        } else if (specialAction.startsWith('IncomeTax')) {
          const tax = specialAction.split(':')[1];
          addNotification('warning', t('game.incomeTax', 'Pagaste ${{amount}} de impuestos', { amount: tax }));
        } else if (specialAction.startsWith('LuxuryTax')) {
          const tax = specialAction.split(':')[1];
          addNotification('warning', t('game.luxuryTax', 'Pagaste ${{amount}} de impuesto de lujo', { amount: tax }));
        } else if (specialAction === 'FreeParking') {
          addNotification('success', t('game.freeParking', '¡Estacionamiento gratuito!'));
        }
      }

      if (mustPayRent && landedOnProperty) {
        addNotification('warning', t('game.paidRent', 'Pagaste ${{amount}} de renta a {{owner}}', { amount: landedOnProperty.rent, owner: landedOnProperty.ownerName }));
      }

      if (rollData.canBuyProperty && landedOnProperty) {
        addNotification('info', t('game.propertyAvailable', '{{name}} está disponible por ${{price}}', { name: landedOnProperty.name, price: landedOnProperty.price }));
      }

      const gameRefresh = await getGame(gameId!);
      if (gameRefresh.success && gameRefresh.data) {
        const refreshedGame = gameRefresh.data;
        setGameState(refreshedGame);

        refreshedGame.players.forEach(player => {
          setPlayerPosition(player.id, player.position);
        });

        const newCurrentIndex = refreshedGame.players.findIndex(
          p => p.id === refreshedGame.currentTurnPlayerId
        );
        if (newCurrentIndex >= 0) {
          setCurrentPlayerIndex(newCurrentIndex);
        }
      }

      setGameStatus('action');
      playSound('action');

      if (diceRoll.isDouble && !isInJail) {
        addNotification('success', t('game.doublesRollAgain', '¡Dobles! Puedes tirar de nuevo'));
        setHasRolledThisTurn(false);
        setTimeout(() => {
          setGameStatus('waiting');
        }, 2000);
      }
    } catch (err) {
      addNotification('error', err instanceof Error ? err.message : t('game.gameError', 'Error en el juego'));
      setGameStatus('waiting');
    }
  }, [gameId, gameState, currentPlayerIndex, gameStatus, simulateDiceRoll, movePlayer, playSound, setPlayerPosition, playerPositions, addNotification, setFinalDiceValues, t]);

  const handleBuyProperty = useCallback(async () => {
    if (!gameState || !canBuyCurrentProperty()) return;

    const currentPlayer = gameState.players[currentPlayerIndex];
    const currentTile = getCurrentTile();

    if (!currentPlayer || !currentTile?.property) {
      addNotification('error', t('game.noPropertyToBuy', 'No hay propiedad para comprar'));
      return;
    }

    try {
      const response = await buyProperty(gameId!, currentPlayer.id, {
        propertyId: currentTile.property.id
      });

      if (!response.success) {
        addNotification('error', response.message || t('game.buyError', 'Error al comprar propiedad'));
        return;
      }

      addNotification('success', t('game.propertyBought', '¡Compraste {{name}} por ${{price}}!', { name: currentTile.property.name, price: currentTile.property.price }));
      setGameState(response.data || gameState);
      setLastRollData(null);
      playSound('buy');
    } catch (err) {
      addNotification('error', err instanceof Error ? err.message : t('game.transactionError', 'Error en la transacción'));
    }
  }, [gameId, gameState, currentPlayerIndex, getCurrentTile, canBuyCurrentProperty, playSound, addNotification, t]);

  const handlePayJailFine = useCallback(async () => {
    if (!gameState || !isCurrentPlayerInJail()) return;

    const currentPlayer = gameState.players[currentPlayerIndex];
    if (!currentPlayer) return;

    if (currentPlayer.money < 50) {
      addNotification('error', t('game.notEnoughForBail', 'No tienes suficiente dinero para la fianza ($50)'));
      return;
    }

    try {
      const response = await payJailFine(gameId!, currentPlayer.id);

      if (!response.success) {
        addNotification('error', response.message || t('game.bailError', 'Error al pagar fianza'));
        return;
      }

      addNotification('success', t('game.bailPaid', '¡Pagaste $50 y saliste de la cárcel!'));
      setGameState(response.data || gameState);
      playSound('buy');
    } catch (err) {
      addNotification('error', err instanceof Error ? err.message : t('game.bailError', 'Error al pagar fianza'));
    }
  }, [gameId, gameState, currentPlayerIndex, isCurrentPlayerInJail, playSound, addNotification, t]);

  const handleEndTurn = useCallback(async () => {
    if (!gameState) return;

    const currentPlayer = gameState.players[currentPlayerIndex];
    if (!currentPlayer) return;

    try {
      const response = await endTurn(gameId!, currentPlayer.id);

      if (!response.success) {
        addNotification('error', response.message || t('game.endTurnError', 'Error al terminar turno'));
        return;
      }

      setLastRollData(null);
      setHasRolledThisTurn(false);

      if (response.data) {
        setGameState(response.data);

        const newCurrentIndex = response.data.players.findIndex(
          p => p.id === response.data!.currentTurnPlayerId
        );
        if (newCurrentIndex >= 0) {
          setCurrentPlayerIndex(newCurrentIndex);
          const nextPlayer = response.data.players[newCurrentIndex];
          addNotification('info', t('game.nextTurn', 'Turno de {{name}}', { name: nextPlayer.name }));
        }
      }

      setGameStatus('waiting');
    } catch (err) {
      addNotification('error', err instanceof Error ? err.message : t('game.endTurnError', 'Error al terminar turno'));
    }
  }, [gameId, gameState, currentPlayerIndex, addNotification, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={bgStyle}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-t-transparent"
          style={{ borderColor: theme === 'dark' ? 'oklch(0.6 0.18 30)' : 'var(--menu-accent)' }}
        />
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={bgStyle}>
        <div className="font-mono font-bold text-lg" style={{ color: theme === 'dark' ? 'oklch(0.7 0.2 25)' : 'red' }}>
          {t('game.loadFailed', 'No se pudo cargar el juego')}
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 font-mono border-4 transition-colors shadow-[3px_3px_0px_rgba(0,0,0,0.3)]"
          style={accentStyle}
        >
          {t('game.backToHome', 'Volver al Inicio')}
        </button>
      </div>
    );
  }

  const currentPlayer = gameState.players[currentPlayerIndex];
  const currentTile = getCurrentTile();
  const [dice1, dice2] = diceValues;
  const playerInJail = isCurrentPlayerInJail();

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen" style={bgStyle}>
      {/* Notificaciones */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="p-3 border-4 font-mono text-sm shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
              style={{
                borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
                backgroundColor: notification.type === 'error' ? (theme === 'dark' ? 'oklch(0.45 0.2 25)' : '#ef4444') :
                  notification.type === 'warning' ? (theme === 'dark' ? 'oklch(0.6 0.18 85)' : '#eab308') :
                  notification.type === 'success' ? (theme === 'dark' ? 'oklch(0.5 0.15 145)' : '#22c55e') :
                  (theme === 'dark' ? 'oklch(0.28 0.12 10)' : 'var(--menu-card)'),
                color: notification.type === 'warning' ? '#000' : (theme === 'dark' ? 'oklch(0.92 0.02 90)' :
                  (notification.type === 'info' ? 'var(--menu-button-text)' : '#fff')),
              }}
            >
              {notification.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Board section */}
      <div className="flex-1">
        <MonopolyBoard
          tiles={gameState.board?.tiles || []}
          players={gameState.players}
          playerPositions={playerPositions}
          currentPlayerId={currentPlayer?.id}
          onTileClick={(tileId) => {
            console.log('Clicked tile:', tileId);
          }}
        />
      </div>

      {/* Control panel */}
      <div className="md:w-96 flex flex-col gap-4">
        {/* Current player info */}
        {currentPlayer && (
          <motion.div
            className="border-4 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
            style={cardStyle}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-mono text-xl font-bold mb-4" style={textStyle}>
              {t('game.currentTurn', 'Turno Actual')}
            </h2>
            <div
              className="p-4 text-white mb-4 border-4 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
              style={{
                backgroundColor: currentPlayer.color,
                borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
              }}
            >
              <div className="font-mono font-bold text-lg">{currentPlayer.name}</div>
              <div className="font-mono text-sm">{t('game.money', 'Dinero')}: ${currentPlayer.money}</div>
              <div className="font-mono text-sm">{t('game.position', 'Posición')}: {t('game.tile', 'Casilla')} {currentPlayer.position}</div>
              {playerInJail && (
                <div className="font-mono text-sm mt-2 bg-black/30 p-2">
                  {t('game.inJail', 'EN LA CÁRCEL')} ({currentPlayer.turnsInJail}/3 {t('game.turns', 'turnos')})
                </div>
              )}
            </div>

            <div className="font-mono text-sm mb-2" style={textStyle}>
              {t('game.status', 'Estado')}: <span className="font-bold capitalize">{
                gameStatus === 'waiting' ? t('game.statusWaiting', 'Esperando') :
                gameStatus === 'rolling' ? t('game.statusRolling', 'Lanzando dados') :
                gameStatus === 'moving' ? t('game.statusMoving', 'Moviendo') :
                t('game.statusAction', 'Eligiendo acción')
              }</span>
            </div>
          </motion.div>
        )}

        {/* Información de la casilla actual */}
        {currentTile && hasRolledThisTurn && (
          <motion.div
            className="border-4 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
            style={cardStyle}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="font-mono font-bold mb-2" style={textStyle}>
              {t('game.currentTile', 'Casilla Actual')}
            </h3>
            <div className="font-mono text-sm" style={textStyle}>
              <div className="font-bold">{currentTile.name}</div>
              {currentTile.property && (
                <>
                  <div>{t('game.price', 'Precio')}: ${currentTile.property.price}</div>
                  <div>{t('game.rent', 'Renta')}: ${currentTile.property.rent}</div>
                  {currentTile.property.ownerId ? (
                    <div style={{ color: theme === 'dark' ? 'oklch(0.7 0.18 85)' : '#ca8a04' }}>
                      {t('game.owner', 'Dueño')}: {currentTile.property.ownerName || t('game.otherPlayer', 'Otro jugador')}
                    </div>
                  ) : (
                    <div style={{ color: theme === 'dark' ? 'oklch(0.6 0.15 145)' : '#16a34a' }}>
                      {t('game.availableToBuy', 'Disponible para comprar')}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Dice roller */}
        <DiceRoller
          dice1={dice1}
          dice2={dice2}
          isRolling={isRolling}
          onRoll={handleRollDice}
          disabled={gameStatus !== 'waiting' || hasRolledThisTurn}
        />

        {/* Game actions */}
        <div className="border-4 p-4 space-y-2 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]" style={cardStyle}>
          <h3 className="font-mono font-bold mb-3" style={textStyle}>
            {t('game.actions', 'Acciones')}
          </h3>

          {playerInJail && gameStatus === 'waiting' && !hasRolledThisTurn && (
            <button
              onClick={handlePayJailFine}
              disabled={currentPlayer && currentPlayer.money < 50}
              className="w-full px-4 py-2 font-mono border-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
              style={{
                backgroundColor: theme === 'dark' ? 'oklch(0.55 0.15 85)' : '#ca8a04',
                borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
                color: '#fff',
              }}
            >
              {t('game.payBail', 'Pagar Fianza ($50)')}
            </button>
          )}

          {canBuyCurrentProperty() && hasRolledThisTurn && (
            <button
              onClick={handleBuyProperty}
              className="w-full px-4 py-2 font-mono border-4 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
              style={{
                backgroundColor: theme === 'dark' ? 'oklch(0.5 0.15 145)' : '#16a34a',
                borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
                color: '#fff',
              }}
            >
              {t('game.buyProperty', 'Comprar Propiedad')} (${getCurrentTile()?.property?.price})
            </button>
          )}

          {hasRolledThisTurn && (
            <button
              onClick={handleEndTurn}
              className="w-full px-4 py-2 font-mono border-4 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
              style={accentStyle}
            >
              {t('game.endTurn', 'Terminar Turno')}
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 font-mono border-4 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
            style={{
              backgroundColor: theme === 'dark' ? 'oklch(0.35 0.1 15)' : 'var(--menu-button)',
              borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
              color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)',
            }}
          >
            {t('game.backToHome', 'Volver al Inicio')}
          </button>
        </div>

        {/* Lista de propiedades del jugador */}
        {currentPlayer && currentPlayer.properties && currentPlayer.properties.length > 0 && (
          <div className="border-4 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]" style={cardStyle}>
            <h3 className="font-mono font-bold mb-3" style={textStyle}>
              {t('game.yourProperties', 'Tus Propiedades')}
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {currentPlayer.properties.map(prop => (
                <div
                  key={prop.id}
                  className="font-mono text-xs border-b pb-1"
                  style={{
                    color: theme === 'dark' ? 'oklch(0.85 0.02 90)' : 'var(--menu-button-text)',
                    borderColor: theme === 'dark' ? 'oklch(0.4 0.1 20)' : 'var(--menu-border)',
                  }}
                >
                  <span className="font-bold">{prop.name}</span> - {t('game.rent', 'Renta')}: ${prop.rent}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players list */}
        <div className="border-4 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]" style={cardStyle}>
          <h3 className="font-mono font-bold mb-3" style={textStyle}>
            {t('game.otherPlayers', 'Otros Jugadores')}
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {gameState.players
              .filter((_, idx) => idx !== currentPlayerIndex)
              .map(player => (
                <div
                  key={player.id}
                  className="font-mono text-sm border-b pb-2"
                  style={{ borderColor: theme === 'dark' ? 'oklch(0.4 0.1 20)' : 'var(--menu-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 border-2 shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"
                      style={{
                        backgroundColor: player.color,
                        borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
                      }}
                    />
                    <span className="font-semibold" style={textStyle}>{player.name}</span>
                    {player.status === 'InJail' && <span>🔒</span>}
                    {player.status === 'Bankrupt' && <span>💸</span>}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: theme === 'dark' ? 'oklch(0.7 0.02 90)' : 'rgba(0,0,0,0.6)' }}
                  >
                    ${player.money} | {t('game.position', 'Pos')}: {player.position} | {player.properties?.length || 0} {t('game.properties', 'propiedades')}
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
