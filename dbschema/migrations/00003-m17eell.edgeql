CREATE MIGRATION m17eelluostoikufvamaq3zrhr6jrwlfvimkg7ut47t2smtw5g5erq
    ONTO m1zyybpp4u5vzroulah74rauknvezgbesx57hnuf5oph77iz6vj2nq
{
  CREATE TYPE default::Game {
      CREATE REQUIRED PROPERTY spectators: array<std::bigint>;
      CREATE REQUIRED PROPERTY gameStartTime: std::int64;
      CREATE REQUIRED PROPERTY isGameOver: std::bool;
      CREATE REQUIRED PROPERTY isTimed: std::bool;
      CREATE REQUIRED PROPERTY lastTurnStartTime: std::int64;
      CREATE REQUIRED PROPERTY moves: array<std::json>;
      CREATE REQUIRED PROPERTY totalTime: std::int64;
      CREATE REQUIRED PROPERTY winner: std::str {
          CREATE CONSTRAINT std::one_of('w', 'b', '');
      };
  };
  ALTER TYPE default::Room {
      CREATE MULTI LINK games: default::Game;
  };
};
