// PlayerPanel.tsx
"use client"

import { store } from "@/store";
import { useSnapshot } from "valtio";
import { Player } from "server/Game";
import { Timer } from "./Timer";

export function PlayerPanel({ player }: { player: Player | undefined }) {
  const { userId, chess, gameSnapshot } = useSnapshot(store);

  if (!player) return null;

  const isCurrentTurn = player.color === chess.turn();
  const isGameOver = gameSnapshot?.isGameOver || false;
  const historyLength = gameSnapshot?.moves.length || 0;

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
          isPlayerTurn={isCurrentTurn}
          timeLeft={player.timeLeft}
          historyLength={historyLength}
          isGameOver={isGameOver}
        />
      ) : !isGameOver && (
        <div className={`py-4 ${isCurrentTurn ? 'px-2 bg-timer' : ''} text-text font-semibold text-sm`}>
          <div className="h-5">
            {isCurrentTurn && (player.id === userId ? "Your turn" : "Waiting for opponent")}
          </div>
        </div>
      )}
    </div>
  );
}
