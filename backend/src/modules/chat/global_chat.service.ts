import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from 'src/common/services/socket.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Injectable()
export class GlobalChatService {

  constructor(private readonly prismaService: PrismaService,
    private readonly socketService: SocketService,
    private readonly globalHelperService: GlobalHelperService) { }

  async create(server: Server, client: Socket, messageTxt: string) {
    const userId = this.socketService.getUserId(client.id);

    const entry = await this.prismaService.global_chat.create({
      data: {
        message_text: messageTxt,
        sender_id: userId,
      },
      include: {
        globalm_sender: true,
      }
    });

    const message = {
      messageId: entry.id,
      senderId: entry.sender_id,
      senderNickname: entry.globalm_sender.nickname,
      message: entry.message_text,
      createdAt: entry.created_at,
    };

    // server.emit('createChat', message);
    // Get all connected sockets
    const connectedSockets = Object.values(server.sockets.sockets);

    const filteredSocketsPromises = connectedSockets.filter(async (socket) => {
      // get userId from socket, to check if user (associated with that socket) is blocked by the sender or the sender is blocked by the user
      const socketUserId = this.socketService.getUserId(socket.id);

      return !(await this.globalHelperService.isBlocked(userId, socketUserId) || await this.globalHelperService.isBlocked(entry.sender_id, userId));
    });

    const filteredSockets = await Promise.all(filteredSocketsPromises);

    // send message to all sockets that are not blocked by the sender-
    // and the sender is not blocked by the user associated with the socket
    filteredSockets.forEach(socket => {
      socket.emit('createChat', message);
    });

  }

  async findAll(server: Server, client: Socket) {
    const userId = this.socketService.getUserId(client.id);

    const entries = await this.prismaService.global_chat.findMany({
      include: {
        globalm_sender: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const messages = entries.map(entry => {
      return {
        messageId: entry.id,
        senderId: entry.sender_id,
        senderNickname: entry.globalm_sender.nickname,
        avatar: entry.globalm_sender.avatar,
        senderStatus: entry.globalm_sender.status,
        message: entry.message_text,
        createdAt: entry.created_at,
      };
    });

    const filteredMessagesPromises = messages.filter(async (message) => {
      return !(await this.globalHelperService.isBlocked(userId, message.senderId) ||
        await this.globalHelperService.isBlocked(message.senderId, userId));
    });

    const filteredMessages = await Promise.all(filteredMessagesPromises);

    server.to(client.id).emit('findAll', filteredMessages);
  }

  async update(server: Server, client: Socket, userId: number, messageDto: MessageDto) {
    const entry = await this.prismaService.global_chat.findUnique({
      where: {
        id: messageDto.messageId,
        sender_id: userId,
      },
    });
    if (!entry) {
      server.to(client.id).emit('error', { error: 'You are not allowed to update this message' });
    }
    await this.prismaService.global_chat.update({
      where: {
        id: messageDto.messageId,
      },
      data: {
        message_text: messageDto.message,
      }
    });
    // broadcast to all clients
    server.emit('updateGlobalChat', messageDto);
  }

  async remove(server: Server, client: Socket, userId: number, messageId: number) {
    const entry = await this.prismaService.global_chat.findUnique({
      where: {
        id: messageId,
        sender_id: userId,
      },
    });
    if (!entry) {
      server.to(client.id).emit('error', { error: 'You are not allowed to delete this message' });
      return;
    }
    // broadcast to all clients
    server.emit('removeGlobalChat', messageId);

    // delete message
    await this.prismaService.global_chat.delete({
      where: {
        id: messageId,
      },
    });
  }

  async getUsers() {
    const entries = await this.prismaService.user.findMany({
      where: {
        status: 'online',
      },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        status: true,
      }
    });
    return entries;
  }

  async socketDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // delete connection
    const userId = this.socketService.delete(client.id);

    console.log('UserID: ' + userId);
    if (userId === undefined) {
      return;
    }
    // check if user has other socket_id
    const sockets = this.socketService.getSockets(userId);

    if (sockets.length === 0) {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          status: 'offline',
        }
      });
    }
  }
}
