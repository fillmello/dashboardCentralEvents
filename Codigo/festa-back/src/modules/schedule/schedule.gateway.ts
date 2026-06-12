import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Pushes schedule changes to all clients in <2s (RNF-03). A single
// `schedule:changed` signal is emitted; clients refetch the ordered list.
@WebSocketGateway({ cors: { origin: corsOrigins, credentials: true } })
export class ScheduleGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(ScheduleGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers.authorization?.replace('Bearer ', '');
    try {
      if (!token) throw new Error('missing token');
      this.jwtService.verify(token);
    } catch {
      this.logger.warn(`Rejected unauthenticated socket ${client.id}`);
      client.disconnect(true);
    }
  }

  emitChanged(): void {
    this.server?.emit('schedule:changed');
  }
}
