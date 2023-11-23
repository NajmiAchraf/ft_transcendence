import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { GlobalHelperService } from 'src/common/services/global_helper.service';
import { SocketService } from 'src/common/services/socket.service';

@Module({
  providers: [ChatGateway, ChatService, GlobalHelperService, SocketService],
})
export class ChatModule { }
