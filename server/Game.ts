import { Chess, Color, Move } from "chess.js";

export type ChatType = "sender" | "private" | "channel" | "group" | "supergroup";

interface PlayerSnapshot {
  id: bigint | null;
  name: string | null;
  color: Color;
  timeLeft: number;
  online: boolean;
  offers: {
    draw: boolean;
    takeback: boolean;
  };
  wins: number;
}

export interface GameSnapshot {
  roomId: string;
  chatId: bigint;
  chatType: ChatType;
  spectators: bigint[];
  players: PlayerSnapshot[];
  fen: string;
  isTimed: boolean;
  gameStartTime: number;
  lastTurnStartTime: number;
  isGameOver: boolean;
  winner: Color | null;
  moves: Move[];
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
  wins: number;

  constructor(id: bigint | null, color: Color, initialTime: number) {
    this.id = id;
    this.name = null;
    this.color = color;
    this.timeLeft = initialTime;
    this.online = false;
    this.offers = {
      draw: false,
      takeback: false,
    };
    this.wins = 0;
  }
}

export class Game {
  roomId: string;
  chatId: bigint;
  chatType: ChatType;
  spectators: bigint[];
  players: Player[];
  chess: Chess;
  isTimed: boolean;
  gameStartTime: number;
  lastTurnStartTime: number;
  isGameOver: boolean;
  winner: Color | null;
  private winsUpdated: boolean;

  constructor(roomId: string, chatId: bigint, chatType: ChatType) {
    this.roomId = roomId;
    this.chatId = chatId;
    this.chatType = chatType;
    this.spectators = [];
    this.players = [];
    this.chess = new Chess();
    this.isTimed = false;
    this.gameStartTime = 0;
    this.lastTurnStartTime = 0;
    this.isGameOver = false;
    this.winner = null;
    this.winsUpdated = false;
  }

  private getPlayer(userId: bigint): Player | null {
    return this.players.find(player => player.id === userId) || null;
  }

  joinUser(userId: bigint): boolean {
    const existingPlayer = this.getPlayer(userId);

    if (existingPlayer) {
      existingPlayer.online = true;
      return true;
    }

    if (this.spectators.includes(userId)) return false;

    const color = this.players.length === 0 ? "w" : this.players.length === 1 ? "b" : null;

    if (color) {
      const initialTime = 10 * 60 * 1000; // 10 minutes in milliseconds
      const newPlayer = new Player(userId, color, initialTime);
      newPlayer.online = true;
      this.players.push(newPlayer);
    } else {
      this.spectators.push(userId);
    }

    return true;
  }

  disconnectUser(userId: bigint) {
    const player = this.getPlayer(userId);
    if (player) {
      player.online = false;
    } else {
      this.spectators = this.spectators.filter(id => id !== userId);
    }
  }

  move(userId: bigint, move: Move): boolean {
    const player = this.getPlayer(userId);
    if (!player) return false;

    const validTurn = this.validateTurn(userId);
    const validPromotion = this.validatePromotion(move);
    const validTime = this.validateTimeControl();

    if (!validTurn || !validPromotion || !validTime) return false;

    try {
      this.chess.move(move);
    } catch (e) {
      return false;
    }

    this.checkGameOver();
    this.updateTime(userId);
    return true;
  }

  give15seconds(userId: bigint): boolean {
    const player = this.getPlayer(userId);
    if (!player || !this.isTimed) return false;

    const enemy = this.getEnemy(userId);
    if (enemy) enemy.timeLeft += 15 * 1000;
    return true;
  }

  resign(userId: bigint) {
    const player = this.getPlayer(userId);
    if (!player) return;

    this.isGameOver = true;
    this.winner = player.color === "w" ? "b" : "w";
    this.updateWinsIfNeeded();
  }

  offerDraw(userId: bigint) {
    const player = this.getPlayer(userId);
    if (!player) return;
    player.offers.draw = true;
  }

  acceptDraw() {
    this.clearOffers();
    this.isGameOver = true;
  }

  declineDraw(userId: bigint) {
    const player = this.getPlayer(userId);
    if (!player) return;
    const enemy = this.getEnemy(userId);
    if (enemy) enemy.offers.draw = false;
  }

  offerTakeback(userId: bigint) {
    const player = this.getPlayer(userId);
    if (!player) return;
    player.offers.takeback = true;
  }

