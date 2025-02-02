import { socket } from "@/socket"

export function handleTimeOut() {
  socket.emit("time is out");
};



