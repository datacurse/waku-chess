import { type Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../server/server";
import * as SocketIOParser from '@kim5257/socket.io-parser-bigint';

export const socket: Socket<
  ServerToClientEvents,
  ClientToServerEvents
> = io("http://localhost:3000", {
  parser: SocketIOParser
});

