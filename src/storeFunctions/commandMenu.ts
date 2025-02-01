import { socket } from "@/socket";
import { store } from "@/store";

export function give15seconds() {
  socket.emit("give 15 seconds")
}

export function resign() {
  socket.emit("resign")
  store.modals.commandMenu = false;
  store.selectedSquare = undefined;
}


