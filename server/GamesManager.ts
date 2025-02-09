import { ChatType, Game } from "./Game";

export class GamesManager {
  games: Record<string, Game>

  constructor() {
    this.games = {}
  }

  getGame(roomId: string, chatId: bigint, chatType: ChatType): Game {
    const aliveGame = this.getAliveGame(roomId);
    if (aliveGame) return aliveGame
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

