import { socket } from "@/socket"

export function handleTimeOut() {
  socket.emit("command", { type: "time_is_out" })
};



