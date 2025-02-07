CREATE MIGRATION m12ctuq7jcuuijig3o2oo6mdkslda7koiimk3biqvoqttj7obt5bwq
    ONTO m17eelluostoikufvamaq3zrhr6jrwlfvimkg7ut47t2smtw5g5erq
{
  CREATE TYPE default::Player {
      CREATE REQUIRED PROPERTY color: std::str {
          CREATE CONSTRAINT std::one_of('w', 'b');
      };
      CREATE OPTIONAL PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY offers: std::json;
      CREATE REQUIRED PROPERTY online: std::bool;
      CREATE REQUIRED PROPERTY playerId: std::bigint {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY timeLeft: std::int64;
      CREATE REQUIRED PROPERTY wins: std::int64;
  };
  ALTER TYPE default::Game {
      CREATE MULTI LINK players: default::Player;
  };
};
