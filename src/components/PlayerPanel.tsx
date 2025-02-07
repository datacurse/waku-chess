"use client"

import { store } from "@/store";
import { useSnapshot } from "valtio";
import { PlayerSnapshot } from "server/Game";
import { Timer } from "./Timer";
import { TurnIndicator } from "./TurnIndicator";
import { OnlineIndicator } from "./OnlineIndicator";

export function PlayerPanel({ player }: { player: PlayerSnapshot | undefined }) {
  const { userId, history, gameSnapshot } = useSnapshot(store);

  if (!player) return null;

  const isMe = player.id === userId
  const playerName = (player.name ?? player.id.toString())
  const isMoving = player.color === (history.length % 2 === 0 ? 'w' : 'b');
  const historyLength = gameSnapshot?.moves.length || 0;
  const isGameOver = gameSnapshot?.isGameOver || false;
  console.log()

  return (
    <div className="flex flex-row justify-between w-full">
      <div className="flex flex-col ml-2">
        <div className="flex flex-row space-x-1 items-center">
          <OnlineIndicator isOnline={player.online} />
          <div>{player ? playerName : "Waiting for opponent"}</div>
        </div>
      </div>

      {gameSnapshot?.isTimed ? (
        <Timer
          isMoving={isMoving}
          timeLeft={player.timeLeft}
          historyLength={historyLength}
          isGameOver={isGameOver}
        />
      ) : (
        <TurnIndicator isMoving={isMoving} isMe={isMe} isGameOver={isGameOver} />
      )}
    </div>
  );
}
