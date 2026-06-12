import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Post } from 'src/common/entities/post.entity';

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

/**
 * Pushes board changes to every connected client in <2s (RNF-03). Clients must
 * present a valid access token in the handshake (`auth.token`) or they are
 * disconnected — administrative/data actions stay behind authentication (RNF-09).
 */
@WebSocketGateway({ cors: { origin: corsOrigins, credentials: true } })
export class PostsGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(PostsGateway.name);

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

  emitCreated(post: Post): void {
    this.server?.emit('post:created', post);
  }

  emitUpdated(post: Post): void {
    this.server?.emit('post:updated', post);
  }

  emitDeleted(id: number): void {
    this.server?.emit('post:deleted', { id });
  }
}
