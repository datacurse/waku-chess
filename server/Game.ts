import { Chess, Color, Move } from "chess.js";

export type ChatType = "sender" | "private" | "channel" | "group" | "supergroup";

interface PlayerSnapshot {
  readonly id: bigint | null;
  readonly name: string | null;
  readonly color: Color;
  readonly timeLeft: number;
  readonly online: boolean;
  readonly offers: Readonly<{
    draw: boolean;
    takeback: boolean;
  }>;
}

export interface GameSnapshot {
  readonly roomId: string;
  readonly chatId: bigint;
  readonly chatType: ChatType;
  readonly spectators: readonly bigint[];
  readonly players: {
    readonly w: Readonly<PlayerSnapshot> | null;
    readonly b: Readonly<PlayerSnapshot> | null;
  };
  readonly fen: string;
  readonly isTimed: boolean;
  readonly gameStartTime: number;
  readonly lastTurnStartTime: number;
  readonly isGameOver: boolean;
  readonly winner: Color | null;
  readonly moves: readonly Move[];
}

export class Player {
  id: bigint | null;
  name: string | null;
  color: Color;
  timeLeft: number;
  online: boolean;
  offers: {
    draw: boolean;
    takeback: boolean;
  };

  constructor(color: Color, initialTime: number) {
    this.id = null;
    this.name = null;
    this.color = color;
    this.timeLeft = initialTime;
    this.online = false;
    this.offers = {
      draw: false,
      takeback: false,
    };
  }
}

export class Game {
  roomId: string;
  chatId: bigint;
  chatType: ChatType;
  spectators: bigint[];
  players: {
    w: Player;
    b: Player;
  };
  chess: Chess;
  isTimed: boolean;
  gameStartTime: number;
  lastTurnStartTime: number;
  isGameOver: boolean;
  winner: Color | null;

  constructor(roomId: string, chatId: bigint, chatType: ChatType) {
    this.roomId = roomId;
    this.chatId = chatId;
    this.chatType = chatType;
    this.spectators = [];
    const initialTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.players = {
      w: new Player("w", initialTime),
      b: new Player("b", initialTime),
    };
    this.chess = new Chess();
    this.isTimed = false;
    this.gameStartTime = 0;
    this.lastTurnStartTime = 0;
    this.isGameOver = false;
    this.winner = null;
  }

  private getPlayerByUserId(userId: bigint): Player | null {
    if (this.players.w.id === userId) return this.players.w;
    if (this.players.b.id === userId) return this.players.b;
    return null;
  }

  private getPlayerColor(userId: bigint): Color | null {
    if (this.players.w.id === userId) return "w";
    if (this.players.b.id === userId) return "b";
    return null;
  }

  joinUser(userId: bigint): boolean {
    const player = this.getPlayerByUserId(userId);

    if (player) {
      player.online = true;
      return true;
    }

    if (this.spectators.includes(userId)) return false;

    if (this.players.w.id === null) {
      this.players.w.id = userId;
      this.players.w.online = true;
      return true;
    } else if (this.players.b.id === null) {
      this.players.b.id = userId;
      this.players.b.online = true;
      return true;
    } else {
      this.spectators.push(userId);
      return true;
    }
  }

  disconnectUser(userId: bigint) {
    const player = this.getPlayerByUserId(userId);
    if (player) {
      player.online = false;
    } else {
      this.spectators = this.spectators.filter(id => id !== userId);
    }
  }

  move(userId: bigint, move: Move): boolean {
    const color = this.getPlayerColor(userId);
    if (!color) return false;

    const validTurn = this.validateTurn(color);
    const validPromotion = this.validatePromotion(move);
    const validTime = this.validateTimeControl();

    if (!validTurn || !validPromotion || !validTime) return false;

    try {
      this.chess.move(move);
    } catch (e) {
      return false;
    }

    this.checkGameOver();
    this.updateTime(color);
    return true;
  }

