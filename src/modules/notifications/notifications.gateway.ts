import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UnauthorizedException, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.NEXTAUTH_URL,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Cliente intentando conectar: ${client.id}`);
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token de autenticación no encontrado');
      }

      const validatedUser = await this.authService.validateToken(token);

      client.data.user = validatedUser;

      this.logger.log(
        `Cliente autenticado: ${client.id} - Usuario: ${validatedUser.email}`,
      );
    } catch (error) {
      this.logger.warn(
        `Autenticación fallida (${client.id}): ${error.message}`,
      );
      client.emit('error', 'No autorizado: token inválido o ausente');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const user = client.data?.user?.email || 'desconocido';
    this.logger.log(`Cliente desconectado: ${client.id} - Usuario: ${user}`);
  }

  @SubscribeMessage('joinPostRoom')
  handleJoinPostRoom(client: Socket, postId: string): void {
    if (!postId) return;
    client.join(`post-${postId}`);
    this.logger.log(
      `Usuario ${client.data?.user?.email || client.id} se unió a post-${postId}`,
    );
  }

  @SubscribeMessage('leavePostRoom')
  handleLeavePostRoom(client: Socket, postId: string): void {
    if (!postId) return;
    client.leave(`post-${postId}`);
    this.logger.log(
      `Usuario ${client.data?.user?.email || client.id} salió de post-${postId}`,
    );
  }

  sendNewPostNotification(): void {
    this.server.emit('newPostNotification', {
      message: 'Se ha publicado un nuevo post',
    });
    this.logger.log('Notificación global de nuevo post enviada');
  }

  sendPostUpdate(postId: string, data: any): void {
    this.server.to(`post-${postId}`).emit('postUpdated', data);
    this.logger.log(`Actualización enviada a post-${postId}`, data);
  }
}
