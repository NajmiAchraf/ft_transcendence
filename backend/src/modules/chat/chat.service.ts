import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GlobalChatDto, RemoveChatDto, UpdateChatDto } from './dto/global_chat.dto';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {

  constructor(private readonly prismaService: PrismaService) { }

  async create(server: Server, client: Socket, globalChat: GlobalChatDto) {
    // TODO:: save to db
    const user = await this.prismaService.user_socket.findUnique({
      where: {
        socket_id: client.id,
      },
      select: {
        user_id: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const entry = await this.prismaService.global_chat.create({
      data: {
        message_text: globalChat.message,
        sender_id: user.user_id,
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
    // console.log(createChatDto);
    return globalChat;
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

  async update(server: Server, client: Socket, updateChatDto: UpdateChatDto) {
    const entry = await this.prismaService.global_chat.findUnique({
      where: {
        id: updateChatDto.messageId,
        sender_id: updateChatDto.userId,
      },
    });
    if (!entry) {
      server.to(client.id).emit('error', { error: 'You are not allowed to update this message' });
    }
    await this.prismaService.global_chat.update({
      where: {
        id: updateChatDto.messageId,
      },
      data: {
        message_text: updateChatDto.message,
      }
    });
  }


  async remove(server: Server, client: Socket, removeChatDto: RemoveChatDto) {
    console.log(removeChatDto);
    const entry = await this.prismaService.global_chat.findUnique({
      where: {
        id: removeChatDto.messageId,
        sender_id: removeChatDto.userId,
      },
    });
    if (!entry) {
      server.to(client.id).emit('error', { error: 'You are not allowed to delete this message' });
      return;
    }
    await this.prismaService.global_chat.delete({
      where: {
        id: removeChatDto.messageId,
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
    // console.log(client.handshake.query['accessToken']);
    // const id: string = ;
    const entry = await this.prismaService.user_socket.delete({
      where: {
        socket_id: client.id,
      }
    });

    // send updated users list to all clients
    client.broadcast.emit('users', await this.getUsers());

    // check if user has other socket_id
    const entries = await this.prismaService.user_socket.findMany({
      where: {
        user_id: entry.user_id,
      }
    });
    console.log(entries.length);
    if (entries.length !== 0) {
      return;
    }
    await this.prismaService.user.update({
      where: {
        id: entry.user_id,
      },
      data: {
        status: 'offline',
      }
    });
  }
}
