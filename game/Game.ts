import { Chess, Color, Move } from "chess.js";

export class Player {
  readonly color: Color;
  wins: number;
  timeLeft: number;
  offers: {
    draw: boolean;
    takeback: boolean;
  };

  constructor(color: Color, initialTime: number) {
    this.color = color;
    this.wins = 0;
    this.timeLeft = initialTime;
    this.offers = {
      draw: false,
      takeback: false
    };
  }
}

export class Game {
  chess: Chess;
  isTimed: boolean;
  gameStartTime: number;
  lastTurnStartTime: number;
  players: Record<Color, Player>;
  isGameOver: boolean;
  winner: null | Color;

  constructor() {
    this.chess = new Chess();
    this.isTimed = false;
    this.lastTurnStartTime = 0;
    this.isGameOver = false;
    this.winner = null;
    const initialTime = 10 * 60 * 1000
    this.gameStartTime = initialTime;
    this.players = {
      'w': new Player('w', initialTime),
      'b': new Player('b', initialTime)
    }
  }

  getPlayer(color: Color): Player {
    return this.players[color];
  }

  getEnemy(color: Color): Player {
    return this.players[color === 'w' ? 'b' : 'w'];
  }

  move(color: Color, move: Move): boolean {
    let r = this.validateTurn(color);
    r = r && this.validatePromotion(move);
    r = r && this.validateTimeControl();
    if (!r) return false
    try { this.chess.move(move) } catch (e) { return false }
    this.checkGameOver()
    this.updateTime(color)
    return true
  }

  private validateTurn(color: Color): boolean {
    return color === this.chess.turn()
  }

  private validatePromotion(move: Move): boolean {
    return !move.promotion || ["q", "r", "b", "n"].includes(move.promotion)
  }

  private validateTimeControl(): boolean {
    if (!this.isTimed) { return true }
    Object.values(this.players).forEach(player => {
      if (player.timeLeft <= 0) {
        this.isGameOver = true;
        this.winner = this.getEnemy(player.color).color;
        return false
      }
    });
    return true
  }

  private checkGameOver() {
    if (this.chess.isGameOver()) {
      this.isGameOver = true;
      if (this.chess.isCheckmate()) {
        this.winner = this.getEnemy(this.chess.turn()).color;
      }
    }
  }

  private updateTime(color: Color) {
    const player = this.getPlayer(color)
    const currentTime = Date.now();
    if (this.chess.history().length === 0) {
      this.gameStartTime = currentTime;
    } else {
      player.timeLeft = Math.max(1, player.timeLeft - (currentTime - this.lastTurnStartTime));
    }
    this.lastTurnStartTime = currentTime;
  }

  give15seconds(color: Color): boolean {
    if (!this.isTimed) { return false }
    const enemy = this.getEnemy(color)
    enemy.timeLeft += 15 * 1000
    return true
  }

  resign(color: Color) {
    this.isGameOver = true
    this.winner = this.getEnemy(color).color
  }

  timeout() {
    this.validateTimeControl()
  }

  offerDraw(color: Color) {
    this.getPlayer(color).offers.draw = true;
  }

  acceptDraw() {
    this.clearOffers()
    this.isGameOver = true
  }

  declineDraw(color: Color) {
    this.getEnemy(color).offers.draw = false
  }

  offerTakeback(color: Color) {
    this.getPlayer(color).offers.takeback = true;
  }

  acceptTakeback(): boolean {
    this.clearOffers();
    const history = this.chess.history({ verbose: true });
    const newChess = new Chess();
    if (history.length === 0) return false;
    for (let i = 0; i <= history.length - 1 - 1; i++) {
      const move = history[i];
      if (!move) return false;
      try { newChess.move(move) } catch (e) { return false }
    }
    this.chess = newChess;
    return true
  }

  declineTakeback(color: Color) {
    this.getEnemy(color).offers.takeback = false
  }

  clearOffers() {
    Object.values(this.players).forEach(player => {
      player.offers.draw = false;
      player.offers.takeback = false;
    });
  }
}

