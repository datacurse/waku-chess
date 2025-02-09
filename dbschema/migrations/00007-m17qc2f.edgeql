CREATE MIGRATION m17qc2fkusihjf67hqyyn25kaueww3tntyzua6iqrh4bkchept4zmq
    ONTO m1mcggtjajcvjp4rvwgn3opicc2lzp3u7krtk7nnpepbdut5n453na
{
  ALTER TYPE default::Game {
      DROP LINK players;
      CREATE MULTI LINK players: default::Player;
  };
  ALTER TYPE default::GamePlayer {
      DROP LINK player;
      DROP PROPERTY color;
  };
  ALTER TYPE default::GamePlayer {
      DROP PROPERTY timeLeft;
  };
  ALTER TYPE default::GamePlayer {
      DROP PROPERTY wins;
  };
  ALTER TYPE default::GamePlayer RENAME TO default::User;
  ALTER TYPE default::Player {
      CREATE REQUIRED LINK user: default::User {
          SET REQUIRED USING (<default::User>{});
      };
  };
  ALTER TYPE default::Player {
      CREATE REQUIRED PROPERTY color: std::str {
          SET REQUIRED USING (<std::str>{});
          CREATE CONSTRAINT std::one_of('w', 'b');
      };
  };
  ALTER TYPE default::Player {
      DROP PROPERTY name;
      DROP PROPERTY playerId;
  };
  ALTER TYPE default::Player {
      CREATE REQUIRED PROPERTY timeLeft: std::int64 {
          SET REQUIRED USING (<std::int64>{});
      };
  };
  ALTER TYPE default::Player {
      CREATE REQUIRED PROPERTY wins: std::int64 {
          SET REQUIRED USING (<std::int64>{});
      };
  };
  ALTER TYPE default::User {
      CREATE OPTIONAL PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY playerId: std::bigint {
          SET REQUIRED USING (<std::bigint>{});
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
