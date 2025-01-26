import 'reflect-metadata';
import { Server as SocketIOServer } from "socket.io";

// All events and their payloads defined in one place
interface ClientToServerEvents {
  "join game": (payload: { gameId: string; userId: string }) => void;
  "leave game": (payload: { gameId: string; userId: string }) => void;
  "start new game": (payload: { gameSettings: object }) => void;
  "make move": (payload: { move: string; userId: string }) => void;
  "time is out": (payload: { gameId: string }) => void;
  "give 15 seconds": (payload: { gameId: string; userId: string }) => void;
  "propose a takeback": (payload: { gameId: string; userId: string }) => void;
  "accept a takeback": (payload: { gameId: string; userId: string }) => void;
  "decline a takeback": (payload: { gameId: string; userId: string }) => void;
  "offer draw": (payload: { gameId: string }) => void;
  "accept draw": (payload: { gameId: string }) => void;
  "decline draw": (payload: { gameId: string }) => void;
  "resign": (payload: { gameId: string; userId: string }) => void;
}

interface ServerToClientEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

const io = new SocketIOServer<
  ClientToServerEvents, ServerToClientEvents, SocketData
>({
  cors: {
    origin: JSON.parse(process.env.CORS_ORIGINS || "[]"),
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join game", (payload) => {
    console.log("Join game:", payload);
  });

  socket.on("leave game", (payload) => {
    console.log("Leave game:", payload);
  });

  socket.on("start new game", (payload) => {
    console.log("Start new game:", payload);
  });

  socket.on("make move", (payload) => {
    console.log("Make move:", payload);
  });

  socket.on("time is out", (payload) => {
    console.log("Time is out:", payload);
  });

  socket.on("give 15 seconds", (payload) => {
    console.log("Give 15 seconds:", payload);
  });

  socket.on("propose a takeback", (payload) => {
    console.log("Propose takeback:", payload);
  });

  socket.on("accept a takeback", (payload) => {
    console.log("Accept takeback:", payload);
  });

  socket.on("decline a takeback", (payload) => {
    console.log("Decline takeback:", payload);
  });

  socket.on("offer draw", (payload) => {
    console.log("Offer draw:", payload);
  });

  socket.on("accept draw", (payload) => {
    console.log("Accept draw:", payload);
  });

  socket.on("decline draw", (payload) => {
    console.log("Decline draw:", payload);
  });

  socket.on("resign", (payload) => {
    console.log("Resign:", payload);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = Number(process.env.SOCKETS_PORT || "3000");
io.listen(port);

console.log(`Server is running at http://localhost:${port}`);
