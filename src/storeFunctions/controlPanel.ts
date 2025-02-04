import { store } from "@/store";
import { loadSelectedPosition } from "./game";

export function rotateBoard() {
  store.isBoardRotated = !store.isBoardRotated;
  console.log(store.isBoardRotated)
}

export function openCommandMenuModal() {
  store.modals.commandMenu = true;
}

export function openStartNewGameModal() {
  store.modals.startNewGame = true;
}

export function nextHistoryMove() {
  !store.isAtStart && loadSelectedPosition(store.inspectedMoveIndex - 1)
}

export function prevHistoryMove() {
  !store.isAtEnd && loadSelectedPosition(store.inspectedMoveIndex + 1)
}

export function isAtStart() {
  return store.inspectedMoveIndex === -1;
}

export function isAtEnd() {
  return store.inspectedMoveIndex === store.history.length - 1;
}
