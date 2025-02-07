CREATE MIGRATION m1zyybpp4u5vzroulah74rauknvezgbesx57hnuf5oph77iz6vj2nq
    ONTO m1vegpxb3odf7j6rsioor2j5zcassvioypuixdcfujquycuufa3k2a
{
  DROP TYPE default::Movie;
  DROP TYPE default::Person;
  CREATE TYPE default::Room {
      CREATE REQUIRED PROPERTY roomId: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.roomId);
      CREATE REQUIRED PROPERTY chatId: std::bigint;
      CREATE REQUIRED PROPERTY chatType: std::str;
  };
};
