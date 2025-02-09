CREATE MIGRATION m1g26o5qf4bgwan25waumbiqjdf7kf5nwimhbc7aex2jh6vwaeah2a
    ONTO m1l6crxo4kb6nbig4htnehf4p57zsnvdjunqi27kb4r7hajggvxdoq
{
  ALTER TYPE default::Player {
      ALTER LINK user {
          SET SINGLE;
          RESET OPTIONALITY;
      };
  };
};
