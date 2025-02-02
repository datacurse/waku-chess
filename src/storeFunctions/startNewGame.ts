import { store } from "@/store";
import { Color } from "chess.js";
import { socket } from "@/socket"

export const startNewGame = (time: number | undefined, side: Color | "random") => {
  socket.emit("start new game", time, side);
  store.modals.startNewGame = false;
};



