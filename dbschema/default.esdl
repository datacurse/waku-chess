module default {
  type Room {
    required roomId: str {
      constraint exclusive;
    }
    required chatId: bigint;
    required chatType: str;
    index on (.roomId);
    multi games: Game;
  }

  type Game {
    required createdAt: int64;
    required spectators: array<bigint>;
    required isTimed: bool;
    required totalTime: int64;
    required gameStartTime: int64;
    required lastTurnStartTime: int64;
    required isGameOver: bool;
    required winner: str {
      constraint one_of('w', 'b', '');
    };
    required moves: array<str>;
    multi players: Player;
  }

  type Player {
    required color: str {
      constraint one_of('w', 'b');
    };
    required timeLeft: int64;
    required wins: int64;
    single user: User;
  }

  type User {
    required userId: bigint {
      constraint exclusive;
    }
    optional name: str;
  }
}

