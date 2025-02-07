import { Server as SocketIOServer } from "socket.io";
import * as SocketIOParser from '@kim5257/socket.io-parser-bigint';
import { GameSnapshot } from "./Game";
import { Move } from "chess.js";
import { GamesManager } from "./GamesManager";

// Define all possible command types and their payloads
type Command =
  | { type: "start_new_game"; payload: { time: number | undefined; side: "w" | "b" | "random" } }
  | { type: "make_move"; payload: { move: Move } }
  | { type: "time_is_out" }
  | { type: "give_15_seconds" }
  | { type: "propose_takeback" }
  | { type: "cancel_takeback_offer" }
  | { type: "accept_takeback" }
  | { type: "decline_takeback" }
  | { type: "offer_draw" }
  | { type: "cancel_draw_offer" }
  | { type: "accept_draw" }
  | { type: "decline_draw" }
  | { type: "resign" };

// Update ClientToServerEvents to use single command event
export interface ClientToServerEvents {
  "join game": (roomId: string, userId: bigint) => void;
  "command": (command: Command) => void;
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
  cors: { origin: "*" },
  parser: SocketIOParser,
});

const gamesManager = new GamesManager();

io.on("connection", (socket) => {
  console.log("A user connected");

  // Join game handler remains the same
  socket.on("join game", (roomId, userId) => {
    socket.data = { roomId, userId };
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return;
    game.joinUser(userId);
    socket.join(roomId);
    io.in(roomId).emit("gameSnapshot", game.getSnapshot());
  });

  // Single command handler for all game actions
  socket.on("command", (command) => {
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return;

    switch (command.type) {
      case "start_new_game":
        game.startNewGame(userId, command.payload.side, command.payload.time);
        break;
      case "make_move":
        game.move(userId, command.payload.move);
        break;
      case "time_is_out":
        game.timeout(userId);
        break;
      case "give_15_seconds":
        game.give15seconds(userId);
        break;
      case "propose_takeback":
        game.offerTakeback(userId);
        break;
      case "cancel_takeback_offer":
        game.cancelTakebackOffer(userId);
        break;
      case "accept_takeback":
        game.acceptTakeback(userId);
        break;
      case "decline_takeback":
        game.declineTakeback(userId);
        break;
      case "offer_draw":
        game.offerDraw(userId);
        break;
      case "cancel_draw_offer":
        game.cancelDrawOffer(userId);
        break;
      case "accept_draw":
        game.acceptDraw();
        break;
      case "decline_draw":
        game.declineDraw(userId);
        break;
      case "resign":
        game.resign(userId);
        break;
      default:
        console.warn("Unknown command type:", command);
        return;
    }

    io.in(roomId).emit("gameSnapshot", game.getSnapshot());
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    const { roomId, userId } = socket.data;
    const game = gamesManager.getGame(roomId, userId, "private");
    if (!game) return;
    game.disconnectUser(userId);
    io.in(roomId).emit("gameSnapshot", game.getSnapshot());
  });
});

const port = Number(process.env.SOCKETS_PORT || "3000");
io.listen(port);
console.log(`Server running at http://localhost:${port}`);
