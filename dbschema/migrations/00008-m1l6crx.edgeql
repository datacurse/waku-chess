CREATE MIGRATION m1l6crxo4kb6nbig4htnehf4p57zsnvdjunqi27kb4r7hajggvxdoq
    ONTO m17qc2fkusihjf67hqyyn25kaueww3tntyzua6iqrh4bkchept4zmq
{
  ALTER TYPE default::User {
      ALTER PROPERTY playerId {
          RENAME TO userId;
      };
  };
};
