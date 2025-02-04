// PlayerPanel.tsx
"use client"

import { store } from "@/store";
import { useSnapshot } from "valtio";
import { Player } from "server/Game";
import { Timer } from "./Timer";
import { TurnIndicator } from "./TurnIndicator";

export function PlayerPanel({ player }: { player: Player | undefined }) {
  const { userId, chess, gameSnapshot } = useSnapshot(store);

  if (!player) return null;

  const isMoving = player.color === chess.turn();
  const isGameOver = gameSnapshot?.isGameOver || false;
  const historyLength = gameSnapshot?.moves.length || 0;
  const isMe = player.id === userId

  return (
    <div className="flex flex-row justify-between w-full">
      <div className="flex flex-col ml-2">
        <div className="flex flex-row space-x-1 items-center">
          <svg className="w-3 h-3" viewBox="0 0 12 12">
            {player.online ? (
              <circle cx="6" cy="6" r="5" fill="#629924" />
            ) : (
              <circle cx="6" cy="6" r="4" fill="none" stroke="#bababa" strokeWidth="2" />
            )}
          </svg>
          <div>
            {player.id ? (player.name ?? player.id.toString()) : "Waiting for opponent..."}
          </div>
        </div>
      </div>

      {gameSnapshot?.isTimed ? (
        <Timer
          isMoving={isMoving}
          timeLeft={player.timeLeft}
          historyLength={historyLength}
          isGameOver={isGameOver}
        />
      ) : !isGameOver && (
        <TurnIndicator isMoving={isMoving} isMe={isMe} />
      )}
    </div>
  );
}
