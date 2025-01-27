import { proxy } from "valtio";
import { Chess, Color, Move, type Square } from "chess.js";
import { devtools } from 'valtio/utils'
import type { } from '@redux-devtools/extension'
import { GameSnapshot } from "server/Game";

export type PendingPromotion = {
  from: Square;
  to: Square;
} | null;

class ChessStore {
  error: string | null = null;
  roomId: string | null = null;
  userId: bigint | null = null;
  gameSnapshot: GameSnapshot | null = null;

  localChess = new Chess();
  history: Move[] = [];
  inspectedMoveIndex = -1;
  selectedSquare: Square | null = null;
  pendingPromotion: PendingPromotion = null;
  modals = {
    startNewGame: false,
    commandMenu: false,
  };
  isBoardRotated = false;

  get isAtStart() {
    return this.inspectedMoveIndex === -1;
  }

  get isAtEnd() {
    return this.inspectedMoveIndex === this.history.length - 1;
  }
}

//export const updateGameState = () => {
//  store.movingColor = store.chess.turn() as Color;
//  const isGameOver = store.chess.isGameOver() || store.isGameOver;
//  if (isGameOver) {
//    store.modals.startNewGame = true;
//  }
//};

export const store = proxy(new ChessStore());

if (process.env.NODE_ENV === 'development') {
  devtools(store, {
    name: 'Chess Store',
    serialize: {
      replacer: (_, value) => {
        if (typeof value === 'bigint') {
          return value.toString() + 'n'
        }
        return value
      }
    }
  })
}
