import { Color } from "chess.js";
import { Game, GameSnapshot } from "./Game";

export type ChatType =
  | "sender"
  | "private"
  | "channel"
  | "group"
  | "supergroup";

class Player {
  id: bigint;
  name: null | string;
  color: null | Color

  constructor(id: bigint, color: Color) {
    this.id = id
    this.name = null
    this.color = color
  }
}


export interface RoomSnapshot {
  readonly roomId: string;
  readonly chatId: bigint;
  readonly chatType: ChatType;
  readonly onlineUsers: readonly bigint[];
  readonly players: readonly Readonly<PlayerSnapshot>[];
  readonly game: Readonly<GameSnapshot>;
}

interface PlayerSnapshot {
  readonly id: bigint;
  readonly name: string | null;
  readonly color: Color | null;
}

export class Room {
  roomId: string;
  chatId: bigint;
  chatType: ChatType;
  onlineUsers: bigint[];
  players: Player[];
  game: Game;

  constructor(roomId: string, chatId: bigint, chatType: ChatType) {
    this.roomId = roomId;
    this.chatId = chatId;
    this.chatType = chatType;
    this.onlineUsers = [];
    this.players = [];
    this.game = new Game()
  }

  joinUser(id: bigint): boolean {
    if (this.onlineUsers.includes(id)) { return false }
    this.onlineUsers.push(id);
    if (this.players.length >= 2) { return false }
    const player = this.players.find(player => player.id === id);
    if (player) { return false }
    const color = this.players.length === 0 ? "w" : "b";
    const newPlayer = new Player(id, color);
    this.players.push(newPlayer);
    return true
  }

  disconnectUser(id: bigint) {
    this.onlineUsers = this.onlineUsers.filter(i => i !== id);
  }

  getSnapshot(): Readonly<RoomSnapshot> {
    const snapshot: RoomSnapshot = {
      roomId: this.roomId,
      chatId: this.chatId,
      chatType: this.chatType,
      onlineUsers: [...this.onlineUsers] as readonly bigint[],
      players: this.players.map(player => Object.freeze({
        id: player.id,
        name: player.name,
        color: player.color
      })),
      game: this.game.getSnapshot()
    };
    return Object.freeze(snapshot);
  }
}


