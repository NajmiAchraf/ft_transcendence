import { Module } from '@nestjs/common';
import { GlobalChatService } from './global_chat.service';
import { ChatGateway } from './chat.gateway';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { SocketService } from 'src/common/services/socket.service';
import { ChannelChatService } from './channel_chat.service';
import { ConnectionService } from './connection.service';
import { DmService } from './dm.service';

@Module({
  providers: [ChatGateway, GlobalChatService, GlobalHelperService,
    SocketService, ChannelChatService, ConnectionService, DmService],
})
export class ChatModule { }
