import { store } from "@/store";
import { Color } from "chess.js";
import { socket } from "@/socket"

export const startNewGame = (time: number | undefined, side: Color | "random") => {
  socket.emit("command", { type: "start_new_game", payload: { time, side } });
  store.modals.startNewGame = false;
};



