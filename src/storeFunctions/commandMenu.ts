import { socket } from "@/socket";
import { store } from "@/store";

export function give15seconds() {
  socket.emit("command", {
    type: "give_15_seconds"
  })
}

export function resign() {
  socket.emit("command", { type: "resign" })
  store.modals.commandMenu = false;
  store.selectedSquare = undefined;
}


