import { store } from "@/store";
import { loadSelectedPosition } from "./game";

export function rotateBoard() {
  store.isBoardRotated = !store.isBoardRotated;
  console.log(store.isBoardRotated)
}

export function openCommandMenuOrNewGameModal() {
  const isGameJustStarting = store.history.length < 2;
  if (isGameJustStarting || store.chess.isGameOver()) {
    store.modals.startNewGame = true;
  } else {
    store.modals.commandMenu = true;
  }
}

export function nextHistoryMove() {
  !store.isAtStart && loadSelectedPosition(store.inspectedMoveIndex - 1)
}

export function prevHistoryMove() {
  !store.isAtEnd && loadSelectedPosition(store.inspectedMoveIndex + 1)
}

export function isAtStart() {
  console.log(store.inspectedMoveIndex)
  return store.inspectedMoveIndex === -1;
}

export function isAtEnd() {
  return store.inspectedMoveIndex === store.history.length - 1;
}
