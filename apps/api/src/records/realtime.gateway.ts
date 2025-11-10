import { Logger } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { SOCKET_EVENT_NAMESPACE } from '@cad/shared';

@WebSocketGateway({ namespace: SOCKET_EVENT_NAMESPACE, cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly config: ConfigService) {}

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  emit(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
