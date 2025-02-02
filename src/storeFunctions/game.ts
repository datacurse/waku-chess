import { store } from "@/store";
import { Chess, Move, Square } from "chess.js";
import { socket } from "@/socket"


export function selectSquare(square: string) {
  if (store.chess.isGameOver()) { return }
  if (store.inspectedMoveIndex !== store.history.length - 1) { return }
  const userId = store.userId
  if (userId === null) { return }
  if (store.me === undefined) { return }
  if (store.pendingPromotion) { return }
  const newSquare = square as Square;
  if (store.selectedSquare === newSquare) {
    store.selectedSquare = undefined;
    return;
  }
  if (!store.selectedSquare) {
    const piece = store.chess.get(newSquare);
    if (piece && piece.color === store.me.color) {
      store.selectedSquare = newSquare;
    }
    return;
  }

  const fromSquare = store.selectedSquare;
  if (!fromSquare) return
  console.log("move")
  const toSquare = newSquare;
  try {
    const move = performMove({
      from: fromSquare,
      to: toSquare
    });
    if (!move) {
      store.selectedSquare = undefined;
      return;
    }
    store.selectedSquare = undefined;
    socket.emit("make move", userId, move);
  } catch (err) {
    store.selectedSquare = undefined;
  }
}

const performMove = (moveDetails: { from: Square, to: Square, promotion?: string }) => {
  const move = store.chess.move(moveDetails);
  if (!move) return null;
  store.history = [...store.history, move];
  store.inspectedMoveIndex = store.history.length - 1;
  //updateGameState();
  return move;
};

export const loadSelectedPosition = (index: number) => {
  if (index < -1 || index >= store.history.length) return;
  store.inspectedMoveIndex = index;
  store.chess = new Chess();
  if (index === -1) return;
  for (let i = 0; i <= index; i++) {
    const move = store.history[i];
    //console.log(store.history, move)
    if (!move) return
    store.chess.move(move);
  }
};

//export function handlePromotion(promotionPiece: string) {
//  if (!store.pendingPromotion) return;
//  const { from, to } = store.pendingPromotion;
//  try {
//    const moveResult = performMove({
//      from,
//      to,
//      promotion: promotionPiece
//    });
//    if (!moveResult) {
//      store.selectedSquare = undefined;
//      store.pendingPromotion = null;
//      return;
//    }
//    store.selectedSquare = undefined;
//    store.pendingPromotion = null;
//    socket.emit("move", { from, to, promotion: promotionPiece }, (response) => {
//      if (!response.success) {
//        setError("Failed to make promotion move");
//      }
//    });
//  } catch (err) {
//    store.selectedSquare = undefined;
//    store.pendingPromotion = null;
//    setError("Invalid promotion move");
//  }
//}
//
//
//

