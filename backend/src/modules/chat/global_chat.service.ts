import { Injectable } from '@nestjs/common';
import { Namespace, Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from 'src/common/services/socket.service';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Injectable()
export class GlobalChatService {

  constructor(private readonly prismaService: PrismaService,
    private readonly socketService: SocketService,
    private readonly globalHelperService: GlobalHelperService) { }

  async create(server: Namespace, client: Socket, messageTxt: string) {
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
      sender_id: entry.sender_id,
      nickname: entry.globalm_sender.nickname,
      message_text: entry.message_text,
      avatar: entry.globalm_sender.avatar,
      status: entry.globalm_sender.status,
      created_at: entry.created_at,
    };

    const filteredSockets = await this.socketService.filterSockets(userId, Array.from(server.sockets.values()));

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
