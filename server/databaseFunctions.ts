import * as edgedb from "edgedb"
import e from "../dbschema/edgeql-js";
import { Game } from "./Game";

export async function initDatabase(
  client: edgedb.Client,
  roomId: string,
  userId: bigint,
  game: Game,
) {
  // room
  let roomDb = await e.select(e.Room, (room) => ({
    ...e.Room['*'],
    filter_single: e.op(room.roomId, "=", e.str(roomId))
  })).run(client);
  if (roomDb === null) {
    const chatId = BigInt(1);
    const chatType = "private";
    await e.insert(e.Room, { roomId, chatId, chatType }).run(client);
    roomDb = await e.select(e.Room, (room) => ({
      ...e.Room['*'],
      filter_single: e.op(room.roomId, "=", e.str(roomId))
    })).run(client);
  }
  if (roomDb === null) return;

  // game
  let gameDb = (await e.select(e.Game, (game) => ({
    ...e.Game['*'],
    order_by: { expression: game.createdAt, direction: e.DESC },
    limit: 1
  })).run(client))[0];
  if (!gameDb) {
    await e.insert(e.Game, {
      createdAt: game.createdAt,
      spectators: game.spectators,
      gameStartTime: game.gameStartTime,
      isGameOver: game.isGameOver,
      isTimed: game.isTimed,
      lastTurnStartTime: game.lastTurnStartTime,
      totalTime: game.totalTime,
      winner: '',
      moves: game.chess.history({ verbose: true }).map(move => move.lan),
    }).run(client);
  }
  gameDb = (await e.select(e.Game, (game) => ({
    ...e.Game['*'],
    order_by: { expression: game.createdAt, direction: e.DESC },
    limit: 1
  })).run(client))[0];
  if (!gameDb) return;

  await e.update(e.Room, (room) => ({
    filter: e.op(room.roomId, '=', roomId),
    set: {
      games: {
        '+=': e.select(e.Game, (game) => ({
          filter: e.op(game.id, '=', e.uuid(gameDb.id)),
        })),
      },
    }
  })).run(client);

  let userDb = await e.select(e.User, (user) => ({
    ...e.User['*'],
    filter_single: e.op(
      user.userId,
      "=",
      e.bigint(userId)
    )
  })).run(client);
  if (userDb === null) {
    const dbUserId = (await e.insert(e.User, { userId: userId }).run(client)).id;
    userDb = await e.select(e.User, (user) => ({
      ...e.User['*'],
      filter_single: e.op(user.id, "=", e.uuid(dbUserId))
    })).run(client);
  }
  if (userDb === null) return;

  // Select the game along with its players (including the nested user field).
  const gameWithPlayers = (await e.select(e.Game, (g) => ({
    ...e.Game['*'],
    players: {
      ...e.Player['*'],
      user: { ...e.User['*'] }
    },
    filter: e.op(g.id, '=', e.uuid(gameDb.id))
  })).run(client))[0];

  if (gameWithPlayers !== undefined) {
    // Extract existing player userIds using the external bigint field 'userId'.
    const existingUserIds = gameWithPlayers.players
      .filter(p => p.user !== null)
      .map(p => p.user!.userId);

    // For each local player not yet in DB, add the player.
    for (const localPlayer of game.players) {
      if (!existingUserIds.includes(localPlayer.id)) {
        await e.update(e.Game, (g) => ({
          filter: e.op(g.id, '=', e.uuid(gameDb.id)),
          set: {
            players: {
              '+=': e.insert(e.Player, {
                color: localPlayer.color,
                timeLeft: localPlayer.timeLeft,
                wins: localPlayer.wins,
                user: e.select(e.User, (u) => ({
                  filter: e.op(u.userId, '=', e.bigint(localPlayer.id))
                })).assert_single()
              })
            }
          }
        })).run(client);
      }
    }
  }
}


export async function updateGame(
  client: edgedb.Client,
  game: Game,
) {
  // Fetch the latest game entry for the room
  let gameDb = (await e.select(e.Game, (game) => ({
    ...e.Game['*'],
    order_by: { expression: game.createdAt, direction: e.DESC },
    limit: 1
  })).run(client))[0];

  if (!gameDb) return;

  // Update game state
  await e.update(e.Game, (g) => ({
    filter: e.op(g.id, '=', e.uuid(gameDb.id)),
    set: {
      moves: game.chess.history({ verbose: true }).map(move => move.lan),
      lastTurnStartTime: game.lastTurnStartTime,
      isGameOver: game.isGameOver,
      winner: game.winner || '',
    },
  })).run(client);

  // Update player stats
  await Promise.all(
    game.players.map(async (player) => {
      await e.update(e.Player, (p) => ({
        filter: e.op(p.user.userId, '=', e.bigint(player.id)),
        set: {
          timeLeft: player.timeLeft,
          wins: player.wins,
        },
      })).run(client);
    })
  );
}

export async function createNewGame(
  client: edgedb.Client,
  roomId: string,
  game: Game,
) {
  // Insert new game entry
  const newGame = await e.insert(e.Game, {
    createdAt: game.createdAt,
    spectators: game.spectators,
    gameStartTime: game.gameStartTime,
    isGameOver: game.isGameOver,
    isTimed: game.isTimed,
    lastTurnStartTime: game.lastTurnStartTime,
    moves: game.chess.history({ verbose: true }).map(move => move.lan),
    totalTime: game.totalTime,
    winner: '',
  }).run(client);

  // Assign new game to the room
  await e.update(e.Room, (room) => ({
    filter: e.op(room.roomId, '=', roomId),
    set: {
      games: {
        '+=': e.select(e.Game, (g) => ({
          filter: e.op(g.id, '=', e.uuid(newGame.id)),
        })),
      },
    },
  })).run(client);

  // Add players to the new game
  await Promise.all(
    game.players.map(async (player) => {
      await e.insert(e.Player, {
        color: player.color,
        timeLeft: player.timeLeft,
        wins: player.wins,
        user: e.select(e.User, (u) => ({
          filter: e.op(u.userId, '=', e.bigint(player.id)),
        })).assert_single(),
      }).run(client);
    })
  );
}