  declineTakeback(userId: bigint) {
    const player = this.getPlayer(userId);
    if (!player) return;
    const enemy = this.getEnemy(userId);
    if (enemy) enemy.offers.takeback = false;
  }

  private validateTurn(userId: bigint): boolean {
    const player = this.getPlayer(userId);
    return player ? player.color === this.chess.turn() : false;
  }

  private validatePromotion(move: Move): boolean {
    return !move.promotion || ["q", "r", "b", "n"].includes(move.promotion);
  }

  private validateTimeControl(): boolean {
    if (!this.isTimed) return true;

    let gameOver = false;
    this.players.map(player => {
      if (player.timeLeft <= 0) {
        this.isGameOver = true;
        this.winner = player.color === "w" ? "b" : "w";
        gameOver = true;
      }
      return player;
    });

    return !gameOver;
  }

  private getEnemy(userId: bigint): Player | null {
    const player = this.getPlayer(userId);
    return player ? this.players.find(p => p.color !== player.color) || null : null;
  }

  private checkGameOver() {
    if (this.chess.isGameOver()) {
      this.isGameOver = true;
      if (this.chess.isCheckmate()) {
        this.winner = this.chess.turn() === "w" ? "b" : "w";
      }
      this.updateWinsIfNeeded();
    }
  }

  private updateTime(userId: bigint) {
    const player = this.getPlayer(userId);
    if (!player) return;

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
    this.players.map(player => {
      player.offers.draw = false;
      player.offers.takeback = false;
      return player;
    });
  }

  startNewGame(userId: bigint, side: 'w' | 'b' | 'random', time?: number): void {
    const requestingPlayer = this.players.find(p => p.id === userId);
    const otherPlayer = this.players.find(p => p.id !== userId);
    if (!requestingPlayer || !otherPlayer) return;

    // Reset game state
    this.chess = new Chess();
    this.isGameOver = false;
    this.winner = null;
    const currentTime = Date.now();
    this.gameStartTime = currentTime;
    this.lastTurnStartTime = currentTime;
    this.winsUpdated = false;
    this.clearOffers();

    // Assign colors
    if (side === 'random') {
      [requestingPlayer.color, otherPlayer.color] = [otherPlayer.color, requestingPlayer.color];
    } else {
      requestingPlayer.color = side;
      otherPlayer.color = side === 'w' ? 'b' : 'w';
    }

    // Set time controls
    if (time) {
      const timeInMs = time * 60 * 1000;
      requestingPlayer.timeLeft = timeInMs;
      otherPlayer.timeLeft = timeInMs;
      this.isTimed = true;
    } else {
      this.isTimed = false;
    }
  }

  timeout(userId: bigint): boolean {
    if (!this.isTimed || this.isGameOver) {
      return false;
    }

    const player = this.getPlayer(userId);
    if (!player) {
      return false;
    }

    if (player.color !== this.chess.turn()) {
      return false;
    }

    const currentTime = Date.now();
    const elapsed = currentTime - this.lastTurnStartTime;

    player.timeLeft = Math.max(0, player.timeLeft - elapsed);
    this.lastTurnStartTime = currentTime;

    if (player.timeLeft <= 0) {
      this.isGameOver = true;
      this.winner = player.color === 'w' ? 'b' : 'w';
      this.updateWinsIfNeeded();
      return true;
    }

    return false;
  }

  getSnapshot(): GameSnapshot {
    const snapshot: GameSnapshot = {
      roomId: this.roomId,
      chatId: this.chatId,
      chatType: this.chatType,
      spectators: [...this.spectators],
      players: this.players.map(player => this.getPlayerSnapshot(player)),
      fen: this.chess.fen(),
      isTimed: this.isTimed,
      gameStartTime: this.gameStartTime,
      lastTurnStartTime: this.lastTurnStartTime,
      isGameOver: this.isGameOver,
      winner: this.winner,
      moves: this.chess.history({ verbose: true }),
    };

    return snapshot;
  }

  private getPlayerSnapshot(player: Player): PlayerSnapshot {
    return {
      id: player.id,
      name: player.name,
      color: player.color,
      timeLeft: player.timeLeft,
      online: player.online,
      offers: { ...player.offers },
      wins: player.wins
    };
  }

  private updateWinsIfNeeded() {
    if (!this.winsUpdated && this.winner) {
      const winningPlayer = this.players.find(player => player.color === this.winner);
      if (winningPlayer) {
        winningPlayer.wins += 1;
      }
      this.winsUpdated = true;
    }
  }
}
