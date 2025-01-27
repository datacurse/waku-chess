"use client"

import { socket } from "../socket";

export function Screen() {
  const roomId = "1"
  const userId = BigInt(1)
  if (!roomId || !userId) { return }
  socket.emit("join game", roomId, userId)
  socket.on("roomSnapshot", roomSnapshot => {
    //console.log("recieved roomSnapshot")
    console.log(roomSnapshot.roomId, roomSnapshot.chatId)
  })

  return (
    <div>screen</div>
  )
}
