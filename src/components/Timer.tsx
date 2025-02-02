import { cn } from '@udecode/cn';
import { useState, useEffect } from 'react';
import { clearInterval, setInterval } from 'worker-timers';

const formatTimeComponents = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return {
      left: hours.toString(),
      right: minutes.toString().padStart(2, '0'),
    };
  }

  return {
    left: minutes.toString().padStart(2, '0'),
    right: seconds.toString().padStart(2, '0'),
  };
};

export function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Convert count (seconds) to milliseconds
  const { left, right } = formatTimeComponents(count * 1000);

  return (
    <div className={cn(
      "px-2 text-text bg-timer text-2xl flex items-center justify-center leading-none w-24 py-2",
      true && 'bg-timer-green text-text-active'
    )}>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-0.5 items-center tracking-wider">
        <div className="text-right tabular-nums">{left}</div>
        <div className="flex justify-center -mt-1">:</div>
        <div className="text-left tabular-nums">{right}</div>
      </div>
    </div>
  );
}
