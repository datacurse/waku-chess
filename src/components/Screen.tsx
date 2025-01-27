"use client"

import { store } from "@/store";
import { socket } from "../socket";
import { lazy, Suspense, useEffect, useState } from 'react';

const P5Board = lazy(() => import('./P5Board'));

export function Screen() {
  useEffect(() => {
    // Get search parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId') || '1';
    const userIdParam = searchParams.get('userId');

    // Parse userId as BigInt or default to 1n
    const userId = userIdParam ? BigInt(userIdParam) : BigInt(1);

    store.roomId = roomId;
    store.userId = userId;

    socket.emit("join game", roomId, userId);

    const snapshotHandler = (gameSnapshot: any) => {
      console.log(gameSnapshot.roomId, gameSnapshot.chatId);
      store.gameSnapshot = gameSnapshot;
    };

    socket.on("gameSnapshot", snapshotHandler);
    return () => {
      socket.off("gameSnapshot", snapshotHandler);
    };
  }, []);

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
