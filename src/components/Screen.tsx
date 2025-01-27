"use client"

import { socket } from "../socket";
import { ChessBoard } from "./ChessBoard";

export function Screen() {
  const roomId = "1"
  const userId = BigInt(1)
  if (!roomId || !userId) { return }
  socket.emit("join game", roomId, userId)
  socket.on("gameSnapshot", gameSnapshot => {
    console.log(gameSnapshot.roomId, gameSnapshot.chatId)
  })


  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 bg-[#161511]">
      </div>
      <div className="h-screen flex text-white bg-[#161511]">
        <div className="w-full flex flex-col">
          <div className="flex-1 flex items-end">
          </div>
          <div className="flex justify-center">
            <ChessBoard />
          </div>
          <div className="flex-1 flex flex-col items-start">
          </div>
        </div>
      </div>
    </>
  )
}
