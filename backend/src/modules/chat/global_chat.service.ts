import { Injectable } from '@nestjs/common';
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
    console.log(server.of('/chat').sockets);
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
}
