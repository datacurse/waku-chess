import { Server as SocketIOServer } from "socket.io";
import * as SocketIOParser from '@kim5257/socket.io-parser-bigint';
import { ChatType, Game, GameSnapshot } from "./Game";
import { Chess, Move } from "chess.js";

// Events with explicit parameters
export interface ClientToServerEvents {
  "join game": (roomId: string, userId: bigint) => void;
  "start new game": (
    time: number | undefined,
    side: "w" | "b" | "random"
  ) => void;
  "make move": (userId: bigint, move: Move) => void;
  "time is out": () => void;
  "give 15 seconds": () => void;
  "propose a takeback": (gameId: string, userId: string) => void;
  "accept a takeback": (gameId: string, userId: string) => void;
  "decline a takeback": (gameId: string, userId: string) => void;
  "offer draw": (gameId: string) => void;
  "accept draw": (gameId: string) => void;
  "decline draw": (gameId: string) => void;
  "resign": () => void;
}

export interface ServerToClientEvents {
  gameSnapshot: (gameSnapshot: GameSnapshot) => void;
  ping: () => void;
}

export interface SocketData {
  roomId: string;
  userId: bigint;
}

const io = new SocketIOServer<
  ClientToServerEvents, ServerToClientEvents, SocketData
>({
  cors: {
    origin: "*",
  },
  parser: SocketIOParser,
});

class GamesManager {
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

const gamesManager = new GamesManager();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join game", (roomId, userId) => {
    socket.data = { roomId, userId };
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return
    game.joinUser(userId)
    socket.join(roomId);
    io.in(roomId).emit("gameSnapshot", game.getSnapshot())
  });

  socket.on("start new game", (time, side) => {
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return
    game.startNewGame(userId, side, time)
    io.in(roomId).emit("gameSnapshot", game.getSnapshot())
  });

  socket.on("make move", (userId, move) => {
    const { roomId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return
    game.move(userId, move)
    io.in(roomId).emit("gameSnapshot", game.getSnapshot())
  });

  socket.on("time is out", () => {
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return
    game.timeout(userId)
    io.in(roomId).emit("gameSnapshot", game.getSnapshot())
  });

  socket.on("give 15 seconds", () => {
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return
    game.resign(userId)
    io.in(roomId).emit("gameSnapshot", game.getSnapshot())
  });

  socket.on("propose a takeback", (gameId, userId) => {
    console.log("Propose takeback:", gameId, userId);
  });

  socket.on("accept a takeback", (gameId, userId) => {
    console.log("Accept takeback:", gameId, userId);
  });

  socket.on("decline a takeback", (gameId, userId) => {
    console.log("Decline takeback:", gameId, userId);
  });

  socket.on("offer draw", (gameId) => {
    console.log("Offer draw:", gameId);
  });

  socket.on("accept draw", (gameId) => {
    console.log("Accept draw:", gameId);
  });

  socket.on("decline draw", (gameId) => {
    console.log("Decline draw:", gameId);
  });

  socket.on("resign", () => {
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return
    game.resign(userId)
    io.in(roomId).emit("gameSnapshot", game.getSnapshot())
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return
    game.disconnectUser(userId)
    io.in(roomId).emit("gameSnapshot", game.getSnapshot())
  });
});

const port = Number(process.env.SOCKETS_PORT || "3000");
io.listen(port);

console.log(`Server is running at http://localhost:${port}`);
