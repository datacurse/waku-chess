import 'reflect-metadata';
import { Server as SocketIOServer } from "socket.io";
import { ChatType, Room, RoomSnapshot } from '../game/Room';

// Events with explicit parameters
interface ClientToServerEvents {
  "join game": (roomId: string, userId: bigint) => void;
  "leave game": (gameId: string, userId: string) => void;
  "start new game": (gameSettings: object) => void;
  "make move": (move: string, userId: string) => void;
  "time is out": (gameId: string) => void;
  "give 15 seconds": (gameId: string, userId: string) => void;
  "propose a takeback": (gameId: string, userId: string) => void;
  "accept a takeback": (gameId: string, userId: string) => void;
  "decline a takeback": (gameId: string, userId: string) => void;
  "offer draw": (gameId: string) => void;
  "accept draw": (gameId: string) => void;
  "decline draw": (gameId: string) => void;
  "resign": (gameId: string, userId: string) => void;
}

interface ServerToClientEvents {
  roomSnapshot: (roomSnapshot: RoomSnapshot) => void;
}

export interface SocketData {
  roomId: string;
  tgUserId: bigint;
}

const io = new SocketIOServer<
  ClientToServerEvents, ServerToClientEvents, SocketData
>({
  cors: {
    origin: JSON.parse(process.env.CORS_ORIGINS || "[]"),
  },
});

class RoomsManager {
  rooms: Record<string, Room>

  constructor() {
    this.rooms = {}
  }

  getRoom(id: string, chatId: bigint, chatType: ChatType): Room {
    const aliveRoom = this.getAliveRoom(id);
    if (aliveRoom) return aliveRoom
    const newAliveRoom = new Room(id, chatId, chatType)
    this.addAliveRoom(id, newAliveRoom)
    return newAliveRoom
  }

  getAliveRoom(id: string): Room | undefined {
    return this.rooms[id]
  }

  addAliveRoom(id: string, room: Room) {
    this.rooms[id] = room;
  }

  killRoom(id: string) {
    delete this.rooms[id];
  }
}

const roomsManager = new RoomsManager();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join game", (roomId, userId) => {
    socket.join(roomId);
    const room = roomsManager.getRoom(roomId, userId, "private");
    if (!room) return
    room.joinUser(userId)
    socket.join(roomId);
    io.in(roomId).emit("roomSnapshot", room.getSnapshot())
  });

  socket.on("leave game", (gameId, userId) => {
    console.log("Leave game:", gameId, userId);
  });

  socket.on("start new game", (gameSettings) => {
    console.log("Start new game:", gameSettings);
  });

  socket.on("make move", (move, userId) => {
    console.log("Make move:", move, userId);
  });

  socket.on("time is out", (gameId) => {
    console.log("Time is out:", gameId);
  });

  socket.on("give 15 seconds", (gameId, userId) => {
    console.log("Give 15 seconds:", gameId, userId);
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

  socket.on("resign", (gameId, userId) => {
    console.log("Resign:", gameId, userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = Number(process.env.SOCKETS_PORT || "3000");
io.listen(port);

console.log(`Server is running at http://localhost:${port}`);
