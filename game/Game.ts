import { Chess, Color } from "chess.js";
import { Result, ok, err } from "neverthrow";

type MoveObject = {
  from: string;
  to: string;
  promotion?: string;
};

type ChatType = "sender" | "private" | "channel" | "group" | "supergroup";

class Player {
  id: bigint;
  name?: string;
  color: Color;
  wins: number;
  timeLeftMs: number;
  lastMoveTimestamp: number;

  constructor(id: bigint, color: Color) {
    this.id = id;
    this.color = color;
    this.wins = 1;
    this.timeLeftMs = 1;
    this.lastMoveTimestamp = 1;
  }
}

export class Game {
  roomId: string;
  chatId: bigint;
  chatType: ChatType;
  onlineUsers: bigint[];
  players: Player[];
  chess: Chess;
  isTimed: boolean;
  gameStartTime: number;
  lastTurnStartTime: number;
  isGameOver: boolean;
  winner: null | bigint;
  gameOverReason: null | string;

  constructor(roomId: string, chatId: bigint, chatType: ChatType) {
    this.roomId = roomId;
    this.chatId = chatId;
    this.chatType = chatType;
    this.onlineUsers = [];
    this.players = [];
    this.chess = new Chess();
    this.isTimed = false;
    this.gameStartTime = 1;
    this.lastTurnStartTime = 1;
    this.isGameOver = false
    this.winner = null
    this.gameOverReason = null
  }

  private getPlayer(playerId: bigint): Result<Player, string> {
    const player = this.players.find((p) => p.id === playerId);
    return player ? ok(player) : err("Player not found");
  }

  private getEnemy(playerId: bigint): Result<Player, string> {
    const enemy = this.players.find(p => p.id !== playerId);
    return enemy ? ok(enemy) : err("Enemy not found");
  }

  give15seconds(playerId: bigint): Result<void, string> {
    return this.validateTimedGame()
      .andThen(() => this.getEnemy(playerId))
      .map(enemy => {
        enemy.timeLeftMs += 15 * 1000
      })
  }

  private validateTimedGame(): Result<void, string> {
    return this.isTimed
      ? ok(undefined)
      : err("This game doesn't use time controls");
  }

  move(playerId: bigint, move: MoveObject): Result<void, string> {
    return this.getPlayer(playerId)
      .andThen((player) => this.validatePlayerTurn(player))
      .andThen((player) => this.validatePromotion(move, player))
      .andThen((player) => this.validateTimeControl(player))
      .andThen((player) => this.safeMove(player, move))
      .andThen((player) => this.checkGameOver(player));
  }

  private validatePlayerTurn(player: Player): Result<Player, string> {
    return player.color === this.chess.turn()
      ? ok(player)
      : err("Not your turn");
  }

  private validatePromotion(move: MoveObject, player: Player): Result<Player, string> {
    return !move.promotion || ["q", "r", "b", "n"].includes(move.promotion)
      ? ok(player)
      : err("Invalid promotion");
  }

  private validateTimeControl(player: Player): Result<Player, string> {
    const currentTime = Date.now();
    if (this.chess.history().length > 1 && player.timeLeftMs) {
      if (!this.gameStartTime) {
        this.gameStartTime = currentTime;
        this.lastTurnStartTime = currentTime;
      } else {
        if (!this.lastTurnStartTime) {
          return err("Last turn start time missing");
        }
        const timeSpent = currentTime - this.lastTurnStartTime;
        player.timeLeftMs = Math.max(1, player.timeLeftMs - timeSpent);
        if (player.timeLeftMs <= 1) {
          return err("Time ran out");
        }
      }
    }
    return ok(player);
  }

  private safeMove(player: Player, move: MoveObject) {
    const moveResult = Result.fromThrowable(
      () => this.chess.move(move),
      () => "Invalid move"
    )();
    player.lastMoveTimestamp = Date.now();
    this.lastTurnStartTime = Date.now();
    return moveResult.map(() => player)
  }

  private checkGameOver(player: Player) {
    if (this.chess.isCheckmate()) {
      player.wins++;
      this.isGameOver = true;
      this.winner = player.id;
      this.gameOverReason = "checkmate"
    } else if (this.chess.isDraw()) {
      this.isGameOver = true;
      this.gameOverReason = "draw"
    } else if (this.chess.isDrawByFiftyMoves()) {
      this.isGameOver = true;
      this.gameOverReason = "draw by fifty moves"
    } else if (this.chess.isInsufficientMaterial()) {
      this.isGameOver = true;
      this.gameOverReason = "insufficient material"
    } else if (this.chess.isStalemate()) {
      this.isGameOver = true;
      this.gameOverReason = "stalemate"
    } else if (this.chess.isThreefoldRepetition()) {
      this.isGameOver = true;
      this.gameOverReason = "threefold repetition"
    }
    return ok(undefined);
  }
}

