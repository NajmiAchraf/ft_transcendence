import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from 'src/common/services/socket.service';

@Injectable()
export class ChatService {

  constructor(private readonly prismaService: PrismaService,
    private readonly socketService: SocketService) { }

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

    server.emit('createChat', message);
  }

  async findAll(server: Server,) {
    const entries = await this.prismaService.global_chat.findMany({
      include: {
        globalm_sender: true,
      }
    });

    const messages = entries.map(entry => {
      return {
        messageId: entry.id,
        senderId: entry.sender_id,
        senderNickname: entry.globalm_sender.nickname,
        Avatar: entry.globalm_sender.avatar,
        senderStatus: entry.globalm_sender.status,
        message: entry.message_text,
        createdAt: entry.created_at,
      };
    });
    return messages;
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
  }

  async remove(server: Server, client: Socket, userId: number, messageDto: MessageDto) {
    const entry = await this.prismaService.global_chat.findUnique({
      where: {
        id: messageDto.messageId,
        sender_id: userId,
      },
    });
    if (!entry) {
      server.to(client.id).emit('error', { error: 'You are not allowed to delete this message' });
      return;
    }
    await this.prismaService.global_chat.delete({
      where: {
        id: messageDto.messageId,
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

    // send updated users list to all clients
    client.broadcast.emit('users', await this.getUsers());
  }
}
