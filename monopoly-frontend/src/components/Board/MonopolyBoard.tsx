'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';
import type { PlayerDto, TileDto, PlayerPosition } from '../../types/game.types';

// Mapeo de colores del backend a códigos hex
const COLOR_MAP: Record<string, string> = {
  'Brown': '#8B4513',
  'Light Blue': '#87CEEB',
  'Pink': '#FF69B4',
  'Orange': '#FFA500',
  'Red': '#FF0000',
  'Yellow': '#FFFF00',
  'Green': '#008000',
  'Dark Blue': '#0000FF',
  'Railroad': '#000000',
  'Utility': '#808080'
};

interface MonopolyBoardProps {
  tiles: TileDto[];
  players: PlayerDto[];
  playerPositions?: PlayerPosition[];
  currentPlayerId?: string;
  onTileClick?: (tileId: number) => void;
}

const MonopolyBoard: React.FC<MonopolyBoardProps> = ({
  tiles,
  players,
  playerPositions,
  currentPlayerId,
  onTileClick,
}) => {
  const { t } = useTranslation();
  const { theme } = useSettings();
  
  const getPlayerPosition = (playerId: string): number => {
    if (playerPositions && playerPositions.length > 0) {
      const animatedPos = playerPositions.find(p => p.playerId === playerId);
      if (animatedPos) {
        return animatedPos.currentPosition;
      }
    }
    // Fallback a la posición estática del gameState
    const player = players.find(p => p.id === playerId);
    return player?.position || 0;
  };

  // Organizar tiles por sección del tablero (40 casillas)
  // El flujo del Monopoly es: 0(GO) → 1 → ... → 10(Jail) → 11 → ... → 20(Free Parking) → 21 → ... → 30 → 31 → ... → 39 → 0
  const sections = useMemo(() => {
    const sortedTiles = tiles.sort((a, b) => a.position - b.position);

    return {
      bottom: sortedTiles.slice(0, 11).reverse(),  // 0-10: Invertido para que GO esté a la derecha
      left: sortedTiles.slice(11, 20).reverse(),   // 11-19: Invertido para que 11 esté abajo
      top: sortedTiles.slice(20, 31),              // 20-30: Sin invertir, 20 (Free Parking) a la izquierda
      right: sortedTiles.slice(31, 40),            // 31-39: Sin invertir, 31 arriba y 39 abajo
    };
  }, [tiles]);

  const getTileColor = (colorGroup?: string): string => {
    if (!colorGroup) return 'white';
    return COLOR_MAP[colorGroup] || 'white';
  };

  const renderTile = (tile: TileDto, isVertical: boolean = false) => {
    // Filtrar jugadores usando la posición animada
    const playersOnTile = players.filter(p => getPlayerPosition(p.id) === tile.position);
    const tileColor = tile.property?.colorGroup ? getTileColor(tile.property.colorGroup) : 'white';

    return (
      <motion.div
        key={tile.id}
        className={`
          relative border-2 cursor-pointer
          ${isVertical ? 'h-24 w-16' : 'h-16 w-24'}
          ${tile.type === 0 || tile.type === 6 || tile.type === 7 || tile.type === 8 ? 'h-24 w-24' : ''}
          transition-all duration-200 hover:shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:z-10
          ${currentPlayerId && playersOnTile.some(p => p.id === currentPlayerId) ? 'ring-4 ring-offset-2' : ''}
        `}
        style={{
          backgroundColor: theme === 'dark' ? 'oklch(0.28 0.12 10)' : 'var(--menu-card)',
          borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
          outlineColor: theme === 'dark' ? 'oklch(0.6 0.18 30)' : 'var(--menu-accent)',
        }}
        whileHover={{ scale: 1.05 }}
        onClick={() => onTileClick?.(tile.id)}
      >
        {/* Color bar for properties */}
        {tileColor !== 'white' && (
          <div
            className={`
              ${isVertical ? 'h-full w-3' : 'h-3 w-full'}
              absolute ${isVertical ? 'left-0' : 'top-0'}
            `}
            style={{ backgroundColor: tileColor }}
          />
        )}

        {/* Tile content */}
        <div className={`
          flex flex-col items-center justify-center h-full p-1
          ${isVertical ? 'pl-4' : 'pt-4'}
        `}>
          <span className={`
            font-mono text-xs font-bold text-center line-clamp-2
            ${tile.type === 0 || tile.type === 6 || tile.type === 7 || tile.type === 8 ? 'text-sm' : ''}
          `}
          style={{ color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)' }}>
            {tile.name}
          </span>
          {tile.property?.price && (
            <span className="font-mono text-[10px] mt-1" style={{ color: theme === 'dark' ? 'oklch(0.7 0.02 90)' : 'var(--menu-button-text)' }}>
              ${tile.property.price}
            </span>
          )}
          {tile.property?.ownerId && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-menu-accent border border-menu-border" />
          )}
        </div>

        {/* Player tokens on this tile */}
        <AnimatePresence>
          {playersOnTile.length > 0 && (
            <div className="absolute bottom-1 left-1 flex flex-wrap gap-0.5 max-w-full">
              {playersOnTile.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    y: [0, -10, 0],
                  }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{
                    duration: 0.5,
                    y: {
                      repeat: Infinity,
                      duration: 2,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    },
                  }}
                  className="relative group"
                >
                  <div
                    className="w-6 h-6 border-2 border-menu-border shadow-[2px_2px_0px_rgba(0,0,0,0.2)] flex items-center justify-center text-white font-mono text-xs font-bold cursor-pointer"
                    style={{ backgroundColor: player.color }}
                    title={player.name}
                  >
                    {player.name[0].toUpperCase()}
                  </div>

                  {/* Tooltip with player info */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-menu-border text-menu-card font-mono text-xs py-1 px-2 whitespace-nowrap border-2 border-menu-border shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
                      <div className="font-bold">{player.name}</div>
                      <div>${player.money}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center w-full p-8 overflow-hidden relative"
      style={{
        backgroundColor: theme === 'dark' ? 'oklch(0.22 0.15 15)' : 'var(--menu-bg)',
      }}
    >
      {/* Decorative pixel corners */}
      <div className={`absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 ${theme === 'dark' ? 'border-[oklch(0.6_0.18_30)]' : 'border-menu-accent'}`} />
      <div className={`absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 ${theme === 'dark' ? 'border-[oklch(0.6_0.18_30)]' : 'border-menu-accent'}`} />
      <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 ${theme === 'dark' ? 'border-[oklch(0.6_0.18_30)]' : 'border-menu-accent'}`} />
      <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 ${theme === 'dark' ? 'border-[oklch(0.6_0.18_30)]' : 'border-menu-accent'}`} />

      <div className="relative z-10">
        {/* Main board */}
        <div 
          className="grid grid-cols-11 gap-0 border-4 p-0 shadow-[8px_8px_0px_rgba(0,0,0,0.3)]"
          style={{
            backgroundColor: theme === 'dark' ? 'oklch(0.28 0.12 10)' : 'var(--menu-card)',
            borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
          }}
        >
          {/* Top row */}
          <div className="col-span-11 grid grid-cols-11 gap-0">
            {sections.top.map(tile => renderTile(tile, false))}
          </div>

          {/* Middle rows (left + center + right) */}
          <div className="col-span-11 grid grid-cols-11 gap-0">
            {/* Left column */}
            <div className="flex flex-col gap-0">
              {sections.left.map(tile => renderTile(tile, true))}
            </div>

            {/* Board center */}
            <div 
              className="col-span-9 flex items-center justify-center relative p-4"
              style={{
                backgroundColor: theme === 'dark' ? 'oklch(0.28 0.12 10)' : 'var(--menu-card)',
              }}
            >
              <div className="text-center">
                <h1 
                  className="font-mono text-5xl font-bold mb-4 tracking-wider drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
                  style={{ color: theme === 'dark' ? 'oklch(0.6 0.18 30)' : 'var(--menu-accent)' }}
                >
                  {t('board.title')}
                </h1>

                {/* Players info */}
                <div className="mt-6 space-y-2 max-h-64">
                  <h2 
                    className="font-mono text-lg font-bold mb-3"
                    style={{ color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)' }}
                  >{t('board.players')}</h2>
                  {players.map(player => (
                    <motion.div
                      key={player.id}
                      className={`
                        flex items-center justify-between p-3 border-4
                      `}
                      style={{
                        borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
                        backgroundColor: player.id === currentPlayerId 
                          ? (theme === 'dark' ? 'oklch(0.6 0.18 30)' : 'var(--menu-accent)')
                          : (theme === 'dark' ? 'oklch(0.35 0.1 15)' : 'var(--menu-button)'),
                        boxShadow: player.id === currentPlayerId 
                          ? '4px 4px 0px rgba(0,0,0,0.3)' 
                          : '2px 2px 0px rgba(0,0,0,0.2)',
                      }}
                      animate={player.id === currentPlayerId ? {
                        scale: [1, 1.02, 1],
                      } : {}}
                      transition={player.id === currentPlayerId ? { repeat: Infinity, duration: 1.5 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        
                        <div className="w-8 h-8 border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] flex items-center justify-center text-white font-mono font-bold"
                          style={{
                            borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
                            backgroundColor: player.color
                          }}
                        >
                          {player.name[0].toUpperCase()}
                        </div>
                        <span 
                          className="font-mono font-semibold text-sm"
                          style={{ color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)' }}
                        >{player.name}</span>
                      </div>
                      <span 
                        className="font-mono font-bold"
                        style={{ color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-border)' }}
                      >${player.money}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Card decks */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div 
                    className="border-4 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
                    style={{
                      backgroundColor: theme === 'dark' ? 'oklch(0.6 0.18 30)' : 'var(--menu-accent)',
                      borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
                    }}
                  >
                    <div 
                      className="font-mono text-sm font-bold"
                      style={{ color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)' }}
                    >{t('board.chance')}</div>
                    <div 
                      className="font-mono text-xs"
                      style={{ color: theme === 'dark' ? 'oklch(0.7 0.02 90)' : 'var(--menu-button-text)' }}
                    >{t('board.chanceLabel')}</div>
                  </div>
                  <div 
                    className="border-4 p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
                    style={{
                      backgroundColor: theme === 'dark' ? 'oklch(0.35 0.1 15)' : 'var(--menu-button)',
                      borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
                    }}
                  >
                    <div 
                      className="font-mono text-sm font-bold"
                      style={{ color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)' }}
                    >{t('board.community')}</div>
                    <div 
                      className="font-mono text-xs"
                      style={{ color: theme === 'dark' ? 'oklch(0.7 0.02 90)' : 'var(--menu-button-text)' }}
                    >{t('board.communityLabel')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-0">
              {sections.right.map(tile => renderTile(tile, true))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="col-span-11 grid grid-cols-11 gap-0">
            {sections.bottom.map(tile => renderTile(tile, false))}
          </div>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 20px,
              currentColor 20px,
              currentColor 21px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 20px,
              currentColor 20px,
              currentColor 21px
            )`,
          }}
        />
      </div>
    </div>
  );
};

export default MonopolyBoard;