  give15seconds(userId: bigint): boolean {
    const color = this.getPlayerColor(userId);
    if (!color || !this.isTimed) return false;

    const enemy = this.getEnemy(color);
    enemy.timeLeft += 15 * 1000;
    return true;
  }

  resign(userId: bigint) {
    const color = this.getPlayerColor(userId);
    if (!color) return;

    this.isGameOver = true;
    this.winner = color === "w" ? "b" : "w";
  }

  offerDraw(userId: bigint) {
    const player = this.getPlayerByUserId(userId);
    if (!player) return;
    player.offers.draw = true;
  }

  acceptDraw() {
    this.clearOffers();
    this.isGameOver = true;
  }

  declineDraw(userId: bigint) {
    const color = this.getPlayerColor(userId);
    if (!color) return;
    this.getEnemy(color).offers.draw = false;
  }

  offerTakeback(userId: bigint) {
    const player = this.getPlayerByUserId(userId);
    if (!player) return;
    player.offers.takeback = true;
  }

  declineTakeback(userId: bigint) {
    const color = this.getPlayerColor(userId);
    if (!color) return;
    this.getEnemy(color).offers.takeback = false;
  }

  // Helper methods remain mostly unchanged
  private validateTurn(color: Color): boolean {
    return color === this.chess.turn();
  }

  private validatePromotion(move: Move): boolean {
    return !move.promotion || ["q", "r", "b", "n"].includes(move.promotion);
  }

  private validateTimeControl(): boolean {
    if (!this.isTimed) return true;

    let gameOver = false;
    Object.values(this.players).forEach((player) => {
      if (player.timeLeft <= 0) {
        this.isGameOver = true;
        this.winner = player.color === "w" ? "b" : "w";
        gameOver = true;
      }
    });

    return !gameOver;
  }

  private getPlayer(color: Color): Player {
    return this.players[color];
  }

  private getEnemy(color: Color): Player {
    return this.players[color === "w" ? "b" : "w"];
  }

  private checkGameOver() {
    if (this.chess.isGameOver()) {
      this.isGameOver = true;
      if (this.chess.isCheckmate()) {
        this.winner = this.chess.turn() === "w" ? "b" : "w";
      }
    }
  }

  private updateTime(color: Color) {
    const player = this.getPlayer(color);
    const currentTime = Date.now();

    if (this.chess.history().length === 0) {
      this.gameStartTime = currentTime;
    } else {
      const elapsed = currentTime - this.lastTurnStartTime;
      player.timeLeft = Math.max(0, player.timeLeft - elapsed);
    }

    this.lastTurnStartTime = currentTime;
  }

  clearOffers() {
    Object.values(this.players).forEach((player) => {
      player.offers.draw = false;
      player.offers.takeback = false;
    });
  }

  getSnapshot(): Readonly<GameSnapshot> {
    const snapshot: GameSnapshot = {
      roomId: this.roomId,
      chatId: this.chatId,
      chatType: this.chatType,
      spectators: [...this.spectators] as readonly bigint[],
      players: {
        w: this.players.w.id !== null ? this.getPlayerSnapshot("w") : null,
        b: this.players.b.id !== null ? this.getPlayerSnapshot("b") : null,
      },
      fen: this.chess.fen(),
      isTimed: this.isTimed,
      gameStartTime: this.gameStartTime,
      lastTurnStartTime: this.lastTurnStartTime,
      isGameOver: this.isGameOver,
      winner: this.winner,
      moves: this.chess.history({ verbose: true }),
    };

    return Object.freeze(snapshot);
  }

  private getPlayerSnapshot(color: Color): Readonly<PlayerSnapshot> {
    const player = this.players[color];
    return Object.freeze({
      id: player.id,
      name: player.name,
      color: player.color,
      timeLeft: player.timeLeft,
      online: player.online,
      offers: Object.freeze({ ...player.offers }),
    });
  }
}
