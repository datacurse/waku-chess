// Timer.tsx
import { cn } from '@udecode/cn';
import { useState, useEffect } from 'react';
import { clearInterval, setInterval } from 'worker-timers';
import { handleTimeOut } from '@/storeFunctions/timer';

const formatTimeComponents = (ms: number) => {
  const safeMs = Number.isFinite(ms) ? ms : 0;
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    left: minutes.toString().padStart(2, '0'),
    right: seconds.toString().padStart(2, '0'),
  };
};

export function Timer({ isMoving, timeLeft, historyLength, isGameOver }: {
  isMoving: boolean;
  timeLeft: number;
  historyLength: number;
  isGameOver: boolean;
}) {
  const [displayTime, setDisplayTime] = useState(timeLeft);

  useEffect(() => {
    setDisplayTime(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    let intervalId: number | undefined;
    const shouldRun = historyLength >= 2 && isMoving && !isGameOver;

    if (shouldRun) {
      intervalId = setInterval(() => {
        setDisplayTime(prev => {
          const newTime = Math.max(0, prev - 100);
          if (newTime === 0 && prev > 0) {
            handleTimeOut();
          }
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [historyLength, isMoving, isGameOver]);

  const { left, right } = formatTimeComponents(displayTime);
  const shouldGlow = historyLength >= 2 && isMoving && !isGameOver;

  return (
    <div className={cn(
      "px-2 text-text bg-timer text-2xl flex items-center justify-center leading-none w-24 py-2",
      shouldGlow && 'bg-timer-green text-text-active'
    )}>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-0.5 items-center tracking-wider">
        <div className="text-right tabular-nums">{left}</div>
        <div className="flex justify-center -mt-1">:</div>
        <div className="text-left tabular-nums">{right}</div>
      </div>
    </div>
  );
}
