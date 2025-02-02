"use client"

import { store } from "@/store";
import { useSnapshot } from "valtio";
import { Player } from "server/Game";
import { Timer } from "./Timer";

export function PlayerPanel({ player }: { player: Player | undefined }) {
  const { userId, history, gameSnapshot } = useSnapshot(store);
  const id = player?.id
  const name = player?.name
  const isOnline = player?.online
  const turn = player?.color === (history.length % 2 === 0 ? 'w' : 'b');
  const myTurn = id === userId
  return (
    <div className="flex flex-row justify-between w-full">
      <div className="flex flex-col ml-2">
        <div className="flex flex-row space-x-1 items-center">
          <svg
            className="w-3 h-3"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOnline ? (
              <circle cx="6" cy="6" r="5"
                fill="#629924" />
            ) : (
              <circle cx="6" cy="6" r="4"
                fill="none" stroke="#bababa" strokeWidth="2"
              />
            )}
          </svg>
          <div>
            {id ? (name ?? id.toString()) : "Waiting for opponent..."}
          </div>
        </div>
        <div className="mt-0.5">
        </div>
      </div>
      {gameSnapshot?.isTimed ? (
        <Timer
          isPlayerTurn={turn}
          timeLeftMs={player.timeLeft}
        />
      ) : !gameSnapshot?.isGameOver && (
        <div className={`py-4 ${turn ? 'px-2 bg-timer' : ''} text-text font-semibold text-sm`}>
          <div className="h-5">
            {turn && (myTurn ? "Your turn" : "Waiting for opponent")}
          </div>
        </div>
      )}

    </div>
  );
}

