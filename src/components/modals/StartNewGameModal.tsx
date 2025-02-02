"use client"
import React, { useState } from 'react';
import { store } from '@/store';
import { Modal } from './Modal';
import { GoInfinity } from "react-icons/go";
import { cn } from '@udecode/cn';
import GameOverMessage from '../GameOverMessage';
import { startNewGame } from '@/storeFunctions/startNewGame';

export default function StartNewGameModal() {
  const [gameSettings, setGameSettings] = useState<{
    variant: string,
    timeControl: string,
    minutes: number | undefined,
    color: 'w' | 'b' | 'random'
  }>({
    variant: 'standard',
    timeControl: 'time',
    minutes: 10,
    color: 'random'
  });

  const timeControls = [
    { time: '30 sec', minutes: 5 / 60 },
    { time: '1 min', minutes: 1 },
    { time: '3 min', minutes: 3 },
    { time: '5 min', minutes: 5 },
    { time: '10 min', minutes: 10 },
    { time: '15 min', minutes: 15 },
    { time: '30 min', minutes: 30 },
    { time: '1 hour', minutes: 60 },
    { time: 'Unlimited', minutes: undefined }
  ];

  const handleStartGame = () => {
    startNewGame(gameSettings.minutes, gameSettings.color as "w" | "b" | "random");
    store.modals.startNewGame = false;
  };

  const colorOptions: ('w' | 'b' | 'random')[] = ['w', 'random', 'b'];

  return (
    <Modal
      isOpen={store.modals.startNewGame}
      onClose={() => store.modals.startNewGame = false}
    >
      <div className='mb-6'>

      </div>
      {/* Time Control */}
      <div className="mb-6">
        <label className="block text-text mb-2">Time Control</label>
        <div className="grid grid-cols-3 gap-2">
          {timeControls.map(control => (
            <button
              key={control.time}
              onClick={() => setGameSettings({
                ...gameSettings,
                timeControl: control.time === 'Unlimited' ? 'unlimited' : 'time',
                minutes: control.minutes
              })}
              className={cn(
                "p-2 rounded text-center transition-colors",
                gameSettings.minutes === control.minutes
                  ? "bg-text-dark text-white"
                  : "bg-timer text-text"
              )}
            >
              {control.time === 'Unlimited' ? (
                <GoInfinity className="w-5 h-5 mx-auto" />
              ) : control.time}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="mb-6">
        <label className="block text-text mb-2">Play as</label>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((color) => (
            <ColorSelectionButton
              key={color}
              color={color}
              selectedColor={gameSettings.color}
              onClick={(newColor) => setGameSettings({ ...gameSettings, color: newColor })}
            />
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartGame}
        className="w-full bg-online text-white py-3 rounded-lg font-semibold"
      >
        Start Game
      </button>
    </Modal>
  );
}

// ColorSelectionButton.tsx
type ColorOption = 'w' | 'b' | 'random';

interface ColorSelectionButtonProps {
  color: ColorOption;
  selectedColor: ColorOption;
  onClick: (color: ColorOption) => void;
}

export function ColorSelectionButton({ color, selectedColor, onClick }: ColorSelectionButtonProps) {
  const getBackgroundStyles = () => {
    switch (color) {
      case 'w':
        return 'bg-white';
      case 'b':
        return 'bg-black';
      case 'random':
        return 'bg-gradient-to-r from-white to-black';
    }
  };

  return (
    <button
      onClick={() => onClick(color)}
      className={cn(
        "w-full p-3 rounded-lg transition-colors",
        selectedColor === color
          ? "bg-text-dark"
          : "bg-timer hover:opacity-90"
      )}
    >
      <div className={cn("w-8 h-8 rounded-full mx-auto", getBackgroundStyles())} />
    </button>
  );
}

