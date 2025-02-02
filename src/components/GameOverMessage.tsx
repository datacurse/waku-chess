import React from 'react';
import { Chess, Color } from 'chess.js';
import { useSnapshot } from 'valtio';
import { store } from '@/store';

interface GameOverMessageProps {
  lastMoveColor?: Color;
  isTimeout?: boolean;
  timeoutColor?: Color;
}

const GameOverMessage: React.FC<GameOverMessageProps> = ({
  lastMoveColor,
  isTimeout
}) => {
  const { me, enemy, chess, gameSnapshot } = useSnapshot(store);
  const getGameOverMessage = () => {
    if (chess.isCheckmate()) {
      const winner = lastMoveColor === 'w' ? 'White' : 'Black';
      return `Checkmate. ${winner} is victorious.`;
    }

    if (chess.isStalemate()) {
      return 'Game drawn by stalemate.';
    }

    if (chess.isInsufficientMaterial()) {
      return 'Game drawn due to insufficient material.';
    }

    if (chess.isThreefoldRepetition()) {
      return 'Game drawn by threefold repetition.';
    }

    if (chess.isDraw()) {
      return 'Game drawn.';
    }

    return '';
  };

  const getTimeoutMessage = (color: Color) => {
    const winner = color === 'w' ? 'Black' : 'White';
    return `Time out. ${winner} is victorious.`;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xl font-bold">
        {me?.wins ?? 0}-{enemy?.wins ?? 0}
      </div>
      <div className=" font-medium">
        {gameSnapshot.isGameOver ? getGameOverMessage() : null}
      </div>
    </div>
  );
};

export default GameOverMessage;

