CREATE MIGRATION m1ppjqukrf2do6fdfoyyvcyj4y4ihnb2r6tppfhxuipqzykzx4cuva
    ONTO m12ctuq7jcuuijig3o2oo6mdkslda7koiimk3biqvoqttj7obt5bwq
{
  CREATE TYPE default::GamePlayer {
      CREATE REQUIRED LINK player: default::Player;
      CREATE REQUIRED PROPERTY color: std::str {
          CREATE CONSTRAINT std::one_of('w', 'b');
      };
      CREATE REQUIRED PROPERTY timeLeft: std::int64;
      CREATE REQUIRED PROPERTY wins: std::int64;
  };
  ALTER TYPE default::Game {
      ALTER LINK players {
          SET TYPE default::GamePlayer USING (.players[IS default::GamePlayer]);
      };
  };
  ALTER TYPE default::Player {
      DROP PROPERTY color;
      DROP PROPERTY offers;
      DROP PROPERTY online;
      DROP PROPERTY timeLeft;
      DROP PROPERTY wins;
  };
};
