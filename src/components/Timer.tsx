// Timer.tsx
import { cn } from '@udecode/cn';
import { useState, useEffect } from 'react';
import { clearInterval, setInterval } from 'worker-timers';
import { handleTimeOut } from '@/storeFunctions/timer';
import { useSnapshot } from 'valtio';
import { store } from '@/store';

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

const thresholds = [
  { totalTime: 30000, threshold: 10000 },   // 30s -> 10s
  { totalTime: 60000, threshold: 10000 },   // 1m  -> 10s
  { totalTime: 180000, threshold: 30000 },  // 3m  -> 30s
  { totalTime: 300000, threshold: 60000 },  // 5m  -> 1m
  { totalTime: 600000, threshold: 60000 },  // 10m -> 1m
  { totalTime: 900000, threshold: 120000 }, // 15m -> 2m
  { totalTime: 1800000, threshold: 300000 },// 30m -> 5m
  { totalTime: 3600000, threshold: 600000 } // 60m -> 10m
];

export function Timer({ isMoving, timeLeft, historyLength, isGameOver }: {
  isMoving: boolean;
  timeLeft: number;
  historyLength: number;
  isGameOver: boolean;
}) {
  const { gameSnapshot } = useSnapshot(store)
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

  // Use .map to select threshold, then filter out null and pick the first match
  const thresholdMs = thresholds
    .map(item => (item.totalTime === gameSnapshot?.totalTime ? item.threshold : null))
    .filter(val => val !== null)[0] || 0;

  return (
    <div className={cn(
      "px-2 text-text bg-timer text-2xl flex items-center justify-center leading-none w-24 py-2",
      shouldGlow && displayTime > thresholdMs && 'bg-timer-green text-text-active',
      displayTime <= thresholdMs && 'bg-timer-red text-text-active'
    )}>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-0.5 items-center tracking-wider">
        <div className="text-right tabular-nums">{left}</div>
        <div className="flex justify-center -mt-1">:</div>
        <div className="text-left tabular-nums">{right}</div>
      </div>
    </div >
  );
}
