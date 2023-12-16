import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HomeModule } from './modules/home/home.module';
import { ChatModule } from './modules/chat/chat.module';
import { PingPongModule } from './modules/ping-pong/ping-pong.module';
import { ChatHttpModule } from './modules/chatHttp/chat_http.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [AuthModule, UserModule, HomeModule, ChatModule, PingPongModule, ChatHttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),],
})

export class AppModule { }
