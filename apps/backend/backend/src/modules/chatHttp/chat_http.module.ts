import { Module } from '@nestjs/common';
import { ChatHttpService } from './chat_http.service';
import { ChatHttpController } from './chat_http.controller';
import { GlobalHelperService } from 'src/common/services/global_helper.service';

@Module({
  controllers: [ChatHttpController],
  providers: [ChatHttpService, GlobalHelperService],
})
export class ChatHttpModule { }
