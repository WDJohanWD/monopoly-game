import React from 'react';
import { motion } from 'framer-motion';

interface DiceProps {
  value: number;
  isRolling: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, isRolling }) => {
  const getDots = (value: number) => {
    const dotPositions: Record<number, string[]> = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };
    return dotPositions[value] || [];
  };

  const dotPositionClasses: Record<string, string> = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'middle-left': 'top-1/2 left-2 -translate-y-1/2',
    'middle-right': 'top-1/2 right-2 -translate-y-1/2',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  return (
    <motion.div
      className="relative w-16 h-16 bg-white rounded-lg shadow-lg border-2 border-gray-300"
      animate={
        isRolling
          ? {
              rotateX: [0, 360, 720, 1080],
              rotateY: [0, 360, 720, 1080],
              rotateZ: [0, 180, 360, 540],
            }
          : {
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
            }
      }
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {getDots(value).map((position, index) => (
        <motion.div
          key={`${position}-${index}`}
          className={`absolute w-3 h-3 bg-black rounded-full ${dotPositionClasses[position]}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 }}
        />
      ))}
    </motion.div>
  );
};

interface DiceRollerProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
}

const DiceRoller: React.FC<DiceRollerProps> = ({
  dice1,
  dice2,
  isRolling,
  onRoll,
  disabled = false,
}) => {
  const total = dice1 + dice2;
  const isDoubles = dice1 === dice2;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-xl">
      <h3 className="text-lg font-bold text-gray-800">Dados</h3>

      <div className="flex gap-4">
        <Dice value={dice1} isRolling={isRolling} />
        <Dice value={dice2} isRolling={isRolling} />
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-gray-800">
          {total}
        </div>
        {isDoubles && !isRolling && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold text-yellow-600 mt-1"
          >
            ¡Dobles! 🎲🎲
          </motion.div>
        )}
      </div>

      <motion.button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={`
          px-6 py-3 rounded-lg font-bold text-white transition-all duration-200
          ${disabled || isRolling
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
        `}
        whileHover={!disabled && !isRolling ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isRolling ? { scale: 0.95 } : {}}
      >
        {isRolling ? 'Lanzando...' : 'Lanzar Dados'}
      </motion.button>
    </div>
  );
};

export default DiceRoller;
