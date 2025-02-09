CREATE MIGRATION m1vhw3p27i3tcimxlpenalsdeakux2qbvqngg5gdxxi5efmgtke55q
    ONTO m1g26o5qf4bgwan25waumbiqjdf7kf5nwimhbc7aex2jh6vwaeah2a
{
  ALTER TYPE default::Game {
      ALTER PROPERTY moves {
          SET TYPE array<std::str> USING (<array<std::str>>[]);
      };
  };
};
