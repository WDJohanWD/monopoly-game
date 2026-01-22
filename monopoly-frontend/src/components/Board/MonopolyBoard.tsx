import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // Obtener la posición actual de un jugador (animada o estática)
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
  const sections = useMemo(() => {
    const sortedTiles = tiles.sort((a, b) => a.position - b.position);

    return {
      bottom: sortedTiles.slice(0, 11),      // 0-10: GO a Jail (visiting)
      left: sortedTiles.slice(11, 20),       // 11-19: Left side
      top: sortedTiles.slice(20, 31).reverse(), // 20-30: Top side (reversed for display)
      right: sortedTiles.slice(31, 40).reverse(), // 31-39: Right side (reversed)
    };
  }, [tiles]);

  const getTileColor = (colorGroup?: string): string => {
    if (!colorGroup) return 'white';
    return COLOR_MAP[colorGroup] || 'white';
  };

//   const getTileTypeName = (type: number): string => {
//     const types: Record<number, string> = {
//       0: 'Go',
//       1: 'Property',
//       2: 'Community Chest',
//       3: 'Income Tax',
//       4: 'Railroad',
//       5: 'Chance',
//       6: 'Jail',
//       7: 'Free Parking',
//       8: 'Go to Jail',
//       9: 'Luxury Tax',
//       10: 'Utility',
//     };
//     return types[type] || 'Unknown';
//   };

  const renderTile = (tile: TileDto, isVertical: boolean = false) => {
    // Filtrar jugadores usando la posición animada
    const playersOnTile = players.filter(p => getPlayerPosition(p.id) === tile.position);
    const tileColor = tile.property?.colorGroup ? getTileColor(tile.property.colorGroup) : 'white';
    
    return (
      <motion.div
        key={tile.id}
        className={`
          relative border-2 border-gray-800 bg-white cursor-pointer
          ${isVertical ? 'h-24 w-16' : 'h-16 w-24'}
          ${tile.type === 0 || tile.type === 6 || tile.type === 7 || tile.type === 8 ? 'h-24 w-24' : ''}
          transition-all duration-200 hover:shadow-lg hover:z-10
          ${currentPlayerId && playersOnTile.some(p => p.id === currentPlayerId) ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
        `}
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
            text-xs font-bold text-center line-clamp-2
            ${tile.type === 0 || tile.type === 6 || tile.type === 7 || tile.type === 8 ? 'text-sm' : ''}
          `}>
            {tile.name}
          </span>
          {tile.property?.price && (
            <span className="text-[10px] text-gray-600 mt-1">
              ${tile.property.price}
            </span>
          )}
          {tile.property?.ownerId && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" />
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
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                    style={{ backgroundColor: player.color }}
                    title={player.name}
                  >
                    {player.name[0].toUpperCase()}
                  </div>

                  {/* Tooltip with player info */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
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
    <div className="flex items-center justify-center w-full bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="relative">
        {/* Main board */}
        <div className="grid grid-cols-11 gap-0 bg-green-200 p-0 shadow-2xl rounded-lg">
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
            <div className="col-span-9 bg-gradient-to-br from-green-200 via-green-100 to-green-200 flex items-center justify-center relative p-4">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-green-800 mb-4 tracking-wider" style={{ fontFamily: 'serif' }}>
                  MONOPOLY
                </h1>

                {/* Players info */}
                <div className="mt-8 space-y-2 max-h-64 overflow-y-auto">
                  <h2 className="text-xl font-bold text-gray-700 mb-4">Jugadores</h2>
                  {players.map(player => (
                    <motion.div
                      key={player.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg
                        ${player.id === currentPlayerId ? 'bg-yellow-100 ring-2 ring-yellow-400' : 'bg-white'}
                        shadow-md
                      `}
                      animate={player.id === currentPlayerId ? {
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={player.id === currentPlayerId ? { repeat: Infinity, duration: 1.5 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: player.color }}
                        >
                          {player.name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm">{player.name}</span>
                      </div>
                      <span className="font-bold text-green-600">${player.money}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Card decks */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-orange-500 p-4 rounded-lg shadow-lg text-white">
                    <div className="text-sm font-bold">SUERTE</div>
                    <div className="text-xs">Chance</div>
                  </div>
                  <div className="bg-blue-500 p-4 rounded-lg shadow-lg text-white">
                    <div className="text-sm font-bold">CAJA</div>
                    <div className="text-xs">Community</div>
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
    </div>
  );
};

export default MonopolyBoard;
