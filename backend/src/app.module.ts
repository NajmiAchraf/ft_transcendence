import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HomeModule } from './modules/home/home.module';
import { ChatModule } from './modules/chat/chat.module';
import { PingPongModule } from './modules/ping-pong/ping-pong.module';
import { ChannelModule } from './modules/chatHttp/chat_http.module';

@Module({
  imports: [AuthModule, UserModule, HomeModule, ChatModule, PingPongModule, ChannelModule],
})

export class AppModule { }
