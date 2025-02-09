CREATE MIGRATION m1mcggtjajcvjp4rvwgn3opicc2lzp3u7krtk7nnpepbdut5n453na
    ONTO m1ppjqukrf2do6fdfoyyvcyj4y4ihnb2r6tppfhxuipqzykzx4cuva
{
  ALTER TYPE default::Game {
      CREATE REQUIRED PROPERTY createdAt: std::int64 {
          SET REQUIRED USING (0);
      };
  };
};
