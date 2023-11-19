import { Global, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Module({
  providers: [ChatGateway, ChatService, GlobalHelperService],
})
export class ChatModule { }
