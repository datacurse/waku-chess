"use client"

import { socket } from "../socket";
import { lazy, Suspense, useEffect } from 'react';

// Directly lazy-load P5Board component
const P5Board = lazy(() => import('./P5Board'));

export function Screen() {
  const roomId = "1";
  const userId = BigInt(1);

  useEffect(() => {
    if (!roomId || !userId) return;

    socket.emit("join game", roomId, userId);
    const snapshotHandler = (gameSnapshot: any) => {
      console.log(gameSnapshot.roomId, gameSnapshot.chatId);
    };

    socket.on("gameSnapshot", snapshotHandler);
    return () => {
      socket.off("gameSnapshot", snapshotHandler);
    };
  }, [roomId, userId]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 bg-[#161511]" />
      <div className="h-screen flex text-white bg-[#161511]">
        <div className="w-full flex flex-col">
          <div className="flex-1 flex items-end" />
          <div className="flex justify-center">
            <Suspense fallback={<div>Loading board...</div>}>
              <P5Board />
            </Suspense>
          </div>
          <div className="flex-1 flex flex-col items-start" />
        </div>
      </div>
    </>
  );
}
