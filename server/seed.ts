import * as edgedb from "edgedb"
import e from "../dbschema/edgeql-js";

const client = edgedb.createClient()

async function addRoom() {
  const roomId = "1"
  const chatId = BigInt(1)
  const chatType = "private"

  const room = await e
    .insert(e.Room, {
      roomId,
      chatId,
      chatType,
    })
    .run(client);

  console.log("Inserted Room:", room);
}

async function addGame() {
  const roomId = "1";

  // Fetch the existing room's UUID
  const room = await e
    .select(e.Room, (room) => ({
      id: true, // Fetch the internal UUID
      filter_single: { roomId }, // Ensuring single object selection
    }))
    .run(client);

  if (!room) {
    console.error(`Room with roomId=${roomId} not found.`);
    return;
  }

  // Insert a new game
  const game = await e
    .insert(e.Game, {
      spectators: [BigInt(3), BigInt(4)],
      isTimed: true,
      totalTime: 1200,
      gameStartTime: Date.now(),
      lastTurnStartTime: Date.now(),
      isGameOver: false,
      winner: "",
      moves: [],
    })
    .run(client);

  // Corrected: Use a subquery to update `games`
  await e
    .update(e.Room, (room) => ({
      filter_single: { id: room.id }, // Reference Room by UUID
      set: {
        games: e.select(e.Game, (g) => ({
          filter_single: { id: game.id }, // Select the newly inserted game
        })),
      },
    }))
    .run(client);

  console.log(`Inserted Game into Room (${roomId}):`, game);
}

// Call the function
addGame();


