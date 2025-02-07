import { ChatType, Game } from "./Game";
import * as edgedb from "edgedb"
import e from "../dbschema/edgeql-js";

const client = edgedb.createClient()

export class GamesManager {
  games: Record<string, Game>

  constructor() {
    this.games = {}
  }

  async getGame(roomId: string, chatId: bigint, chatType: ChatType): Game {
    const aliveGame = this.getAliveGame(roomId);
    if (aliveGame) return aliveGame
    //arst
    const room = await e
      .insert(e.Room, {
        roomId,
        chatId,
        chatType,
      })
      .run(client);
    //
    const newAliveGame = new Game(roomId, chatId, chatType)
    this.addAliveGame(roomId, newAliveGame)
    return newAliveGame
  }

  getAliveGame(roomId: string): Game | undefined {
    return this.games[roomId]
  }

  addAliveGame(roomId: string, game: Game) {
    this.games[roomId] = game;
  }

  killGame(roomId: string) {
    delete this.games[roomId];
  }
}

