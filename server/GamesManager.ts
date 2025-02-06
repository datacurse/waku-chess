import { ChatType, Game } from "./Game";

export class GamesManager {
  games: Record<string, Game>

  constructor() {
    this.games = {}
  }

  getGame(id: string, chatId: bigint, chatType: ChatType): Game {
    const aliveGame = this.getAliveGame(id);
    if (aliveGame) return aliveGame
    const newAliveGame = new Game(id, chatId, chatType)
    this.addAliveGame(id, newAliveGame)
    return newAliveGame
  }

  getAliveGame(id: string): Game | undefined {
    return this.games[id]
  }

  addAliveGame(id: string, game: Game) {
    this.games[id] = game;
  }

  killGame(id: string) {
    delete this.games[id];
  }
}

