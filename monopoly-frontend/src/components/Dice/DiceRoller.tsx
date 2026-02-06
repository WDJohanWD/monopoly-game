import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';

interface DiceProps {
  value: number;
  isRolling: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, isRolling }) => {
  const { theme } = useSettings();

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
      className="relative w-16 h-16 border-4 shadow-[3px_3px_0px_rgba(0,0,0,0.3)]"
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
        backgroundColor: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-card)',
        borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
      }}
    >
      {getDots(value).map((position, index) => (
        <motion.div
          key={`${position}-${index}`}
          className={`absolute w-3 h-3 rounded-full ${dotPositionClasses[position]}`}
          style={{
            backgroundColor: theme === 'dark' ? 'oklch(0.25 0.08 145)' : 'var(--menu-border)',
          }}
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
  const { t } = useTranslation();
  const { theme } = useSettings();
  const total = dice1 + dice2;
  const isDoubles = dice1 === dice2;

  return (
    <div
      className="flex flex-col items-center gap-4 p-6 border-4 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
      style={{
        backgroundColor: theme === 'dark' ? 'oklch(0.28 0.12 10)' : 'var(--menu-card)',
        borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
      }}
    >
      <h3
        className="text-lg font-mono font-bold"
        style={{ color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)' }}
      >
        {t('game.dice', 'Dados')}
      </h3>

      <div className="flex gap-4">
        <Dice value={dice1} isRolling={isRolling} />
        <Dice value={dice2} isRolling={isRolling} />
      </div>

      <div className="text-center">
        <div
          className="text-3xl font-mono font-bold"
          style={{ color: theme === 'dark' ? 'oklch(0.92 0.02 90)' : 'var(--menu-button-text)' }}
        >
          {total}
        </div>
        {isDoubles && !isRolling && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-sm font-mono font-bold mt-1"
            style={{ color: theme === 'dark' ? 'oklch(0.6 0.18 30)' : 'var(--menu-accent)' }}
          >
            {t('game.doubles', '¡Dobles!')}
          </motion.div>
        )}
      </div>

      <motion.button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="px-6 py-3 font-mono font-bold border-4 transition-all duration-200"
        style={{
          backgroundColor: disabled || isRolling
            ? (theme === 'dark' ? 'oklch(0.4 0.05 30)' : 'oklch(0.7 0.02 90)')
            : (theme === 'dark' ? 'oklch(0.6 0.18 30)' : 'var(--menu-accent)'),
          borderColor: theme === 'dark' ? 'oklch(0.45 0.16 20)' : 'var(--menu-border)',
          color: disabled || isRolling
            ? (theme === 'dark' ? 'oklch(0.6 0.02 90)' : 'oklch(0.5 0.02 90)')
            : (theme === 'dark' ? 'oklch(0.95 0.02 90)' : 'var(--menu-button-text)'),
          cursor: disabled || isRolling ? 'not-allowed' : 'pointer',
          boxShadow: disabled || isRolling ? 'none' : '3px 3px 0px rgba(0,0,0,0.3)',
        }}
        whileHover={!disabled && !isRolling ? { scale: 1.05, y: -2 } : {}}
        whileTap={!disabled && !isRolling ? { scale: 0.95, y: 0 } : {}}
      >
        {isRolling ? t('game.rolling', 'Lanzando...') : t('game.rollDice', 'Lanzar Dados')}
      </motion.button>
    </div>
  );
};

export default DiceRoller;
